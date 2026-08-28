package org.healthrenewal.rawafid;

import android.Manifest;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class ContentSyncWorker extends Worker {
    private static final String BASE="https://healthrenewal.org";
    private static final String NEW_CONTENT_FEED=BASE+"/api/mobile/updates";
    private static final String CHANGE_FEED=BASE+"/api/mobile/content-changes?limit=250";
    private static final Set<String> MEANINGFUL_CHANGE_FIELDS=new HashSet<>(Arrays.asList(
            "title","excerpt","body","taxonomy","references","review","media","disclaimer"
    ));

    public ContentSyncWorker(@NonNull Context c,@NonNull WorkerParameters p){ super(c,p); }

    @NonNull @Override public Result doWork(){
        SecurePrefs prefs=new SecurePrefs(getApplicationContext());
        String selectedRaw=prefs.getSectors();
        Set<String> selected=parseSelected(selectedRaw);
        if(selected.isEmpty()) return Result.success();

        boolean publicationOk=syncNewPublications(prefs,selectedRaw,selected);
        boolean changesOk=syncMeaningfulChanges(prefs,selectedRaw,selected);
        return publicationOk&&changesOk?Result.success():Result.retry();
    }

    private boolean syncNewPublications(SecurePrefs prefs,String selectedRaw,Set<String> selected){
        try {
            List<UpdateItem> items=fetchUpdates();
            if(items.isEmpty()) return true;

            List<UpdateItem> matching=new ArrayList<>();
            long latestPublished=0L;
            for(UpdateItem item:items){
                latestPublished=Math.max(latestPublished,item.publishedAtMillis);
                if(item.matches(selected)) matching.add(item);
            }

            String stateKey="content_cursor_"+Integer.toHexString(selectedRaw.hashCode());
            long previous=prefs.getLastSeen(stateKey);
            if(previous==0L){
                prefs.setLastSeen(stateKey,latestPublished);
                return true;
            }

            List<UpdateItem> fresh=new ArrayList<>();
            long newCursor=previous;
            for(UpdateItem item:matching){
                newCursor=Math.max(newCursor,item.publishedAtMillis);
                if(item.publishedAtMillis>previous) fresh.add(item);
            }

            if(!fresh.isEmpty()) notifyNewContent(fresh);
            prefs.setLastSeen(stateKey,Math.max(newCursor,latestPublished));
            return true;
        } catch(Exception ignored){
            return false;
        }
    }

    private boolean syncMeaningfulChanges(SecurePrefs prefs,String selectedRaw,Set<String> selected){
        try {
            List<ChangeItem> changes=fetchChanges();
            if(changes.isEmpty()) return true;

            long latestChange=0L;
            for(ChangeItem item:changes) latestChange=Math.max(latestChange,item.changedAtMillis);
            String stateKey="change_cursor_"+Integer.toHexString(selectedRaw.hashCode());
            long previous=prefs.getLastSeen(stateKey);
            if(previous==0L){
                prefs.setLastSeen(stateKey,latestChange);
                return true;
            }

            List<ChangeItem> fresh=new ArrayList<>();
            long newCursor=previous;
            for(ChangeItem item:changes){
                newCursor=Math.max(newCursor,item.changedAtMillis);
                if(item.changedAtMillis<=previous) continue;
                if("published".equals(item.eventType)) continue; // handled by the publication feed
                if(!item.hasMeaningfulChange()) continue;
                if(item.matches(selected)) fresh.add(item);
            }

            if(!fresh.isEmpty()) notifyChangedContent(fresh);
            prefs.setLastSeen(stateKey,Math.max(newCursor,latestChange));
            return true;
        } catch(Exception ignored){
            return false;
        }
    }

    private List<UpdateItem> fetchUpdates() throws Exception {
        JSONObject root=fetchJson(NEW_CONTENT_FEED);
        JSONArray updates=root.optJSONArray("updates");
        List<UpdateItem> out=new ArrayList<>();
        if(updates==null) return out;
        for(int i=0;i<updates.length();i++){
            JSONObject item=updates.optJSONObject(i); if(item==null) continue;
            String title=item.optString("title","").trim();
            String path=item.optString("path","").trim();
            String published=item.optString("published_at","").trim();
            JSONArray paths=item.optJSONArray("follow_paths");
            if(title.isEmpty()||!path.startsWith("/")||published.isEmpty()||paths==null) continue;
            long publishedMillis=parseInstant(published); if(publishedMillis<=0L) continue;
            Set<String> followPaths=parsePaths(paths);
            if(!followPaths.isEmpty()) out.add(new UpdateItem(title,path,publishedMillis,followPaths));
        }
        return out;
    }

    private List<ChangeItem> fetchChanges() throws Exception {
        JSONObject root=fetchJson(CHANGE_FEED);
        JSONArray changes=root.optJSONArray("changes");
        List<ChangeItem> out=new ArrayList<>();
        if(changes==null) return out;
        for(int i=0;i<changes.length();i++){
            JSONObject change=changes.optJSONObject(i); if(change==null) continue;
            JSONObject content=change.optJSONObject("content"); if(content==null) continue;
            String title=content.optString("title","").trim();
            String path=content.optString("path","").trim();
            String eventType=change.optString("eventType","").trim();
            long changedAt=parseInstant(change.optString("changedAt",""));
            if(title.isEmpty()||!path.startsWith("/")||eventType.isEmpty()||changedAt<=0L) continue;
            Set<String> followPaths=parsePaths(content.optJSONArray("followPaths"));
            Set<String> changedFields=parseStringSet(change.optJSONArray("changedFields"));
            if(!followPaths.isEmpty()) out.add(new ChangeItem(title,path,eventType,changedAt,followPaths,changedFields));
        }
        return out;
    }

    private JSONObject fetchJson(String endpoint) throws Exception {
        HttpURLConnection con=(HttpURLConnection)new URL(endpoint).openConnection();
        con.setConnectTimeout(10000);
        con.setReadTimeout(15000);
        con.setInstanceFollowRedirects(true);
        con.setRequestProperty("Accept","application/json");
        con.setRequestProperty("User-Agent","RawafidAndroid/1.0 (+https://healthrenewal.org)");
        int code=con.getResponseCode();
        if(code<200||code>=300){ con.disconnect(); throw new IllegalStateException("HTTP "+code); }
        StringBuilder body=new StringBuilder();
        try(BufferedReader r=new BufferedReader(new InputStreamReader(con.getInputStream(),StandardCharsets.UTF_8))){
            String line; while((line=r.readLine())!=null) body.append(line);
        } finally { con.disconnect(); }
        JSONObject root=new JSONObject(body.toString());
        if(!root.optBoolean("ok",false)) throw new IllegalStateException("Feed unavailable");
        return root;
    }

    private Set<String> parseSelected(String raw){
        Set<String> out=new HashSet<>();
        if(raw==null) return out;
        for(String token:raw.split(",")){ String value=token.trim(); if(value.startsWith("/")) out.add(value); }
        return out;
    }

    private Set<String> parsePaths(JSONArray paths){
        Set<String> out=new HashSet<>();
        if(paths==null) return out;
        for(int i=0;i<paths.length();i++){ String value=paths.optString(i,"").trim(); if(value.startsWith("/")) out.add(value); }
        return out;
    }

    private Set<String> parseStringSet(JSONArray values){
        Set<String> out=new HashSet<>();
        if(values==null) return out;
        for(int i=0;i<values.length();i++){ String value=values.optString(i,"").trim(); if(!value.isEmpty()) out.add(value); }
        return out;
    }

    private long parseInstant(String value){
        try { return Instant.parse(value).toEpochMilli(); }
        catch(Exception ignored){ return 0L; }
    }

    private void notifyNewContent(List<UpdateItem> fresh){
        UpdateItem newest=fresh.get(0);
        for(UpdateItem item:fresh) if(item.publishedAtMillis>newest.publishedAtMillis) newest=item;
        String text=fresh.size()==1?newest.title:(fresh.size()+" مواد جديدة ضمن المجالات التي تتابعها");
        notifyContent(2001,"جديد في روافد",text,newest.path);
    }

    private void notifyChangedContent(List<ChangeItem> fresh){
        ChangeItem newest=fresh.get(0);
        for(ChangeItem item:fresh) if(item.changedAtMillis>newest.changedAtMillis) newest=item;
        String text;
        if(fresh.size()>1) text=fresh.size()+" تحديثات مهمة في المحتوى الذي تتابعه";
        else if("sources_updated".equals(newest.eventType)) text="تم تحديث المصادر: "+newest.title;
        else if("review_updated".equals(newest.eventType)) text="تم تحديث المراجعة العلمية: "+newest.title;
        else text="تم تحديث: "+newest.title;
        notifyContent(2002,"ماذا تغيّر في روافد؟",text,newest.path);
    }

    private void notifyContent(int id,String title,String text,String path){
        Context c=getApplicationContext();
        if(android.os.Build.VERSION.SDK_INT>=33 && ActivityCompat.checkSelfPermission(c,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) return;
        Uri target=Uri.parse(BASE+path);
        Intent i=new Intent(c,MainActivity.class).setAction(Intent.ACTION_VIEW).setData(target);
        PendingIntent pi=PendingIntent.getActivity(c,id,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder publicVersion=new NotificationCompat.Builder(c,RawafidApp.CHANNEL_CONTENT)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("روافد")
                .setContentText("لديك تحديث جديد من روافد")
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true);

        NotificationCompat.Builder b=new NotificationCompat.Builder(c,RawafidApp.CHANNEL_CONTENT)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
                .setPublicVersion(publicVersion.build())
                .setContentIntent(pi)
                .setAutoCancel(true)
                .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION);
        ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(id,b.build());
    }

    static final class UpdateItem {
        final String title;
        final String path;
        final long publishedAtMillis;
        final Set<String> followPaths;
        UpdateItem(String title,String path,long publishedAtMillis,Set<String> followPaths){
            this.title=title; this.path=path; this.publishedAtMillis=publishedAtMillis; this.followPaths=followPaths;
        }
        boolean matches(Set<String> selected){ for(String value:selected) if(followPaths.contains(value)) return true; return false; }
    }

    static final class ChangeItem {
        final String title;
        final String path;
        final String eventType;
        final long changedAtMillis;
        final Set<String> followPaths;
        final Set<String> changedFields;
        ChangeItem(String title,String path,String eventType,long changedAtMillis,Set<String> followPaths,Set<String> changedFields){
            this.title=title; this.path=path; this.eventType=eventType; this.changedAtMillis=changedAtMillis; this.followPaths=followPaths; this.changedFields=changedFields;
        }
        boolean matches(Set<String> selected){ for(String value:selected) if(followPaths.contains(value)) return true; return false; }
        boolean hasMeaningfulChange(){ for(String field:changedFields) if(MEANINGFUL_CHANGE_FIELDS.contains(field)) return true; return false; }
    }
}
