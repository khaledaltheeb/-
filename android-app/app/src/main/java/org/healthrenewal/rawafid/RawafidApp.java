package org.healthrenewal.rawafid;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.webkit.WebView;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

public final class RawafidApp extends Application {
    // Versioned IDs are intentional: Android keeps a channel's sound once the user/device creates it.
    public static final String CHANNEL_CONTENT = "rawafid_content_v2";
    public static final String CHANNEL_COMPANION = "rawafid_companion_v2";

    @Override public void onCreate() {
        super.onCreate();
        WebView.setWebContentsDebuggingEnabled(false);
        createChannels();

        Constraints connected = new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
        PeriodicWorkRequest content = new PeriodicWorkRequest.Builder(ContentSyncWorker.class, 1, TimeUnit.HOURS)
                .setConstraints(connected)
                .build();
        WorkManager workManager=WorkManager.getInstance(this);
        workManager.enqueueUniquePeriodicWork("rawafid-content-sync", ExistingPeriodicWorkPolicy.UPDATE, content);

        // Remove the legacy 15-minute companion poller. Rafiqa now uses a one-shot alarm
        // that is restored after reboot/time changes and schedules itself again after delivery.
        workManager.cancelUniqueWork("rawafid-companion");
        CompanionScheduler.scheduleNext(this);
    }

    private void createChannels() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        if(nm==null) return;

        Uri sound=Uri.parse("android.resource://"+getPackageName()+"/"+R.raw.rawafid_chime_v2);
        AudioAttributes audioAttributes=new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();

        NotificationChannel content = new NotificationChannel(CHANNEL_CONTENT, "تحديثات روافد", NotificationManager.IMPORTANCE_DEFAULT);
        content.setDescription("تنبيهات المحتوى الجديد والتحديثات المهمة في المجالات التي اخترتها");
        content.setSound(sound,audioAttributes);
        content.enableVibration(true);

        NotificationChannel companion = new NotificationChannel(CHANNEL_COMPANION, "رفيقة روافد", NotificationManager.IMPORTANCE_DEFAULT);
        companion.setDescription("رسائل الاهتمام والعناية ضمن الجدول الذي تختارينه");
        companion.setSound(sound,audioAttributes);
        companion.enableVibration(true);

        nm.createNotificationChannel(content);
        nm.createNotificationChannel(companion);
    }
}
