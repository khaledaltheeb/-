package org.healthrenewal.rawafid

import android.Manifest
import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

object TreatmentReminderScheduler {
    fun schedule(context: Context, reminder: TreatmentReminder) {
        val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val operation = pendingIntent(context, reminder)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && manager.canScheduleExactAlarms()) {
            manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, reminder.timeMillis, operation)
        } else {
            manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, reminder.timeMillis, operation)
        }
    }

    fun cancel(context: Context, reminder: TreatmentReminder) {
        val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        manager.cancel(pendingIntent(context, reminder))
    }

    fun rescheduleFuture(context: Context) {
        LocalStore.treatments(context)
            .filter { it.timeMillis > System.currentTimeMillis() }
            .forEach { schedule(context, it) }
    }

    private fun pendingIntent(context: Context, reminder: TreatmentReminder): PendingIntent {
        val intent = Intent(context, TreatmentReminderReceiver::class.java)
            .putExtra("id", reminder.id)
            .putExtra("title", reminder.title)
            .putExtra("note", reminder.note)
        return PendingIntent.getBroadcast(
            context,
            reminder.id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}

class TreatmentReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getIntExtra("id", 0)
        val title = intent.getStringExtra("title").orEmpty().ifBlank { "موعد علاج" }
        val note = intent.getStringExtra("note").orEmpty()
        LocalStore.removeTreatment(context, id)

        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return

        NotificationChannels.create(context)
        val openIntent = PendingIntent.getActivity(
            context,
            id,
            Intent(context, MainActivity::class.java).putExtra("destination", "care"),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val body = note.ifBlank { "هذا موعد أضفته أنت في روافد. افتح التطبيق لمراجعته." }
        val notification = NotificationCompat.Builder(context, NotificationChannels.TREATMENT)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(openIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .build()
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(9000 + id, notification)
    }
}

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            TreatmentReminderScheduler.rescheduleFuture(context)
            WomenCareReminderScheduler.rescheduleFuture(context)
            ReminderScheduler.syncAll(context)
            FlexibleReminderScheduler.syncAll(context)
            MedicationReminderScheduler.syncAll(context)
            FutureNoteScheduler.restore(context)
            EmergencyBeaconManager.restore(context)
            SafetyMonitorScheduler.resync(context, ensureService = true)
            val safeArrival = SafeArrivalStore.load(context)
            if (safeArrival.active && safeArrival.dueAt > System.currentTimeMillis()) {
                SafeArrivalScheduler.schedule(context, safeArrival)
            }
            RawafidWidgetProvider.updateAll(context)
        }
    }
}