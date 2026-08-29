package org.healthrenewal.rawafid

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

object WomenPrivacyGate {
    const val TARGET_COMPANION = "companion"
    const val TARGET_CALENDAR = "calendar"
    const val TARGET_PLANNER = "planner"
    const val TARGET_VISIT_PREP = "visit_prep"
    const val TARGET_SETTINGS = "settings"
    private const val EXTRA_TARGET = "women_privacy_target"

    fun intent(context: Context, target: String): Intent =
        Intent(context, WomenPrivacyGateActivity::class.java).putExtra(EXTRA_TARGET, target)

    fun requireUnlocked(activity: Activity, target: String): Boolean {
        if (!WomenPrivacyStore.enabled(activity) || WomenPrivacyStore.sessionUnlocked(activity)) return true
        activity.startActivity(intent(activity, target))
        activity.finish()
        return false
    }

    fun target(intent: Intent): String = intent.getStringExtra(EXTRA_TARGET) ?: TARGET_COMPANION

    fun destination(context: Context, target: String): Intent = when (target) {
        TARGET_CALENDAR -> Intent(context, WomenCalendarActivity::class.java)
        TARGET_PLANNER -> Intent(context, WomenCarePlannerActivity::class.java)
        TARGET_VISIT_PREP -> Intent(context, WomenVisitPrepActivity::class.java)
        TARGET_SETTINGS -> Intent(context, WomenPrivacySettingsActivity::class.java)
        else -> Intent(context, WomenActivity::class.java)
    }
}

class WomenPrivacyGateActivity : ComponentActivity() {
    private var target: String = WomenPrivacyGate.TARGET_COMPANION
    private var authenticationStarted = false

    private val credentialLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            WomenPrivacyStore.markUnlocked(this)
            startActivity(WomenPrivacyGate.destination(this, target))
        }
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        target = WomenPrivacyGate.target(intent)

        if (!WomenPrivacyStore.enabled(this) || WomenPrivacyStore.sessionUnlocked(this)) {
            startActivity(WomenPrivacyGate.destination(this, target))
            finish()
            return
        }

        setContent {
            RawafidTheme {
                Surface(Modifier.fillMaxSize()) {
                    PrivacyGateScreen(
                        canUseDeviceLock = WomenPrivacyStore.canUseDeviceLock(this),
                        onUnlock = ::requestDeviceCredential,
                        onCancel = ::finish
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (!authenticationStarted && WomenPrivacyStore.enabled(this) && !WomenPrivacyStore.sessionUnlocked(this)) {
            requestDeviceCredential()
        }
    }

    private fun requestDeviceCredential() {
        if (authenticationStarted) return
        val manager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        if (!manager.isDeviceSecure) return
        val confirmIntent = manager.createConfirmDeviceCredentialIntent(
            "فتح قطاع المرأة",
            "استخدمي قفل الهاتف للوصول إلى بيانات وإعدادات قطاع المرأة."
        ) ?: return
        authenticationStarted = true
        credentialLauncher.launch(confirmIntent)
    }
}

@Composable
private fun PrivacyGateScreen(canUseDeviceLock: Boolean, onUnlock: () -> Unit, onCancel: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(28.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Icon(Icons.Default.Lock, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
        Spacer(Modifier.size(16.dp))
        Text("قطاع المرأة مقفل", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.size(8.dp))
        Text(
            if (canUseDeviceLock)
                "لحماية التقويم والمتابعات والملاحظات والإعدادات، افتحي هذا القسم باستخدام قفل هاتفك."
            else
                "قفل الخصوصية مفعّل لكن الهاتف لا يملك قفل شاشة آمنًا حاليًا. فعّلي قفل الجهاز أولًا لحماية هذا القسم."
        )
        Spacer(Modifier.size(20.dp))
        Button(onClick = onUnlock, enabled = canUseDeviceLock, modifier = Modifier.fillMaxWidth()) { Text("فتح بأمان") }
        Spacer(Modifier.size(8.dp))
        OutlinedButton(onClick = onCancel, modifier = Modifier.fillMaxWidth()) { Text("إلغاء") }
    }
}
