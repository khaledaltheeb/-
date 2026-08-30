package org.healthrenewal.rawafid

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContract
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import java.time.Duration
import java.time.Instant
import java.time.temporal.ChronoUnit

class HealthConnectActivity : ComponentActivity() {
    private val permissionsContract: ActivityResultContract<Set<String>, Set<String>> =
        PermissionController.createRequestPermissionResultContract()
    private var permissionContinuation: ((Set<String>) -> Unit)? = null
    private val permissionsLauncher = registerForActivityResult(permissionsContract) { granted ->
        permissionContinuation?.invoke(granted)
        permissionContinuation = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) {
                        HealthConnectScreen(
                            requestPermissions = { requested, callback ->
                                permissionContinuation = callback
                                permissionsLauncher.launch(requested)
                            },
                            launchRead = { block -> lifecycleScope.launch { block() } }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun HealthConnectScreen(
    requestPermissions: (Set<String>, (Set<String>) -> Unit) -> Unit,
    launchRead: (() -> Unit) -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val sdkStatus = remember { HealthConnectClient.getSdkStatus(context) }
    val available = sdkStatus == HealthConnectClient.SDK_AVAILABLE
    val client = remember(available) { if (available) HealthConnectClient.getOrCreate(context) else null }
    var includeSteps by remember { mutableStateOf(true) }
    var includeSleep by remember { mutableStateOf(true) }
    var permissionState by remember { mutableStateOf("لم يتم الفحص بعد") }
    var stepsText by remember { mutableStateOf("—") }
    var sleepText by remember { mutableStateOf("—") }
    var errorText by remember { mutableStateOf("") }

    fun requestedPermissions(): Set<String> = buildSet {
        if (includeSteps) add(HealthPermission.getReadPermission(StepsRecord::class))
        if (includeSleep) add(HealthPermission.getReadPermission(SleepSessionRecord::class))
    }

    fun refresh() {
        val hc = client ?: return
        val requested = requestedPermissions()
        if (requested.isEmpty()) {
            permissionState = "اختر نوع بيانات واحدًا على الأقل."
            return
        }
        launchRead {
            try {
                val granted = hc.permissionController.getGrantedPermissions()
                if (!granted.containsAll(requested)) {
                    permissionState = "تحتاج إلى منح الصلاحيات المختارة."
                    return@launchRead
                }
                permissionState = "الصلاحيات المطلوبة ممنوحة."
                errorText = ""
                val now = Instant.now()
                val start = now.minus(7, ChronoUnit.DAYS)
                if (includeSteps) {
                    val response = hc.aggregate(
                        AggregateRequest(
                            metrics = setOf(StepsRecord.COUNT_TOTAL),
                            timeRangeFilter = TimeRangeFilter.between(start, now)
                        )
                    )
                    val total = response[StepsRecord.COUNT_TOTAL] ?: 0L
                    stepsText = "$total خطوة خلال 7 أيام"
                }
                if (includeSleep) {
                    val response = hc.readRecords(
                        ReadRecordsRequest(
                            SleepSessionRecord::class,
                            timeRangeFilter = TimeRangeFilter.between(start, now)
                        )
                    )
                    val minutes = response.records.sumOf { Duration.between(it.startTime, it.endTime).toMinutes() }
                    val sessions = response.records.size
                    sleepText = "$sessions جلسة · $minutes دقيقة مسجلة خلال 7 أيام"
                }
            } catch (t: Throwable) {
                errorText = "تعذر قراءة البيانات الآن: ${t.message.orEmpty().take(160)}"
            }
        }
    }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Health Connect", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("اختياري تمامًا. روافد يطلب فقط البيانات التي تختار قراءتها، ولا يكتب خطوات أو نومًا إلى Health Connect في هذه النسخة.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text("حالة الخدمة", fontWeight = FontWeight.Bold)
                    Text(
                        when (sdkStatus) {
                            HealthConnectClient.SDK_AVAILABLE -> "Health Connect متاح على هذا الجهاز."
                            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> "Health Connect يحتاج تثبيتًا أو تحديثًا."
                            else -> "Health Connect غير متاح على هذا الجهاز."
                        }
                    )
                }
            }
        }
        if (available) {
            item { HealthDataToggle("الخطوات", "قراءة إجمالي الخطوات فقط.", includeSteps) { includeSteps = it } }
            item { HealthDataToggle("النوم", "قراءة جلسات النوم ومددها المسجلة.", includeSleep) { includeSleep = it } }
            item {
                Button(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        val requested = requestedPermissions()
                        if (requested.isNotEmpty()) {
                            requestPermissions(requested) { granted ->
                                permissionState = if (granted.containsAll(requested)) "تم منح الصلاحيات المختارة." else "لم تُمنح كل الصلاحيات المختارة. يمكنك تغييرها لاحقًا من Health Connect."
                                if (granted.containsAll(requested)) refresh()
                            }
                        }
                    }
                ) { Text("اختيار الصلاحيات") }
            }
            item { Button(modifier = Modifier.fillMaxWidth(), onClick = ::refresh) { Text("تحديث بياناتي") } }
            item {
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("النتيجة", fontWeight = FontWeight.Bold)
                        Text(permissionState)
                        if (includeSteps) Text("الخطوات: $stepsText")
                        if (includeSleep) Text("النوم: $sleepText")
                        if (errorText.isNotBlank()) Text(errorText, color = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
        item {
            Text("هذه الأرقام وصفية من المصادر المتصلة بـHealth Connect، ولا يستخدمها روافد لتشخيص حالة أو إثبات سبب عرض.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun HealthDataToggle(title: String, subtitle: String, checked: Boolean, changed: (Boolean) -> Unit) {
    Card {
        Row(Modifier.fillMaxWidth().padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(title, fontWeight = FontWeight.Bold)
                Text(subtitle, style = MaterialTheme.typography.bodySmall)
            }
            Switch(checked = checked, onCheckedChange = changed)
        }
    }
}
