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
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public final class CompanionWorker extends Worker {
    private static final int NOTIFICATION_ID=3101;

    public CompanionWorker(@NonNull Context c,@NonNull WorkerParameters p){ super(c,p); }

    @NonNull @Override public Result doWork(){
        sendAuto(getApplicationContext());
        CompanionScheduler.scheduleNext(getApplicationContext());
        return Result.success();
    }

    public static void sendAuto(Context c){
        SecurePrefs prefs=new SecurePrefs(c);
        LocalDateTime now=LocalDateTime.now();
        String today=now.toLocalDate().toString();
        int count=prefs.getCompanionCounter();
        if(!today.equals(prefs.getCompanionCounterDay())){
            prefs.resetCompanionCounter(today);
            count=0;
        }

        long nowMillis=System.currentTimeMillis();
        if(!CompanionPolicy.canSend(
                prefs.isCompanionEnabled(),
                now.getHour(),
                prefs.getCompanionStartHour(),
                prefs.getCompanionEndHour(),
                count,
                prefs.getCompanionDailyLimit(),
                nowMillis,
                prefs.getCompanionLastAutoSentAt(),
                prefs.getCompanionIntervalHours())) return;

        if(sendNotification(c,prefs)) prefs.markCompanionAutoSent(nowMillis,today,count+1);
    }

    public static void sendNow(Context c){ sendNotification(c,new SecurePrefs(c)); }

    private static boolean sendNotification(Context c,SecurePrefs prefs){
        if(android.os.Build.VERSION.SDK_INT>=33 && ActivityCompat.checkSelfPermission(c,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) return false;
        String period=CompanionPolicy.periodKey(LocalTime.now().getHour());
        List<String> pool=MessageBank.forPeriod(period);
        if(pool.isEmpty()) return false;

        String msg=MessageSelector.chooseNonRepeating(pool,prefs.getRecentCompanionMessageHashes());
        if(msg==null) return false;
        prefs.recordCompanionMessageHash(msg.hashCode());

        String name=prefs.getName();
        String prefix=name.trim().isEmpty()?"":"يا "+name+"، ";
        String fullText=prefix+msg;

        Intent open=new Intent(c,MainActivity.class)
                .setAction(Intent.ACTION_MAIN)
                .addCategory(Intent.CATEGORY_LAUNCHER)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent=PendingIntent.getActivity(c,3101,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder publicVersion=new NotificationCompat.Builder(c,RawafidApp.CHANNEL_COMPANION)
                .setSmallIcon(android.R.drawable.btn_star)
                .setContentTitle("روافد")
                .setContentText("لديكِ رسالة جديدة من رفيقة روافد")
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(contentIntent)
                .setAutoCancel(true);

        NotificationCompat.Builder b=new NotificationCompat.Builder(c,RawafidApp.CHANNEL_COMPANION)
                .setSmallIcon(android.R.drawable.btn_star)
                .setContentTitle("رفيقة روافد 💗")
                .setContentText(fullText)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(fullText))
                .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
                .setPublicVersion(publicVersion.build())
                .setContentIntent(contentIntent)
                .setAutoCancel(true)
                .setOnlyAlertOnce(false)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT);
        ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(NOTIFICATION_ID,b.build());
        return true;
    }
}
