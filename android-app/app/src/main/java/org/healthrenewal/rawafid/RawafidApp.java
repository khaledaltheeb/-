package org.healthrenewal.rawafid;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
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
        Constraints c = new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
        PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(ContentSyncWorker.class, 1, TimeUnit.HOURS).setConstraints(c).build();
        WorkManager.getInstance(this).enqueueUniquePeriodicWork("rawafid-content-sync", ExistingPeriodicWorkPolicy.UPDATE, request);
        PeriodicWorkRequest companion = new PeriodicWorkRequest.Builder(CompanionWorker.class, 4, TimeUnit.HOURS).build();
        WorkManager.getInstance(this).enqueueUniquePeriodicWork("rawafid-companion", ExistingPeriodicWorkPolicy.UPDATE, companion);
    }
    private void createChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            NotificationChannel content = new NotificationChannel(CHANNEL_CONTENT, "جديد القطاعات", NotificationManager.IMPORTANCE_DEFAULT);
            content.setDescription("تنبيهات المحتوى الجديد في القطاعات التي اخترتها");
            NotificationChannel companion = new NotificationChannel(CHANNEL_COMPANION, "رفيقة روافد", NotificationManager.IMPORTANCE_DEFAULT);
            companion.setDescription("رسائل الاهتمام والعناية والتذكيرات التي اخترتها");
            nm.createNotificationChannel(content); nm.createNotificationChannel(companion);
        }
    }
}
