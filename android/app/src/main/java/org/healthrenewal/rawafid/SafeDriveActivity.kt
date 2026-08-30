package org.healthrenewal.rawafid

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.DateFormat
import java.util.Date
import java.util.Locale

class SafeDriveActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { SafeDriveScreen() }
                }
            }
        }
    }
}

@Composable
private fun SafeDriveScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val live by SafeDriveRuntime.state.collectAsState()
    val pending by SafeDriveRuntime.pendingCheck.collectAsState()
    var driveConfig by remember { mutableStateOf(SafeDriveStore.config(context)) }
    var incidentConfig by remember { mutableStateOf(SafeDriveIncidentStore.config(context)) }
    var speedText by remember { mutableStateOf(driveConfig.personalSpeedAlertKmh.toString()) }
    var secondsText by remember { mutableStateOf(driveConfig.speedAlertAfterSeconds.toString()) }
    var responseText by remember { mutableStateOf(incidentConfig.responseSeconds.toString()) }
    var status by remember { mutableStateOf("") }
    var configExpanded by remember { mutableStateOf(false) }
    var sharingExpanded by remember { mutableStateOf(false) }
    var reportsExpanded by remember { mutableStateOf(true) }
    var checksExpanded by remember { mutableStateOf(false) }
    var connections by remember { mutableStateOf<List<CircleConnection>>(emptyList()) }
    val drivePermission = remember { mutableStateMapOf<String, Boolean>() }
    var sharingBusy by remember { mutableStateOf(false) }
    val reports = remember(live.active, live.lastCompletedReport?.id) { SafeDriveStore.reports(context) }
    val incidentRecords = remember(pending?.candidate?.id, live.active) { SafeDriveIncidentStore.records(context) }
    val safeChecks = remember(incidentRecords) { incidentRecords.filter { it.outcome == SafeDriveIncidentOutcome.SAFE_CONFIRMED } }
    val helpChecks = remember(incidentRecords) { incidentRecords.filter { it.outcome != SafeDriveIncidentOutcome.SAFE_CONFIRMED } }

    fun saveConfig(): Boolean {
        val speed = speedText.toIntOrNull()
        val seconds = secondsText.toIntOrNull()
        val responseSeconds = responseText.toIntOrNull()
        if (speed == null || speed !in 50..180) {
            status = "حد التنبيه الشخصي يجب أن يكون بين 50 و180 كم/س."
            return false
        }
        if (seconds == null || seconds !in 30..900) {
            status = "مدة استمرار السرعة يجب أن تكون بين 30 و900 ثانية."
            return false
        }
        if (responseSeconds == null || responseSeconds !in 20..120) {
            status = "مهلة الاطمئنان يجب أن تكون بين 20 و120 ثانية."
            return false
        }
        driveConfig = driveConfig.copy(personalSpeedAlertKmh = speed, speedAlertAfterSeconds = seconds).normalized()
        incidentConfig = incidentConfig.copy(responseSeconds = responseSeconds).normalized()
        SafeDriveStore.saveConfig(context, driveConfig)
        SafeDriveIncidentStore.saveConfig(context, incidentConfig)
        status = "تم حفظ إعدادات القيادة الآمنة."
        return true
    }

    fun loadSharing() {
        if (!RawafidCircleApi.hasSession(context) || sharingBusy) return
        sharingBusy = true
        scope.launch {
            val result = withContext(Dispatchers.IO) {
                runCatching {
                    val people = RawafidCircleApi.connections(context)
                    val permissions = people.associate { connection ->
                        val enabled = RawafidCircleApi.permissionSnapshot(context, connection.connectionId)
                            .firstOrNull { it.permission == "driving_safety" }
                            ?.mine == true
                        connection.connectionId to enabled
                    }
                    people to permissions
                }
            }
            result.onSuccess { (people, permissions) ->
                connections = people
                drivePermission.clear()
                drivePermission.putAll(permissions)
            }.onFailure { status = it.message ?: "تعذر تحميل جهات مشاركة القيادة." }
            sharingBusy = false
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
        val locationGranted = result[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (locationGranted) {
            if (saveConfig()) SafeDriveController.start(context)
        } else {
            status = "يلزم الموقع الدقيق لقياس السرعة والمسافة ومؤشرات التوقف المفاجئ. يمكنك رفضه ولن تبدأ جلسة القيادة."
        }
    }

    fun startTrip() {
        if (!saveConfig()) return
        val required = buildList {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                add(Manifest.permission.ACCESS_COARSE_LOCATION)
                add(Manifest.permission.ACCESS_FINE_LOCATION)
            }
            if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }.distinct()
        if (required.isEmpty()) SafeDriveController.start(context) else permissionLauncher.launch(required.toTypedArray())
    }

    LaunchedEffect(sharingExpanded) {
        if (sharingExpanded) loadSharing()
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = RawafidSpacing.ScreenHorizontal, vertical = RawafidSpacing.ScreenVertical),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("قيادة آمنة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("متابعة اختيارية للسرعة والحركة والتوقف المفاجئ. لا يخزن روافد مسار الرحلة الكامل؛ يحتفظ محليًا بملخصات وتقارير مجمعة.")
            }
        }

        if (live.active) {
            item {
                Card {
                    Column(
                        Modifier.fillMaxWidth().padding(RawafidSpacing.CardContent),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
                    ) {
                        Text("السرعة الحالية", style = MaterialTheme.typography.titleMedium)
                        Text("${live.currentSpeedKmh.toInt()}", style = MaterialTheme.typography.displayLarge, fontWeight = FontWeight.Bold)
                        Text("كم/س", style = MaterialTheme.typography.titleMedium)
                        Text("حد التنبيه الشخصي: ${driveConfig.personalSpeedAlertKmh} كم/س", style = MaterialTheme.typography.bodySmall)
                        Text("هذا ليس حد السرعة القانوني للطريق.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("الرحلة الآن", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        MetricLine("المدة", SafeDriveScoring.formatDuration(live.elapsedMs))
                        MetricLine("المسافة", oneDecimal(live.distanceKm) + " كم")
                        MetricLine("أعلى سرعة", live.maxSpeedKmh.toInt().toString() + " كم/س")
                        MetricLine("التقييم المؤقت", "${live.provisionalScore}/100")
                        MetricLine("جودة القياس", live.dataQuality)
                        if (live.statusMessage.isNotBlank()) Text(live.statusMessage, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("مؤشرات الرحلة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        MetricLine("وقت فوق حد التنبيه الشخصي", SafeDriveScoring.formatDuration(live.highSpeedDurationMs))
                        MetricLine("تسارع حاد", live.harshAccelerationCount.toString())
                        MetricLine("فرملة حادة", live.harshBrakingCount.toString())
                        MetricLine("انعطاف حاد", live.hardTurnCount.toString())
                        MetricLine("تنبيهات سرعة شديدة", live.severeSpeedCount.toString())
                        MetricLine("تجمع مؤشرات خطورة", live.riskClusterCount.toString())
                    }
                }
            }
            item {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Button(onClick = { SafeDriveController.requestHelpNow(context) }) { Text("أحتاج مساعدة") }
                    OutlinedButton(onClick = { SafeDriveController.stop(context) }) { Text("إنهاء الرحلة") }
                }
            }
        } else {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("ابدأ رحلة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("شغّل المراقبة فقط عندما تكون أنت السائق. إذا كنت راكبًا فلا تبدأ جلسة قيادة.")
                        Button(onClick = ::startTrip, modifier = Modifier.fillMaxWidth()) { Text("ابدأ القيادة الآمنة") }
                        Text("سيظهر إشعار مستمر طوال الرحلة ويمكنك إيقافها في أي وقت.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("التوقف المفاجئ — هل أنت بخير؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            Text("عند رصد توقف سريع مدعوم بتباطؤ حاد أو صدمة من الهاتف، يسألك روافد أولًا قبل إرسال طلب مساعدة.")
                        }
                        Switch(incidentConfig.enabled, onCheckedChange = {
                            incidentConfig = incidentConfig.copy(enabled = it)
                            SafeDriveIncidentStore.saveConfig(context, incidentConfig)
                        })
                    }
                    Text("إذا أجبت «نعم» تُسجل نقطة اطمئنان محلية مشفرة فقط. إذا أجبت «لا» يُرسل تنبيه مع آخر موقع موثوق إلى الأشخاص الذين منحتهم صلاحية القيادة الآمنة.")
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("التصعيد عند عدم الرد")
                            Text("اختياري: إذا لم تجب خلال المهلة، أرسل طلب مساعدة تلقائيًا.", style = MaterialTheme.typography.bodySmall)
                        }
                        Switch(incidentConfig.autoEscalateIfUnanswered, onCheckedChange = {
                            incidentConfig = incidentConfig.copy(autoEscalateIfUnanswered = it)
                            SafeDriveIncidentStore.saveConfig(context, incidentConfig)
                        })
                    }
                    OutlinedTextField(
                        value = responseText,
                        onValueChange = { responseText = it.filter(Char::isDigit).take(3) },
                        label = { Text("مهلة الاطمئنان بالثواني (20–120)") },
                        enabled = !live.active,
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Text("نقاط الاطمئنان المسجلة: ${safeChecks.size} · طلبات/تصعيد المساعدة: ${helpChecks.size}", style = MaterialTheme.typography.bodySmall)
                    OutlinedButton(onClick = { checksExpanded = !checksExpanded }) {
                        Text(if (checksExpanded) "إخفاء سجل الاطمئنان" else "عرض سجل الاطمئنان")
                    }
                }
            }
        }

        if (checksExpanded) {
            if (incidentRecords.isEmpty()) item { Text("لم تُسجل نقاط توقف مفاجئ بعد.") }
            items(incidentRecords.take(20), key = { it.id }) { record ->
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text(
                            DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(record.detectedAtMs)),
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            when (record.outcome) {
                                SafeDriveIncidentOutcome.SAFE_CONFIRMED -> "نقطة اطمئنان — أكد المستخدم أنه بخير"
                                SafeDriveIncidentOutcome.HELP_REQUESTED -> "طلب مساعدة — تم تشغيل مسار التواصل"
                                SafeDriveIncidentOutcome.AUTO_ESCALATED -> "تصعيد أمان — لم يصل رد ضمن المهلة"
                            }
                        )
                        Text("السرعة قبل التوقف: ${record.preStopSpeedKmh.toInt()} كم/س · التباطؤ: ${oneDecimal(record.decelerationMps2)} م/ث²", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }

        item {
            OutlinedButton(onClick = { configExpanded = !configExpanded }, modifier = Modifier.fillMaxWidth()) {
                Text(if (configExpanded) "إخفاء إعدادات القياس" else "إعدادات القياس والتنبيهات")
            }
        }
        if (configExpanded) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("حدودك الشخصية", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("هذه الحدود للتنبيه الشخصي وتحليل السلوك فقط ولا تمثل السرعة القانونية للطريق.")
                        OutlinedTextField(
                            value = speedText,
                            onValueChange = { speedText = it.filter(Char::isDigit).take(3) },
                            label = { Text("تنبيه السرعة — كم/س (50–180)") },
                            enabled = !live.active,
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = secondsText,
                            onValueChange = { secondsText = it.filter(Char::isDigit).take(3) },
                            label = { Text("بعد استمرار السرعة — ثانية (30–900)") },
                            enabled = !live.active,
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        PermissionSwitch(
                            title = "مشاركة التنبيهات عالية الخطورة",
                            subtitle = "يرسل فقط السرعة المستمرة/الشديدة أو تجمع مؤشرات الخطورة إلى الجهات التي اخترتها في دائرتك، دون مشاركة الموقع الحي لهذه التنبيهات.",
                            checked = driveConfig.shareLiveAlerts,
                            enabled = !live.active,
                            onChange = { driveConfig = driveConfig.copy(shareLiveAlerts = it) }
                        )
                        PermissionSwitch(
                            title = "مشاركة تقرير نهاية الرحلة",
                            subtitle = "يرسل الملخص المجمّع فقط؛ لا يرسل مسار الرحلة الكامل.",
                            checked = driveConfig.shareTripReports,
                            enabled = !live.active,
                            onChange = { driveConfig = driveConfig.copy(shareTripReports = it) }
                        )
                        Button(enabled = !live.active, onClick = { saveConfig() }) { Text("حفظ الإعدادات") }
                    }
                }
            }
        }

        item {
            OutlinedButton(onClick = { sharingExpanded = !sharingExpanded }, modifier = Modifier.fillMaxWidth()) {
                Text(if (sharingExpanded) "إخفاء مشاركة القيادة" else "من يستلم تنبيهات وتقارير القيادة؟")
            }
        }
        if (sharingExpanded) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("اتفاق القيادة الآمنة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("لا يستلم أحد شيئًا بمجرد ارتباطه بك. أنت تمنح صلاحية «القيادة الآمنة» لكل شخص على حدة ويمكن سحبها في أي وقت.")
                        Text("إذا اخترت «لا، أحتاج مساعدة» بعد توقف مفاجئ، يتلقى هؤلاء الأشخاص تنبيه المساعدة وآخر موقع موثوق. أما تنبيهات أسلوب القيادة العادية فلا تتضمن موقعك الحي.", style = MaterialTheme.typography.bodySmall)
                        if (!RawafidCircleApi.hasSession(context)) {
                            Text("سجّل الدخول أولًا لاختيار أشخاص من دائرتك.")
                            Button(onClick = { context.startActivity(Intent(context, CircleAccountActivity::class.java)) }) { Text("حساب روافد") }
                        } else if (sharingBusy) {
                            Text("جارٍ تحميل دائرتك...")
                        } else if (connections.isEmpty()) {
                            Text("لا توجد ارتباطات مقبولة بعد.")
                            OutlinedButton(onClick = { context.startActivity(Intent(context, MyCircleActivity::class.java)) }) { Text("فتح دائرتي") }
                        }
                    }
                }
            }
            items(connections, key = { it.connectionId }) { connection ->
                Card {
                    Row(
                        Modifier.fillMaxWidth().padding(RawafidSpacing.CardContent),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text(connection.counterpartName, fontWeight = FontWeight.Bold)
                            if (connection.myLabel.isNotBlank()) Text(connection.myLabel, style = MaterialTheme.typography.bodySmall)
                            Text("تنبيهات عالية الخطورة + طلبات المساعدة والموقع عند الحاجة + التقرير إذا فعّلت مشاركته", style = MaterialTheme.typography.bodySmall)
                        }
                        Switch(
                            checked = drivePermission[connection.connectionId] == true,
                            enabled = !sharingBusy,
                            onCheckedChange = { enabled ->
                                sharingBusy = true
                                scope.launch {
                                    val result = withContext(Dispatchers.IO) {
                                        runCatching { RawafidCircleApi.setPermission(context, connection.connectionId, "driving_safety", enabled) }
                                    }
                                    result.onSuccess { drivePermission[connection.connectionId] = enabled }
                                        .onFailure { status = it.message ?: "تعذر تحديث صلاحية القيادة." }
                                    sharingBusy = false
                                }
                            }
                        )
                    }
                }
            }
        }

        item {
            OutlinedButton(onClick = { reportsExpanded = !reportsExpanded }, modifier = Modifier.fillMaxWidth()) {
                Text(if (reportsExpanded) "إخفاء تقارير الرحلات" else "سجل وتقارير الرحلات")
            }
        }
        if (reportsExpanded) {
            if (reports.isEmpty()) item { Text("لا توجد تقارير قيادة محفوظة بعد.") }
            items(reports.take(20), key = { it.id }) { report ->
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text(
                            DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(report.startedAtMs)),
                            fontWeight = FontWeight.Bold
                        )
                        Text("${report.score}/100 — ${report.riskLabel}", style = MaterialTheme.typography.titleMedium)
                        Text("${SafeDriveScoring.formatDuration(report.durationMs)} · ${oneDecimal(report.distanceKm)} كم · أعلى سرعة ${report.maxSpeedKmh.toInt()} كم/س")
                        Text("فوق حد التنبيه: ${SafeDriveScoring.formatDuration(report.highSpeedDurationMs)} · تسارع ${report.harshAccelerationCount} · فرملة ${report.harshBrakingCount} · انعطاف ${report.hardTurnCount}", style = MaterialTheme.typography.bodySmall)
                        Text("جودة القياس: ${report.dataQuality}", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }

        if (status.isNotBlank()) item { Text(status, color = MaterialTheme.colorScheme.primary) }
        item {
            HorizontalDivider()
            Text(
                "تنبيه تقني: قياسات الهاتف تقديرية وقد تتأثر بجودة GPS، موضع الهاتف، الأنفاق والازدحام. روافد لا يقرر مخالفة قانونية ولا يصف شخصًا بأنه «متهور» بناءً على قراءة واحدة.",
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Start
            )
        }
    }

    pending?.let { check ->
        AlertDialog(
            onDismissRequest = {},
            title = { Text("هل أنت بخير؟") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("رصد روافد توقفًا مفاجئًا محتملاً.")
                    Text(check.candidate.reason)
                    Text("إذا كنت بخير سجّل نقطة الاطمئنان. إذا احتجت مساعدة، سيرسل آخر موقع موثوق للأشخاص الذين اخترتهم في اتفاق القيادة الآمنة.")
                    if (incidentConfig.autoEscalateIfUnanswered) {
                        Text("التصعيد التلقائي مفعل إذا لم يصل رد خلال ${incidentConfig.responseSeconds} ثانية.", fontWeight = FontWeight.Bold)
                    }
                }
            },
            confirmButton = {
                Button(onClick = { SafeDriveController.confirmSafe(context) }) { Text("نعم، أنا بخير") }
            },
            dismissButton = {
                Button(onClick = { SafeDriveController.requestHelp(context) }) { Text("لا، أحتاج مساعدة") }
            }
        )
    }
}

@Composable
private fun MetricLine(label: String, value: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label)
        Text(value, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun PermissionSwitch(
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

private fun oneDecimal(value: Double): String = String.format(Locale.US, "%.1f", value)
