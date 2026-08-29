package org.healthrenewal.rawafid

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {
    private var permissionContinuation: ((Boolean) -> Unit)? = null
    private val notificationPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        permissionContinuation?.invoke(granted)
        permissionContinuation = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        NotificationChannels.create(this)
        ReminderScheduler.syncAll(this)
        TreatmentReminderScheduler.rescheduleFuture(this)
        val initial = intent.getStringExtra("destination") ?: "home"
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    RawafidApp(initialDestination = initial, requestNotifications = ::requestNotifications)
                }
            }
        }
    }

    private fun requestNotifications(onResult: (Boolean) -> Unit) {
        if (Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
            onResult(true)
            return
        }
        permissionContinuation = onResult
        notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
    }
}
