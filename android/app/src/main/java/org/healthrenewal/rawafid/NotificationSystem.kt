package org.healthrenewal.rawafid

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

object NotificationChannels {
    const val EYE = "rawafid_eye"
    const val DAILY = "rawafid_daily"
    const val MOTIVATION = "rawafid_motivation"
    const val TREATMENT = "rawafid_treatment"

    fun create(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannels(listOf(
            NotificationChannel(EYE, "راحة العين", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "تنبيه اختياري قصير لترطيب العين وإراحة النظر"
            },
            NotificationChannel(DAILY, "العناية اليومية", NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = "الماء والحركة والوقفات اليومية المحلية"
            },
            NotificationChannel(MOTIVATION, "رسائل داعمة", NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = "رسائل تحفيزية اختيارية يحدد المستخدم وتيرتها"
            },
            NotificationChannel(TREATMENT, "مواعيد العلاج", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "تذكيرات المواعيد العلاجية التي أضافها المستخدم"
                lockscreenVisibility = Notification.VISIBILITY_PRIVATE
            }
        ))
    }
}

object ReminderScheduler {
    fun syncAll(context: Context) = ReminderType.entries.forEach { sync(context, it) }

    fun sync(context: Context, type: ReminderType) {
        val manager = WorkManager.getInstance(context)
        val name = "rawafid_${type.key}_periodic"
        if (!LocalStore.reminderEnabled(context, type)) {
            manager.cancelUniqueWork(name)
            return
        }
        val minutes = LocalStore.reminderMinutes(context, type).coerceAtLeast(15)
        val request = PeriodicWorkRequestBuilder<ReminderWorker>(minutes, TimeUnit.MINUTES)
            .setInitialDelay(minutes, TimeUnit.MINUTES)
            .setInputData(Data.Builder().putString("type", type.name).build())
            .build()
        manager.enqueueUniquePeriodicWork(name, ExistingPeriodicWorkPolicy.UPDATE, request)
    }
}

class ReminderWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val type = runCatching { ReminderType.valueOf(inputData.getString("type") ?: "") }.getOrNull() ?: return Result.success()
        if (!LocalStore.reminderEnabled(applicationContext, type)) return Result.success()
        if (LocalStore.isQuietHour(applicationContext, LocalDateTime.now().hour)) return Result.success()
        if (type == ReminderType.MOTIVATION && !LocalStore.claimMotivationSlot(applicationContext)) return Result.success()
        if (!canNotify(applicationContext)) return Result.success()

        NotificationChannels.create(applicationContext)
        val (title, body) = message(type)
        val channel = when (type) {
            ReminderType.BLINK -> NotificationChannels.EYE
            ReminderType.MOTIVATION -> NotificationChannels.MOTIVATION
            else -> NotificationChannels.DAILY
        }
        val openIntent = PendingIntent.getActivity(
            applicationContext,
            7000 + type.ordinal,
            Intent(applicationContext, MainActivity::class.java).putExtra("destination", "care"),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = NotificationCompat.Builder(applicationContext, channel)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(openIntent)
            .setAutoCancel(true)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setPriority(if (type == ReminderType.BLINK) NotificationCompat.PRIORITY_HIGH else NotificationCompat.PRIORITY_DEFAULT)
            .build()
        manager.notify(7100 + type.ordinal, notification)
        return Result.success()
    }

    private fun message(type: ReminderType): Pair<String, String> = when (type) {
        ReminderType.BLINK -> "ارمش الآن" to "أغمض عينيك للحظات، ارمش عدة مرات، ثم انظر إلى نقطة أبعد عن الشاشة إن أمكن."
        ReminderType.MOVE -> "حان وقت الحركة" to "إذا كنت جالسًا منذ مدة، قف وتحرك قليلًا، حرّك كتفيك وخذ عدة أنفاس هادئة."
        ReminderType.WATER -> "وقت الماء" to "خذ استراحة قصيرة واشرب ماءً إذا كان ذلك مناسبًا لحالتك الصحية وتعليماتك الطبية."
        ReminderType.MOTIVATION -> "روافد · رسالة لك" to motivationalMessage()
    }

    private fun motivationalMessage(): String {
        val bank = listOf(
            "لا تحتاج إلى إنهاء كل شيء الآن؛ اختر الخطوة التالية فقط.",
            "تقدّمك لا يُقاس بسرعة يوم واحد. الاستمرار الهادئ يصنع فرقًا.",
            "اترك مساحة لنفسك اليوم؛ الراحة جزء من القدرة على الاستمرار.",
            "يمكنك تعديل خطتك عندما تتغير طاقتك. المرونة ليست تراجعًا.",
            "أنجز ما تستطيع بوضوح، واترك ما لا يحتمل طاقتك لوقت أفضل.",
            "لحظة هدوء صغيرة قد تكون أكثر فائدة من دفع نفسك بلا توقف."
        )
        val index = (LocalDate.now().dayOfYear + LocalDateTime.now().hour) % bank.size
        return bank[index]
    }

    private fun canNotify(context: Context): Boolean =
        Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
}
