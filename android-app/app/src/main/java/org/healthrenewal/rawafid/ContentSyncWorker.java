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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class ContentSyncWorker extends Worker {
    private static final String BASE="https://healthrenewal.org";
    private static final String FEED=BASE+"/api/mobile/updates";

    public ContentSyncWorker(@NonNull Context c,@NonNull WorkerParameters p){ super(c,p); }

    @NonNull @Override public Result doWork(){
        try {
            SecurePrefs prefs=new SecurePrefs(getApplicationContext());
            String selectedRaw=prefs.getSectors();
            Set<String> selected=parseSelected(selectedRaw);
            if(selected.isEmpty()) return Result.success();

            List<UpdateItem> items=fetchUpdates();
            if(items.isEmpty()) return Result.success();

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
                return Result.success();
            }

            List<UpdateItem> fresh=new ArrayList<>();
            long newCursor=previous;
            for(UpdateItem item:matching){
                newCursor=Math.max(newCursor,item.publishedAtMillis);
                if(item.publishedAtMillis>previous) fresh.add(item);
            }

            if(!fresh.isEmpty()) notifyNewContent(fresh);
            prefs.setLastSeen(stateKey,Math.max(newCursor,latestPublished));
            return Result.success();
        } catch(Exception e){
            return Result.retry();
        }
    }

    private List<UpdateItem> fetchUpdates() throws Exception {
        HttpURLConnection con=(HttpURLConnection)new URL(FEED).openConnection();
        con.setConnectTimeout(10000);
        con.setReadTimeout(15000);
        con.setInstanceFollowRedirects(true);
        con.setRequestProperty("Accept","application/json");
        con.setRequestProperty("User-Agent","RawafidAndroid/1.0 (+https://healthrenewal.org)");
        int code=con.getResponseCode();
        if(code<200||code>=300){ con.disconnect(); throw new IllegalStateException("HTTP "+code); }
        StringBuilder body=new StringBuilder();
        try(BufferedReader r=new BufferedReader(new InputStreamReader(con.getInputStream(),StandardCharsets.UTF_8))){ String line; while((line=r.readLine())!=null) body.append(line); }
        finally { con.disconnect(); }

        JSONObject root=new JSONObject(body.toString());
        if(!root.optBoolean("ok",false)) throw new IllegalStateException("Feed unavailable");
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
            long publishedMillis;
            try { publishedMillis=Instant.parse(published).toEpochMilli(); } catch(Exception ignored){ continue; }
            Set<String> followPaths=new HashSet<>();
            for(int p=0;p<paths.length();p++){ String value=paths.optString(p,"").trim(); if(value.startsWith("/")) followPaths.add(value); }
            if(!followPaths.isEmpty()) out.add(new UpdateItem(title,path,publishedMillis,followPaths));
        }
        return out;
    }

    private Set<String> parseSelected(String raw){
        Set<String> out=new HashSet<>();
        if(raw==null) return out;
        for(String token:raw.split(",")){ String value=token.trim(); if(value.startsWith("/")) out.add(value); }
        return out;
    }

    private void notifyNewContent(List<UpdateItem> fresh){
        Context c=getApplicationContext();
        if(android.os.Build.VERSION.SDK_INT>=33 && ActivityCompat.checkSelfPermission(c,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) return;

        UpdateItem newest=fresh.get(0);
        for(UpdateItem item:fresh) if(item.publishedAtMillis>newest.publishedAtMillis) newest=item;
        Uri target=Uri.parse(BASE+newest.path);
        Intent i=new Intent(c,MainActivity.class).setAction(Intent.ACTION_VIEW).setData(target);
        PendingIntent pi=PendingIntent.getActivity(c,77,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);

        String text=fresh.size()==1?newest.title:(fresh.size()+" مواد جديدة ضمن المجالات التي تتابعها");
        NotificationCompat.Builder publicVersion=new NotificationCompat.Builder(c,RawafidApp.CHANNEL_CONTENT)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("روافد")
                .setContentText("لديك تحديث جديد من روافد")
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true);

        NotificationCompat.Builder b=new NotificationCompat.Builder(c,RawafidApp.CHANNEL_CONTENT)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("جديد في روافد")
                .setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
                .setPublicVersion(publicVersion.build())
                .setContentIntent(pi)
                .setAutoCancel(true)
                .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION);
        ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(2001,b.build());
    }

    static final class UpdateItem {
        final String title;
        final String path;
        final long publishedAtMillis;
        final Set<String> followPaths;
        UpdateItem(String title,String path,long publishedAtMillis,Set<String> followPaths){
            this.title=title; this.path=path; this.publishedAtMillis=publishedAtMillis; this.followPaths=followPaths;
        }
        boolean matches(Set<String> selected){
            for(String value:selected) if(followPaths.contains(value)) return true;
            return false;
        }
    }
}
