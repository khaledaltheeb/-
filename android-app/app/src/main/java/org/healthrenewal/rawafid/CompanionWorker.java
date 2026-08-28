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
import java.time.ZoneId;
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
        if(!prefs.isCompanionEnabled()) return;

        LocalDateTime now = LocalDateTime.now();
        int hour = now.getHour();
        if(!withinWindow(hour,prefs.getCompanionStartHour(),prefs.getCompanionEndHour())) return;

        String today = LocalDate.now().toString();
        int count = prefs.getCompanionCounter();
        if(!today.equals(prefs.getCompanionCounterDay())) {
            prefs.resetCompanionCounter(today);
            count = 0;
        }
        if(count >= prefs.getCompanionDailyLimit()) return;

        long last = prefs.getCompanionLastAutoSentAt();
        if(last > 0L) {
            long minGap = prefs.getCompanionIntervalHours() * 60L * 60L * 1000L;
            if(System.currentTimeMillis() - last < minGap) return;
        }

        if(sendNotification(c)) {
            prefs.markCompanionAutoSent(System.currentTimeMillis(),today,count+1);
        }
    }

    public static void sendNow(Context c){
        sendNotification(c);
    }

    private static boolean sendNotification(Context c){
        if(android.os.Build.VERSION.SDK_INT>=33 && ActivityCompat.checkSelfPermission(c, Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) return false;
        String period=periodKey(LocalTime.now().getHour());
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

    private static boolean withinWindow(int hour,int start,int end){
        if(start==end) return true;
        if(start<end) return hour>=start && hour<end;
        return hour>=start || hour<end;
    }

    private static String periodKey(int h){
        if(h<9)return "morning_start";
        if(h<11)return "morning";
        if(h<13)return "late_morning";
        if(h<15)return "midday";
        if(h<17)return "afternoon";
        if(h<19)return "early_evening";
        if(h<22)return "evening";
        return "bedtime";
    }
}
