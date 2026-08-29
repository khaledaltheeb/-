package org.healthrenewal.rawafid;

import android.Manifest;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.content.ContextCompat;
import java.time.ZonedDateTime;

public final class CompanionScheduler {
    private static final int REQUEST_CODE=4107;

    private CompanionScheduler(){}

    public static void sendNow(Context context){ CompanionWorker.sendNow(context.getApplicationContext()); }

    public static void scheduleNext(Context context){
        Context app=context.getApplicationContext();
        SecurePrefs prefs=new SecurePrefs(app);
        AlarmManager alarm=(AlarmManager)app.getSystemService(Context.ALARM_SERVICE);
        if(alarm==null) return;

        PendingIntent pending=pendingIntent(app);
        alarm.cancel(pending);
        if(!prefs.isCompanionEnabled() || !hasNotificationPermission(app)) return;

        long triggerAt=CompanionSchedulePlanner.nextTriggerMillis(
                true,
                ZonedDateTime.now(),
                prefs.getCompanionStartHour(),
                prefs.getCompanionEndHour(),
                prefs.getCompanionCounter(),
                prefs.getCompanionDailyLimit(),
                prefs.getCompanionCounterDay(),
                prefs.getCompanionLastAutoSentAt(),
                prefs.getCompanionIntervalHours());
        if(triggerAt<=0L) return;

        if(Build.VERSION.SDK_INT>=23) alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,triggerAt,pending);
        else alarm.set(AlarmManager.RTC_WAKEUP,triggerAt,pending);
    }

    public static void cancel(Context context){
        Context app=context.getApplicationContext();
        AlarmManager alarm=(AlarmManager)app.getSystemService(Context.ALARM_SERVICE);
        if(alarm!=null) alarm.cancel(pendingIntent(app));
    }

    public static boolean hasNotificationPermission(Context context){
        return Build.VERSION.SDK_INT<33 || ContextCompat.checkSelfPermission(context,Manifest.permission.POST_NOTIFICATIONS)==PackageManager.PERMISSION_GRANTED;
    }

    private static PendingIntent pendingIntent(Context context){
        Intent intent=new Intent(context,CompanionAlarmReceiver.class).setAction(CompanionAlarmReceiver.ACTION_COMPANION_ALARM);
        return PendingIntent.getBroadcast(context,REQUEST_CODE,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
}
