package org.healthrenewal.rawafid;

import android.Manifest;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageManager;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public final class CompanionWorker extends Worker {
    public CompanionWorker(@NonNull Context c,@NonNull WorkerParameters p){ super(c,p); }

    @NonNull @Override public Result doWork(){
        sendAuto(getApplicationContext());
        return Result.success();
    }

    public static void sendAuto(Context c){
        SecurePrefs prefs = new SecurePrefs(c);
        LocalDateTime now = LocalDateTime.now();
        String today = now.toLocalDate().toString();
        int count = prefs.getCompanionCounter();
        if(!today.equals(prefs.getCompanionCounterDay())) {
            prefs.resetCompanionCounter(today);
            count = 0;
        }

        long nowMillis = System.currentTimeMillis();
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

        if(sendNotification(c)) prefs.markCompanionAutoSent(nowMillis,today,count+1);
    }

    public static void sendNow(Context c){ sendNotification(c); }

    private static boolean sendNotification(Context c){
        if(android.os.Build.VERSION.SDK_INT>=33 && ActivityCompat.checkSelfPermission(c, Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) return false;
        String period=CompanionPolicy.periodKey(LocalTime.now().getHour());
        List<String> pool=MessageBank.forPeriod(period);
        if(pool.isEmpty()) return false;
        String name=new SecurePrefs(c).getName();
        String prefix=name.trim().isEmpty()?"":"يا "+name+"، ";
        String msg=pool.get(ThreadLocalRandom.current().nextInt(pool.size()));
        NotificationCompat.Builder b=new NotificationCompat.Builder(c,RawafidApp.CHANNEL_COMPANION)
                .setSmallIcon(android.R.drawable.btn_star)
                .setContentTitle("رفيقة روافد 💗")
                .setContentText(prefix+msg)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(prefix+msg))
                .setAutoCancel(true)
                .setOnlyAlertOnce(false);
        ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).notify((int)(System.currentTimeMillis()%100000),b.build());
        return true;
    }
}
