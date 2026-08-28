package org.healthrenewal.rawafid;

import android.Manifest;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ContentSyncWorker extends Worker {
    private static final Pattern LOC = Pattern.compile("<loc>(https://healthrenewal\\.org/[^<]+)</loc>");
    public ContentSyncWorker(@NonNull Context c,@NonNull WorkerParameters p){ super(c,p); }
    @NonNull @Override public Result doWork(){
        try {
            SecurePrefs prefs = new SecurePrefs(getApplicationContext());
            String selected = prefs.getSectors();
            if(selected.isBlank()) return Result.success();
            HttpURLConnection con=(HttpURLConnection)new URL("https://healthrenewal.org/sitemap.xml").openConnection();
            con.setConnectTimeout(10000); con.setReadTimeout(15000); con.setRequestProperty("User-Agent","RawafidAndroid/1.0");
            if(con.getResponseCode()!=200) return Result.retry();
            StringBuilder xml=new StringBuilder();
            try(BufferedReader r=new BufferedReader(new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8))){ String l; while((l=r.readLine())!=null) xml.append(l); }
            List<String> matches=new ArrayList<>(); Matcher m=LOC.matcher(xml);
            while(m.find()){ String u=m.group(1); if(matchesSector(u,selected)) matches.add(u); }
            String stateKey="sector_state_"+Integer.toHexString(selected.hashCode());
            long previous=prefs.getLastSeen(stateKey);
            long current=matches.toString().hashCode();
            if(previous!=0L && previous!=current) notifyNewContent(matches.isEmpty()?"https://healthrenewal.org":matches.get(matches.size()-1));
            prefs.setLastSeen(stateKey,current);
            return Result.success();
        } catch(Exception e){ return Result.retry(); }
    }
    private boolean matchesSector(String url,String selected){
        for(String token:selected.split(",")){ if(!token.isBlank() && url.contains(token.trim())) return true; }
        return false;
    }
    private void notifyNewContent(String url){
        Context c=getApplicationContext();
        if(android.os.Build.VERSION.SDK_INT>=33 && ActivityCompat.checkSelfPermission(c, Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) return;
        Intent i=new Intent(c,MainActivity.class).setAction(Intent.ACTION_VIEW).setData(android.net.Uri.parse(url));
        PendingIntent pi=PendingIntent.getActivity(c,77,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b=new NotificationCompat.Builder(c,RawafidApp.CHANNEL_CONTENT).setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("جديد في روافد").setContentText("نشر محتوى جديد في أحد القطاعات التي تتابعها.").setContentIntent(pi).setAutoCancel(true);
        ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(2001,b.build());
    }
}
