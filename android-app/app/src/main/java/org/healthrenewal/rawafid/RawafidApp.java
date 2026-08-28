package org.healthrenewal.rawafid;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

public final class RawafidApp extends Application {
    public static final String CHANNEL_CONTENT = "rawafid_content";
    public static final String CHANNEL_COMPANION = "rawafid_companion";

    @Override public void onCreate() {
        super.onCreate();
        createChannels();

        Constraints connected = new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
        PeriodicWorkRequest content = new PeriodicWorkRequest.Builder(ContentSyncWorker.class, 1, TimeUnit.HOURS)
                .setConstraints(connected)
                .build();
        WorkManager.getInstance(this).enqueueUniquePeriodicWork("rawafid-content-sync", ExistingPeriodicWorkPolicy.UPDATE, content);

        // WorkManager's minimum periodic interval is 15 minutes. The worker itself enforces the
        // user's active window, daily cap, and minimum gap, so no notification is sent merely
        // because this evaluator wakes up.
        PeriodicWorkRequest companion = new PeriodicWorkRequest.Builder(CompanionWorker.class, 15, TimeUnit.MINUTES).build();
        WorkManager.getInstance(this).enqueueUniquePeriodicWork("rawafid-companion", ExistingPeriodicWorkPolicy.UPDATE, companion);
    }

    private void createChannels() {
        NotificationManager nm = getSystemService(NotificationManager.class);

        NotificationChannel content = new NotificationChannel(CHANNEL_CONTENT, "جديد القطاعات", NotificationManager.IMPORTANCE_DEFAULT);
        content.setDescription("تنبيهات المحتوى الجديد في القطاعات التي اخترتها");

        NotificationChannel companion = new NotificationChannel(CHANNEL_COMPANION, "رفيقة روافد", NotificationManager.IMPORTANCE_DEFAULT);
        companion.setDescription("رسائل الاهتمام والعناية ضمن الجدول الذي تختارينه");

        nm.createNotificationChannel(content);
        nm.createNotificationChannel(companion);
    }
}
