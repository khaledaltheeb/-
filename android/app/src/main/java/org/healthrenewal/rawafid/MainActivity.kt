package org.healthrenewal.rawafid

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection

class MainActivity : ComponentActivity() {
    private var destination by mutableStateOf("home")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        destination = intent.getStringExtra("destination") ?: "home"
        restoreRuntimeState()
        render()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        destination = intent.getStringExtra("destination") ?: "home"
    }

    private fun render() {
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    if (destination == "life_inbox") {
                        LifeInboxScreen(onClose = { destination = "home" })
                    } else {
                        RawafidAdaptiveShell(initialDestination = destination)
                    }
                }
            }
        }
    }

    private fun restoreRuntimeState() {
        NotificationChannels.create(this)
        ReminderScheduler.syncAll(this)
        FlexibleReminderScheduler.syncAll(this)
        TreatmentReminderScheduler.rescheduleFuture(this)
        MedicationReminderScheduler.syncAll(this)
        SafetyMonitorScheduler.resync(this)
        EmergencyBeaconManager.restore(this)
        CircleNotificationScheduler.ensureScheduled(this)
        val safeArrival = SafeArrivalStore.load(this)
        if (safeArrival.active && safeArrival.dueAt > System.currentTimeMillis()) {
            SafeArrivalScheduler.schedule(this, safeArrival)
        }
        RawafidWidgetProvider.updateAll(this)
    }
}
