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
        val autoDetected = intent?.getBooleanExtra(EXTRA_SAFE_DRIVE_AUTO_DETECTED, false) == true
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { SafeDriveScreen(autoDetected = autoDetected) }
                }
            }
        }
    }
}

@Composable
private fun SafeDriveScreen(autoDetected: Boolean = false) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val live by SafeDriveRuntime.state.collectAsState()
    val pending by SafeDriveRuntime.pendingCheck.collectAsState()
    var driveConfig by remember { mutableStateOf(SafeDriveStore.config(context)) }
    var incidentConfig by remember { mutableStateOf(SafeDriveIncidentStore.config(context)) }
    var advancedConfig by remember { mutableStateOf(SafeDriveAdvancedStore.config(context)) }
    var speedText by remember { mutableStateOf(driveConfig.personalSpeedAlertKmh.toString()) }
    var secondsText by remember { mutableStateOf(driveConfig.speedAlertAfterSeconds.toString()) }
    var responseText by remember { mutableStateOf(incidentConfig.responseSeconds.toString()) }
    var restMinutesText by remember { mutableStateOf(advancedConfig.restReminderMinutes.toString()) }
    var status by remember { mutableStateOf("") }
    var configExpanded by remember { mutableStateOf(false) }
    var advancedExpanded by remember { mutableStateOf(autoDetected) }
    var sharingExpanded by remember { mutableStateOf(false) }
    var reportsExpanded by remember { mutableStateOf(true) }
    var checksExpanded by remember { mutableStateOf(false) }
    var connections by remember { mutableStateOf<List<CircleConnection>>(emptyList()) }
    val drivePermission = remember { mutableStateMapOf<String, Boolean>() }
    var sharingBusy by remember { mutableStateOf(false) }
    val reports = remember(live.active, live.lastCompletedReport?.id) { SafeDriveStore.reports(context) }
    val weekly = remember(reports) { SafeDriveWeeklyAnalytics.summarize(reports) }
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

    fun saveAdvanced(next: SafeDriveAdvancedConfig = advancedConfig): Boolean {
        val rest = restMinutesText.toIntOrNull()
        if (rest == null || rest !in 60..240) {
            status = "تذكير الاستراحة يجب أن يكون بين 60 و240 دقيقة."
            return false
        }
        advancedConfig = next.copy(restReminderMinutes = rest).normalized()
        SafeDriveAdvancedStore.save(context, advancedConfig)
        status = "تم حفظ إعدادات المساعدة أثناء القيادة."
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

    val autoDetectionPermissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
        val recognitionGranted = SafeDriveAutoDetection.hasPermission(context)
        val notificationGranted = Build.VERSION.SDK_INT < 33 ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
        if (recognitionGranted && notificationGranted) {
            advancedConfig = advancedConfig.copy(autoDetectionEnabled = true)
            SafeDriveAdvancedStore.save(context, advancedConfig)
            SafeDriveAutoDetection.register(context) { _, message -> status = message }
        } else {
            advancedConfig = advancedConfig.copy(autoDetectionEnabled = false)
            SafeDriveAdvancedStore.save(context, advancedConfig)
            status = "لم يتم تفعيل الاكتشاف التلقائي. يحتاج إذن التعرّف على النشاط والإشعارات حتى يسألك التطبيق إن كنت السائق."
        }
    }

    fun startTrip() {
        SafeDriveAutoDetection.clearPassengerMode(context)
        if (!saveConfig() || !saveAdvanced()) return
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

    fun enableAutoDetection() {
        val required = buildList {
            if (Build.VERSION.SDK_INT >= 29 && ContextCompat.checkSelfPermission(context, Manifest.permission.ACTIVITY_RECOGNITION) != PackageManager.PERMISSION_GRANTED) {
                add(Manifest.permission.ACTIVITY_RECOGNITION)
            }
            if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }.distinct()
        if (required.isEmpty()) {
            advancedConfig = advancedConfig.copy(autoDetectionEnabled = true)
            SafeDriveAdvancedStore.save(context, advancedConfig)
            SafeDriveAutoDetection.register(context) { _, message -> status = message }
        } else {
            autoDetectionPermissionLauncher.launch(required.toTypedArray())
        }
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

        if (autoDetected && !live.active) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("يبدو أنك داخل مركبة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("الاكتشاف التلقائي لا يعني أنك السائق. اختر دورك قبل بدء أي قياس للقيادة.")
                    }
                }
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
                        Text("هل أنت السائق؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("لا يبدأ روافد جلسة القيادة إلا بعد اختيارك أنك السائق. إذا كنت راكبًا فلن تُسجل هذه الرحلة.")
                        Button(onClick = ::startTrip, modifier = Modifier.fillMaxWidth()) { Text("أنا السائق — ابدأ القيادة الآمنة") }
                        OutlinedButton(
                            onClick = {
                                SafeDriveAutoDetection.markPassenger(context)
                                status = "تم اختيار «أنا راكب». لن تبدأ جلسة قيادة، وسيتم كتم اقتراح الاكتشاف لهذه الرحلة مؤقتًا."
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) { Text("أنا راكب — لا تسجل الرحلة") }
                        Text("إذا بدأت القيادة، يظهر إشعار مستمر ويمكنك إنهاء الجلسة في أي وقت.", style = MaterialTheme.typography.bodySmall)
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
                        Text(DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(record.detectedAtMs)), fontWeight = FontWeight.Bold)
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
            OutlinedButton(onClick = { advancedExpanded = !advancedExpanded }, modifier = Modifier.fillMaxWidth()) {
                Text(if (advancedExpanded) "إخفاء مساعد القيادة" else "مساعد القيادة المتقدم")
            }
        }
        if (advancedExpanded) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("مساعد القيادة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        PermissionSwitch(
                            title = "اكتشاف وجود الهاتف داخل مركبة",
                            subtitle = "اختياري. عند اكتشاف المركبة يسألك روافد إن كنت السائق؛ لا يبدأ GPS أو تسجيل الرحلة تلقائيًا.",
                            checked = advancedConfig.autoDetectionEnabled,
                            enabled = !live.active,
                            onChange = { enabled ->
                                if (enabled) enableAutoDetection() else {
                                    advancedConfig = advancedConfig.copy(autoDetectionEnabled = false)
                                    SafeDriveAdvancedStore.save(context, advancedConfig)
                                    SafeDriveAutoDetection.unregister(context) { _, message -> status = message }
                                }
                            }
                        )
                        PermissionSwitch(
                            title = "تنبيهات صوتية قصيرة",
                            subtitle = "ينطق تنبيهات الأمان المهمة محليًا حتى لا تحتاج للنظر إلى الشاشة.",
                            checked = advancedConfig.spokenAlertsEnabled,
                            enabled = !live.active,
                            onChange = { advancedConfig = advancedConfig.copy(spokenAlertsEnabled = it); SafeDriveAdvancedStore.save(context, advancedConfig) }
                        )
                        PermissionSwitch(
                            title = "تقليل التشتيت",
                            subtitle = "أثناء الرحلة يخفي إشعارات المؤشرات البسيطة ويُبقي التنبيهات عالية الخطورة؛ تظل المؤشرات محسوبة في التقرير.",
                            checked = advancedConfig.reduceDistractionEnabled,
                            enabled = !live.active,
                            onChange = { advancedConfig = advancedConfig.copy(reduceDistractionEnabled = it); SafeDriveAdvancedStore.save(context, advancedConfig) }
                        )
                        PermissionSwitch(
                            title = "وضع السائق الجديد",
                            subtitle = "إرشاد صوتي أكثر تحفظًا وتذكير استراحة أبكر دون وصف السائق أو إصدار حكم قانوني.",
                            checked = advancedConfig.newDriverMode,
                            enabled = !live.active,
                            onChange = { advancedConfig = advancedConfig.copy(newDriverMode = it); SafeDriveAdvancedStore.save(context, advancedConfig) }
                        )
                        PermissionSwitch(
                            title = "حارس القيادة الليلية",
                            subtitle = "من 10 مساءً إلى 5 صباحًا يجعل تذكير الاستراحة أبكر ويعطي تنبيهًا صوتيًا عند بدء الرحلة إذا كان الصوت مفعّلًا.",
                            checked = advancedConfig.nightGuardEnabled,
                            enabled = !live.active,
                            onChange = { advancedConfig = advancedConfig.copy(nightGuardEnabled = it); SafeDriveAdvancedStore.save(context, advancedConfig) }
                        )
                        OutlinedTextField(
                            value = restMinutesText,
                            onValueChange = { restMinutesText = it.filter(Char::isDigit).take(3) },
                            label = { Text("تذكير الاستراحة — دقيقة (60–240)") },
                            enabled = !live.active,
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        PermissionSwitch(
                            title = "تذكير «وصلت بالسلامة» بعد إنهاء الرحلة",
                            subtitle = "إذا كان لديك فحص وصول نشط، يطلب منك تأكيد الوصول. لا يعتبر انتهاء القيادة دليلًا تلقائيًا على أنك وصلت.",
                            checked = advancedConfig.arrivalPromptOnTripEnd,
                            enabled = !live.active,
                            onChange = { advancedConfig = advancedConfig.copy(arrivalPromptOnTripEnd = it); SafeDriveAdvancedStore.save(context, advancedConfig) }
                        )
                        Button(enabled = !live.active, onClick = { saveAdvanced() }) { Text("حفظ مساعد القيادة") }
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
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                    Text("ملخص آخر 7 أيام", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    MetricLine("الرحلات", weekly.trips.toString())
                    MetricLine("المسافة", oneDecimal(weekly.distanceKm) + " كم")
                    MetricLine("المدة", SafeDriveScoring.formatDuration(weekly.durationMs))
                    weekly.averageScore?.let { MetricLine("متوسط التقييم", "$it/100") }
                    weekly.harshEventsPer100Km?.let { MetricLine("مؤشرات حادة / 100 كم", oneDecimal(it)) }
                    Text(weekly.trend, style = MaterialTheme.typography.bodySmall)
                    if (weekly.trips > 0) {
                        OutlinedButton(onClick = {
                            context.startActivity(
                                Intent.createChooser(
                                    Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_TEXT, weekly.shareText())
                                    },
                                    "مشاركة ملخص القيادة"
                                )
                            )
                        }) { Text("مشاركة الملخص باختياري") }
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
                        Text(DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(report.startedAtMs)), fontWeight = FontWeight.Bold)
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
