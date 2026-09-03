package org.healthrenewal.rawafid

import android.Manifest
import android.app.Notification
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
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.OutOfQuotaPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

private const val CIRCLE_CHANNEL_ID = "rawafid_circle"
private const val CIRCLE_PERIODIC_WORK = "rawafid_circle_notification_poll"
private const val CIRCLE_IMMEDIATE_WORK = "rawafid_circle_notification_refresh"
private const val ACTION_CIRCLE_ANSWER = "org.healthrenewal.rawafid.CIRCLE_ANSWER"

object CircleNotificationScheduler {
    fun ensureScheduled(context: Context) {
        CircleNotificationSystem.ensureChannel(context)
        val constraints = Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
        val periodic = PeriodicWorkRequestBuilder<CircleNotificationWorker>(15, TimeUnit.MINUTES).setConstraints(constraints).build()
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(CIRCLE_PERIODIC_WORK, ExistingPeriodicWorkPolicy.UPDATE, periodic)
        checkNow(context)
    }

    fun checkNow(context: Context, expedited: Boolean = false) {
        val constraints = Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
        val request = OneTimeWorkRequestBuilder<CircleNotificationWorker>().setConstraints(constraints).apply {
            if (expedited) setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST)
        }.build()
        WorkManager.getInstance(context).enqueueUniqueWork(CIRCLE_IMMEDIATE_WORK, ExistingWorkPolicy.REPLACE, request)
    }
}

class CircleNotificationWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        if (!RawafidCircleApi.hasSession(applicationContext) || !CircleNotificationSystem.canNotify(applicationContext)) return Result.success()
        return runCatching {
            val notifications = RawafidCircleApi.notifications(applicationContext, 60).filter { it.readAt == null && it.kind.startsWith("circle_") }.sortedBy { it.createdAt }
            notifications.forEach { item ->
                CircleNotificationSystem.post(applicationContext, item)
                runCatching { RawafidCircleApi.markNotificationRead(applicationContext, item.notificationId) }
            }
            Result.success()
        }.getOrElse { if (runAttemptCount < 3) Result.retry() else Result.success() }
    }
}

object CircleNotificationSystem {
    fun canNotify(context: Context): Boolean = Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(NotificationChannel(CIRCLE_CHANNEL_ID, "دائرتي في روافد", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "طلبات الارتباط والرسائل والأسئلة السريعة وطلبات الموقع من الأشخاص المرتبطين بك"
            lockscreenVisibility = Notification.VISIBILITY_PRIVATE
        })
    }

    fun post(context: Context, item: CircleCloudNotification) {
        if (!canNotify(context)) return
        ensureChannel(context)
        val connectionId = item.data.optString("circle_connection_id")
        val messageId = item.data.optString("circle_message_id")
        val kind = item.data.optString("message_kind", item.kind)
        val openIntent = if (connectionId.isNotBlank() && item.kind !in setOf("circle_request", "circle_connected")) {
            Intent(context, CircleConversationActivity::class.java).apply {
                putExtra("connection_id", connectionId)
                putExtra("counterpart_name", "دائرتي")
                putExtra("can_message", true)
                putExtra("can_quick_question", true)
                putExtra("can_request_location", true)
            }
        } else Intent(context, MyCircleActivity::class.java)
        val open = PendingIntent.getActivity(context, item.notificationId.hashCode(), openIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val publicVersion = NotificationCompat.Builder(context, CIRCLE_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("روافد · دائرتي")
            .setContentText("لديك تحديث جديد من دائرتك")
            .build()
        val builder = NotificationCompat.Builder(context, CIRCLE_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(item.title.ifBlank { "دائرتي في روافد" })
            .setContentText(item.body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(item.body))
            .setContentIntent(open)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .setPublicVersion(publicVersion)

        if (messageId.isNotBlank() && (item.kind == "circle_question" || kind == "yes_no_question")) {
            builder.addAction(authenticatedAction("نعم ✓", answerPendingIntent(context, item, messageId, "yes", 1)))
            builder.addAction(authenticatedAction("لا ✕", answerPendingIntent(context, item, messageId, "no", 2)))
        }
        if (messageId.isNotBlank() && (item.kind == "circle_location_request" || kind == "location_request")) {
            builder.addAction(authenticatedAction("فتح وإرسال موقعي", open))
            builder.addAction(authenticatedAction("رفض", answerPendingIntent(context, item, messageId, "decline", 3)))
        }
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(item.notificationId.hashCode(), builder.build())
    }

    private fun authenticatedAction(title: String, pendingIntent: PendingIntent): NotificationCompat.Action =
        NotificationCompat.Action.Builder(0, title, pendingIntent)
            .setAuthenticationRequired(true)
            .build()

    private fun answerPendingIntent(context: Context, item: CircleCloudNotification, messageId: String, answer: String, salt: Int): PendingIntent = PendingIntent.getBroadcast(
        context,
        31 * item.notificationId.hashCode() + salt,
        Intent(context, CircleNotificationActionReceiver::class.java).apply {
            action = ACTION_CIRCLE_ANSWER
            putExtra("message_id", messageId)
            putExtra("answer", answer)
            putExtra("notification_id", item.notificationId)
            putExtra("local_notification_id", item.notificationId.hashCode())
        },
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
}

class CircleNotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_CIRCLE_ANSWER) return
        val messageId = intent.getStringExtra("message_id").orEmpty()
        val answer = intent.getStringExtra("answer").orEmpty()
        val notificationId = intent.getStringExtra("notification_id").orEmpty()
        val localId = intent.getIntExtra("local_notification_id", 0)
        if (messageId.isBlank() || answer !in setOf("yes", "no", "decline")) return
        val pending = goAsync()
        CoroutineScope(SupervisorJob() + Dispatchers.IO).launch {
            runCatching {
                RawafidCircleApi.answerMessage(context, messageId, answer)
                if (notificationId.isNotBlank()) RawafidCircleApi.markNotificationRead(context, notificationId)
                (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(localId)
                CircleNotificationScheduler.checkNow(context)
            }
            pending.finish()
        }
    }
}
