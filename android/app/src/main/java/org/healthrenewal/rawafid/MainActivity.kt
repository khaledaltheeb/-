package org.healthrenewal.rawafid

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        NotificationChannels.create(this)
        ReminderScheduler.syncAll(this)
        FlexibleReminderScheduler.syncAll(this)
        TreatmentReminderScheduler.rescheduleFuture(this)
        MedicationReminderScheduler.syncAll(this)
        SafetyMonitorScheduler.resync(this)
        EmergencyBeaconManager.restore(this)
        val safeArrival = SafeArrivalStore.load(this)
        if (safeArrival.active && safeArrival.dueAt > System.currentTimeMillis()) {
            SafeArrivalScheduler.schedule(this, safeArrival)
        }
        RawafidWidgetProvider.updateAll(this)

        val initial = intent.getStringExtra("destination") ?: "home"
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    RawafidAdaptiveShell(initialDestination = initial)
                }
            }
        }
    }
}