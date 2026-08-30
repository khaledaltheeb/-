package org.healthrenewal.rawafid

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SafeDriveAgreementsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { SafeDriveAgreementsScreen() }
                }
            }
        }
    }
}

@Composable
private fun SafeDriveAgreementsScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var connections by remember { mutableStateOf<List<CircleConnection>>(emptyList()) }
    var agreements by remember { mutableStateOf<Map<String, CircleDriveAgreement>>(emptyMap()) }
    var weeklyPreferences by remember { mutableStateOf<Map<String, CircleDriveWeeklyPreference>>(emptyMap()) }
    var loading by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf("") }

    fun reload() {
        if (loading || !RawafidCircleApi.hasSession(context)) return
        loading = true
        scope.launch {
            val result = withContext(Dispatchers.IO) {
                runCatching {
                    Triple(
                        RawafidCircleApi.connections(context),
                        RawafidCircleApi.driveAgreements(context).associateBy { it.connectionId },
                        RawafidCircleApi.driveWeeklyPreferences(context).associateBy { it.connectionId }
                    )
                }
            }
            result.onSuccess { (people, rules, weekly) ->
                connections = people
                agreements = rules
                weeklyPreferences = weekly
                status = ""
            }.onFailure { status = it.message ?: "تعذر تحميل اتفاقات القيادة الآمنة." }
            loading = false
        }
    }

    LaunchedEffect(Unit) { reload() }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = RawafidSpacing.ScreenHorizontal, vertical = RawafidSpacing.ScreenVertical),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("اتفاق القيادة الآمنة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("حدد لكل شخص على حدة ماذا يمكن أن يستلم. الارتباط وحده لا يمنح أي تقرير أو تنبيه، ويمكنك سحب الإذن في أي وقت.")
                Text("تنبيهات أسلوب القيادة لا تتضمن موقعك الحي. آخر موقع موثوق يُرسل فقط عند طلب المساعدة أو التصعيد الذي فعّلته مسبقًا.", style = MaterialTheme.typography.bodySmall)
            }
        }

        if (!RawafidCircleApi.hasSession(context)) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("سجّل الدخول أولًا", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("تحتاج حساب روافد لربط اتفاق القيادة بشخص من دائرتك.")
                        Button(onClick = { context.startActivity(Intent(context, CircleAccountActivity::class.java)) }) { Text("حساب روافد") }
                    }
                }
            }
        } else if (loading && connections.isEmpty()) {
            item { Text("جارٍ تحميل دائرتك...") }
        } else if (connections.isEmpty()) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("لا توجد ارتباطات مقبولة بعد.")
                        OutlinedButton(onClick = { context.startActivity(Intent(context, MyCircleActivity::class.java)) }) { Text("فتح دائرتي") }
                    }
                }
            }
        }

        items(connections, key = { it.connectionId }) { person ->
            val current = agreements[person.connectionId] ?: CircleDriveAgreement(
                connectionId = person.connectionId,
                permissionEnabled = false,
                incidentsEnabled = true,
                riskAlertsEnabled = true,
                tripReportsEnabled = true,
                speedThresholdKmh = 120,
                persistentSpeedSeconds = 120
            )
            val weeklyEnabled = weeklyPreferences[person.connectionId]?.weeklyReportsEnabled == true
            DriveAgreementCard(
                person = person,
                agreement = current,
                weeklyEnabled = weeklyEnabled,
                busy = loading,
                onSave = { next ->
                    if (loading) return@DriveAgreementCard
                    loading = true
                    scope.launch {
                        val result = withContext(Dispatchers.IO) {
                            runCatching { RawafidCircleApi.setDriveAgreement(context, next) }
                        }
                        result.onSuccess {
                            agreements = agreements + (next.connectionId to next)
                            status = "تم حفظ اتفاق القيادة مع ${person.counterpartName}."
                        }.onFailure { status = it.message ?: "تعذر حفظ اتفاق القيادة." }
                        loading = false
                    }
                },
                onMasterToggle = { enabled ->
                    if (loading) return@DriveAgreementCard
                    loading = true
                    scope.launch {
                        val result = withContext(Dispatchers.IO) {
                            runCatching { RawafidCircleApi.setPermission(context, person.connectionId, "driving_safety", enabled) }
                        }
                        result.onSuccess {
                            agreements = agreements + (person.connectionId to current.copy(permissionEnabled = enabled))
                            weeklyPreferences = weeklyPreferences + (
                                person.connectionId to CircleDriveWeeklyPreference(
                                    connectionId = person.connectionId,
                                    permissionEnabled = enabled,
                                    weeklyReportsEnabled = weeklyEnabled
                                )
                            )
                            status = if (enabled) "تم تفعيل اتفاق القيادة مع ${person.counterpartName}." else "تم إيقاف مشاركة القيادة مع ${person.counterpartName}."
                        }.onFailure { status = it.message ?: "تعذر تحديث إذن القيادة الآمنة." }
                        loading = false
                    }
                },
                onWeeklyToggle = { enabled ->
                    if (loading || !current.permissionEnabled) return@DriveAgreementCard
                    loading = true
                    scope.launch {
                        val result = withContext(Dispatchers.IO) {
                            runCatching { RawafidCircleApi.setDriveWeeklyReportEnabled(context, person.connectionId, enabled) }
                        }
                        result.onSuccess {
                            weeklyPreferences = weeklyPreferences + (
                                person.connectionId to CircleDriveWeeklyPreference(
                                    connectionId = person.connectionId,
                                    permissionEnabled = current.permissionEnabled,
                                    weeklyReportsEnabled = enabled
                                )
                            )
                            status = if (enabled) {
                                "تم تفعيل الملخص الأسبوعي التلقائي مع ${person.counterpartName}."
                            } else {
                                "تم إيقاف الملخص الأسبوعي التلقائي مع ${person.counterpartName}."
                            }
                        }.onFailure { status = it.message ?: "تعذر تحديث الملخص الأسبوعي." }
                        loading = false
                    }
                }
            )
        }

        if (status.isNotBlank()) item { Text(status, color = MaterialTheme.colorScheme.primary) }
        if (RawafidCircleApi.hasSession(context)) {
            item { OutlinedButton(enabled = !loading, onClick = ::reload, modifier = Modifier.fillMaxWidth()) { Text("تحديث الاتفاقات") } }
        }
    }
}

@Composable
private fun DriveAgreementCard(
    person: CircleConnection,
    agreement: CircleDriveAgreement,
    weeklyEnabled: Boolean,
    busy: Boolean,
    onSave: (CircleDriveAgreement) -> Unit,
    onMasterToggle: (Boolean) -> Unit,
    onWeeklyToggle: (Boolean) -> Unit
) {
    var incidents by remember(agreement.connectionId, agreement.incidentsEnabled) { mutableStateOf(agreement.incidentsEnabled) }
    var risks by remember(agreement.connectionId, agreement.riskAlertsEnabled) { mutableStateOf(agreement.riskAlertsEnabled) }
    var reports by remember(agreement.connectionId, agreement.tripReportsEnabled) { mutableStateOf(agreement.tripReportsEnabled) }
    var speed by remember(agreement.connectionId, agreement.speedThresholdKmh) { mutableStateOf(agreement.speedThresholdKmh.toString()) }
    var seconds by remember(agreement.connectionId, agreement.persistentSpeedSeconds) { mutableStateOf(agreement.persistentSpeedSeconds.toString()) }
    var localError by remember(agreement.connectionId) { mutableStateOf("") }

    Card {
        Column(Modifier.fillMaxWidth().padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(person.counterpartName, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    if (person.myLabel.isNotBlank()) Text(person.myLabel, style = MaterialTheme.typography.bodySmall)
                    Text(if (agreement.permissionEnabled) "اتفاق القيادة مفعّل" else "المشاركة متوقفة", style = MaterialTheme.typography.bodySmall)
                }
                Switch(checked = agreement.permissionEnabled, enabled = !busy, onCheckedChange = onMasterToggle)
            }

            AgreementToggle(
                title = "تنبيهات طلب المساعدة والتوقف المفاجئ",
                subtitle = "إذا طلبت المساعدة أو فُعّل التصعيد لعدم الرد، يمكن إرسال آخر موقع موثوق لهذا الشخص.",
                checked = incidents,
                enabled = !busy,
                onChange = { incidents = it }
            )
            AgreementToggle(
                title = "تنبيهات القيادة عالية الخطورة",
                subtitle = "تشمل السرعة المستمرة ومؤشرات الخطورة المتكررة، دون إرسال الموقع الحي.",
                checked = risks,
                enabled = !busy,
                onChange = { risks = it }
            )
            AgreementToggle(
                title = "تقرير نهاية الرحلة",
                subtitle = "ملخص مجمّع فقط: مدة ومسافة وسرعة ومؤشرات وتقييم؛ لا يتضمن مسار GPS الكامل.",
                checked = reports,
                enabled = !busy,
                onChange = { reports = it }
            )
            AgreementToggle(
                title = "ملخص أسبوعي تلقائي",
                subtitle = "اختياري ومعطل افتراضيًا. مرة أسبوعيًا يرسل ملخصًا مجمعًا من هذا الجهاز فقط؛ دون مسار GPS أو موقع حي.",
                checked = weeklyEnabled,
                enabled = !busy && agreement.permissionEnabled,
                onChange = onWeeklyToggle
            )
            if (!agreement.permissionEnabled && weeklyEnabled) {
                Text("الملخص الأسبوعي موقوف فعليًا لأن إذن «القيادة الآمنة» الرئيسي غير مفعّل لهذا الشخص.", style = MaterialTheme.typography.bodySmall)
            }

            OutlinedTextField(
                value = speed,
                onValueChange = { speed = it.filter(Char::isDigit).take(3) },
                label = { Text("تنبيه السرعة لهذا الشخص — كم/س (50–180)") },
                enabled = !busy && risks,
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = seconds,
                onValueChange = { seconds = it.filter(Char::isDigit).take(3) },
                label = { Text("استمرار السرعة قبل التنبيه — ثانية (30–900)") },
                enabled = !busy && risks,
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Text("هذه سرعة اتفاق شخصية وليست حد السرعة القانوني للطريق.", style = MaterialTheme.typography.bodySmall)

            if (localError.isNotBlank()) Text(localError, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            Button(
                enabled = !busy,
                onClick = {
                    val threshold = speed.toIntOrNull()
                    val duration = seconds.toIntOrNull()
                    if (threshold == null || threshold !in 50..180) {
                        localError = "السرعة يجب أن تكون بين 50 و180 كم/س."
                        return@Button
                    }
                    if (duration == null || duration !in 30..900) {
                        localError = "مدة الاستمرار يجب أن تكون بين 30 و900 ثانية."
                        return@Button
                    }
                    localError = ""
                    onSave(
                        agreement.copy(
                            incidentsEnabled = incidents,
                            riskAlertsEnabled = risks,
                            tripReportsEnabled = reports,
                            speedThresholdKmh = threshold,
                            persistentSpeedSeconds = duration
                        )
                    )
                },
                modifier = Modifier.fillMaxWidth()
            ) { Text("حفظ اتفاق هذا الشخص") }
        }
    }
}

@Composable
private fun AgreementToggle(
    title: String,
    subtitle: String,
    checked: Boolean,
    enabled: Boolean,
    onChange: (Boolean) -> Unit
) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(title, fontWeight = FontWeight.Bold)
            Text(subtitle, style = MaterialTheme.typography.bodySmall)
        }
        Switch(checked = checked, enabled = enabled, onCheckedChange = onChange)
    }
}
