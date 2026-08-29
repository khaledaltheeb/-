package org.healthrenewal.rawafid

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (!ReminderScheduler.isEnabled(context)) return
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return

        val slot = intent.getIntExtra("slot", 0).coerceIn(0, 3)
        val messages = arrayOf(
            "صباحك بداية جديدة. اختاري خطوة صغيرة تناسب طاقتك اليوم.",
            "كيف تشعرين الآن؟ ماء، حركة خفيفة، طعام، هدوء أو استراحة قد تكون هي الحاجة الأقرب.",
            "لا يلزم أن تكملي اليوم بنفس سرعة الصباح. عدّلي الخطة بما يناسب طاقتك الحقيقية.",
            "أغلقي يومك بلطف. ما لم يكتمل اليوم يمكن أن يعود إلى خطة الغد دون لوم."
        )

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "rawafid_wellbeing"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(NotificationChannel(channelId, "الدعم اليومي", NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = "تذكيرات محلية اختيارية للدعم والرفاه اليومي"
            })
        }

        val openIntent = PendingIntent.getActivity(
            context,
            4200 + slot,
            Intent(context, ReminderActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("روافد · وقفة شخصية")
            .setContentText(messages[slot])
            .setStyle(NotificationCompat.BigTextStyle().bigText(messages[slot]))
            .setContentIntent(openIntent)
            .setAutoCancel(true)
            .setOnlyAlertOnce(true)
            .build()

        manager.notify(4300 + slot, notification)
    }
}

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            ReminderScheduler.scheduleAll(context)
        }
    }
}
