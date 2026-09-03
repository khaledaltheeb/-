package org.healthrenewal.rawafid

import android.Manifest
import android.annotation.SuppressLint
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
import com.google.android.gms.location.ActivityRecognition
import com.google.android.gms.location.ActivityTransition
import com.google.android.gms.location.ActivityTransitionRequest
import com.google.android.gms.location.ActivityTransitionResult
import com.google.android.gms.location.DetectedActivity

private const val SAFE_DRIVE_DETECTION_CHANNEL = "rawafid_safe_drive_detection"
private const val SAFE_DRIVE_DETECTION_NOTIFICATION_ID = 9860
private const val ACTION_SAFE_DRIVE_PASSENGER = "org.healthrenewal.rawafid.SAFE_DRIVE_PASSENGER"
const val EXTRA_SAFE_DRIVE_AUTO_DETECTED = "safe_drive_auto_detected"

object SafeDriveAutoDetection {
    private const val REQUEST_CODE = 9861

    fun hasPermission(context: Context): Boolean =
        Build.VERSION.SDK_INT < 29 || ContextCompat.checkSelfPermission(context, Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED

    @SuppressLint("MissingPermission")
    fun register(context: Context, onResult: ((Boolean, String) -> Unit)? = null) {
        if (!SafeDriveAdvancedStore.config(context).autoDetectionEnabled) {
            onResult?.invoke(false, "اكتشاف الرحلة التلقائي غير مفعّل.")
            return
        }
        // The Play services call is deliberately reached only after the runtime
        // ACTIVITY_RECOGNITION gate below; lint cannot infer this helper contract.
        if (!hasPermission(context)) {
            onResult?.invoke(false, "يلزم إذن التعرّف على النشاط لتفعيل اكتشاف الرحلة.")
            return
        }
        val transitions = listOf(
            ActivityTransition.Builder()
                .setActivityType(DetectedActivity.IN_VEHICLE)
                .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
                .build(),
            ActivityTransition.Builder()
                .setActivityType(DetectedActivity.IN_VEHICLE)
                .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
                .build()
        )
        ActivityRecognition.getClient(context.applicationContext)
            .requestActivityTransitionUpdates(ActivityTransitionRequest(transitions), transitionPendingIntent(context))
            .addOnSuccessListener { onResult?.invoke(true, "تم تفعيل اكتشاف وجود الهاتف داخل مركبة. لن يبدأ القياس دون تأكيد أنك السائق.") }
            .addOnFailureListener { onResult?.invoke(false, it.message ?: "تعذر تفعيل اكتشاف الرحلة.") }
    }

    @SuppressLint("MissingPermission")
    fun unregister(context: Context, onResult: ((Boolean, String) -> Unit)? = null) {
        // Keep the same explicit runtime gate as registration. The annotation is
        // narrowly scoped to the Play services call that lint cannot prove safe.
        if (!hasPermission(context)) {
            onResult?.invoke(true, "تم إيقاف اكتشاف الرحلة.")
            return
        }
        ActivityRecognition.getClient(context.applicationContext)
            .removeActivityTransitionUpdates(transitionPendingIntent(context))
            .addOnSuccessListener { onResult?.invoke(true, "تم إيقاف اكتشاف الرحلة.") }
            .addOnFailureListener { onResult?.invoke(false, it.message ?: "تعذر إيقاف اكتشاف الرحلة.") }
    }

    fun markPassenger(context: Context) {
        SafeDriveAdvancedStore.suppressAsPassenger(context)
        notificationManager(context).cancel(SAFE_DRIVE_DETECTION_NOTIFICATION_ID)
    }

    fun clearPassengerMode(context: Context) {
        SafeDriveAdvancedStore.clearPassengerSuppression(context)
    }

    internal fun onVehicleEntered(context: Context) {
        if (!SafeDriveAdvancedStore.config(context).autoDetectionEnabled) return
        if (SafeDriveAdvancedStore.passengerSuppressed(context)) return
        if (SafeDriveRuntime.state.value.active) return
        postDriverConfirmation(context)
    }

    internal fun onVehicleExited(context: Context) {
        clearPassengerMode(context)
        notificationManager(context).cancel(SAFE_DRIVE_DETECTION_NOTIFICATION_ID)
    }

    private fun transitionPendingIntent(context: Context): PendingIntent {
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or if (Build.VERSION.SDK_INT >= 31) PendingIntent.FLAG_MUTABLE else 0
        return PendingIntent.getBroadcast(
            context,
            REQUEST_CODE,
            Intent(context, SafeDriveActivityTransitionReceiver::class.java),
            flags
        )
    }

    private fun postDriverConfirmation(context: Context) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        ensureChannel(context)
        val driver = PendingIntent.getActivity(
            context,
            9862,
            Intent(context, SafeDriveActivity::class.java)
                .putExtra(EXTRA_SAFE_DRIVE_AUTO_DETECTED, true)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val passenger = PendingIntent.getBroadcast(
            context,
            9863,
            Intent(context, SafeDriveActivityTransitionReceiver::class.java).setAction(ACTION_SAFE_DRIVE_PASSENGER),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(context, SAFE_DRIVE_DETECTION_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("يبدو أنك بدأت رحلة")
            .setContentText("هل أنت السائق؟ روافد لن يبدأ قياس القيادة دون تأكيدك.")
            .setStyle(NotificationCompat.BigTextStyle().bigText("اكتشف روافد أن الهاتف داخل مركبة. اختر «أنا السائق» لفتح قيادة آمنة أو «أنا راكب» لمنع التسجيل لهذه الرحلة."))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .setAutoCancel(true)
            .setContentIntent(driver)
            .addAction(0, "أنا السائق", driver)
            .addAction(0, "أنا راكب", passenger)
            .build()
        notificationManager(context).notify(SAFE_DRIVE_DETECTION_NOTIFICATION_ID, notification)
    }

    private fun ensureChannel(context: Context) {
        notificationManager(context).createNotificationChannel(
            NotificationChannel(SAFE_DRIVE_DETECTION_CHANNEL, "اكتشاف رحلة القيادة", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "يسأل فقط إذا كنت السائق عند اكتشاف وجود الهاتف داخل مركبة"
                lockscreenVisibility = Notification.VISIBILITY_PRIVATE
            }
        )
    }

    private fun notificationManager(context: Context) = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
}

class SafeDriveActivityTransitionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action == ACTION_SAFE_DRIVE_PASSENGER) {
            SafeDriveAutoDetection.markPassenger(context)
            return
        }
        if (intent == null || !ActivityTransitionResult.hasResult(intent)) return
        val result = ActivityTransitionResult.extractResult(intent) ?: return
        result.transitionEvents.forEach { event ->
            if (event.activityType != DetectedActivity.IN_VEHICLE) return@forEach
            when (event.transitionType) {
                ActivityTransition.ACTIVITY_TRANSITION_ENTER -> SafeDriveAutoDetection.onVehicleEntered(context)
                ActivityTransition.ACTIVITY_TRANSITION_EXIT -> SafeDriveAutoDetection.onVehicleExited(context)
            }
        }
    }
}

class SafeDriveAutoRestoreReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action !in setOf(Intent.ACTION_BOOT_COMPLETED, Intent.ACTION_MY_PACKAGE_REPLACED)) return
        val config = SafeDriveAdvancedStore.config(context)
        if (config.autoDetectionEnabled && SafeDriveAutoDetection.hasPermission(context)) {
            SafeDriveAutoDetection.register(context)
        }
    }
}
