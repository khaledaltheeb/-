package org.healthrenewal.rawafid

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.provider.Settings
import android.view.KeyEvent
import android.view.accessibility.AccessibilityEvent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.core.app.NotificationCompat
import java.text.DateFormat
import java.util.Date

private const val BEACON_CHANNEL = "rawafid_emergency_beacon"
private const val BEACON_NOTIFICATION_ID = 8810
private const val BEACON_PREVIEW_NOTIFICATION_ID = 8811
private const val ACTION_BEACON_EXPIRE = "org.healthrenewal.rawafid.EMERGENCY_BEACON_EXPIRE"
private const val BEACON_CONTACT_ID = 8_810_001L

data class EmergencyBeaconProfile(
    val condition: String = "",
    val assistance: String = "",
    val ownPhone: String = "",
    val emergencyContactName: String = "",
    val emergencyContactPhone: String = "",
    val allowLocationSafety: Boolean = false,
    val hardwareShortcutEnabled: Boolean = false,
    val hardwareDurationHours: Int = 4,
    val active: Boolean = false,
    val expiresAt: Long = 0L,
    val updatedAt: Long = 0L
)

object EmergencyBeaconStore {
    private const val PREFS = "rawafid_emergency_beacon_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun load(context: Context): EmergencyBeaconProfile {
        val p = prefs(context)
        return EmergencyBeaconProfile(
            condition = p.getString("condition", "") ?: "",
            assistance = p.getString("assistance", "") ?: "",
            ownPhone = p.getString("own_phone", "") ?: "",
            emergencyContactName = p.getString("emergency_name", "") ?: "",
            emergencyContactPhone = p.getString("emergency_phone", "") ?: "",
            allowLocationSafety = p.getBoolean("allow_location_safety", false),
            hardwareShortcutEnabled = p.getBoolean("hardware_shortcut", false),
            hardwareDurationHours = p.getInt("hardware_duration_hours", 4).coerceIn(1, 24),
            active = p.getBoolean("active", false),
            expiresAt = p.getLong("expires_at", 0L),
            updatedAt = p.getLong("updated_at", 0L)
        )
    }

    fun save(context: Context, value: EmergencyBeaconProfile) {
        val normalized = value.copy(
            condition = value.condition.trim().take(120),
            assistance = value.assistance.trim().take(400),
            ownPhone = value.ownPhone.trim().take(40),
            emergencyContactName = value.emergencyContactName.trim().take(80),
            emergencyContactPhone = value.emergencyContactPhone.trim().take(40),
            hardwareDurationHours = value.hardwareDurationHours.coerceIn(1, 24),
            updatedAt = System.currentTimeMillis()
        )
        prefs(context).edit()
            .putString("condition", normalized.condition)
            .putString("assistance", normalized.assistance)
            .putString("own_phone", normalized.ownPhone)
            .putString("emergency_name", normalized.emergencyContactName)
            .putString("emergency_phone", normalized.emergencyContactPhone)
            .putBoolean("allow_location_safety", normalized.allowLocationSafety)
            .putBoolean("hardware_shortcut", normalized.hardwareShortcutEnabled)
            .putInt("hardware_duration_hours", normalized.hardwareDurationHours)
            .putBoolean("active", normalized.active)
            .putLong("expires_at", normalized.expiresAt)
            .putLong("updated_at", normalized.updatedAt)
            .apply()
        syncEmergencyContact(context, normalized)
    }

    fun setActive(context: Context, active: Boolean, expiresAt: Long) {
        val current = load(context)
        save(context, current.copy(active = active, expiresAt = if (active) expiresAt else 0L))
    }

    private fun syncEmergencyContact(context: Context, profile: EmergencyBeaconProfile) {
        if (profile.emergencyContactPhone.isBlank()) return
        val people = MyCircleStore.people(context).toMutableList()
        val normalizedPhone = profile.emergencyContactPhone.filter { it.isDigit() || it == '+' }
        val index = people.indexOfFirst { person ->
            person.id == BEACON_CONTACT_ID || person.phone.filter { it.isDigit() || it == '+' } == normalizedPhone
        }
        val existing = people.getOrNull(index)
        var permissions = (existing?.permissions ?: emptySet()) + CirclePermission.EMERGENCY
        permissions = if (profile.allowLocationSafety) permissions + CirclePermission.LOCATION_SAFETY else permissions - CirclePermission.LOCATION_SAFETY
        val updated = CirclePerson(
            id = existing?.id ?: BEACON_CONTACT_ID,
            name = profile.emergencyContactName.ifBlank { existing?.name ?: "جهة الطوارئ" },
            relation = existing?.relation ?: "جهة طوارئ",
            phone = profile.emergencyContactPhone,
            permissions = permissions
        )
        if (index >= 0) people[index] = updated else people += updated
        MyCircleStore.save(context, people)
    }
}

object EmergencyBeaconManager {
    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(
            NotificationChannel(BEACON_CHANNEL, "بطاقة المساعدة على شاشة القفل", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "بطاقة يفعّلها صاحب الهاتف لإظهار احتياج المساعدة ووسيلة التواصل على شاشة القفل"
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
        )
    }

    fun buildPublicText(profile: EmergencyBeaconProfile): String = buildString {
        append(if (profile.condition.isBlank()) "أحتاج مساعدة" else "أنا مصاب بـ ${profile.condition}")
        if (profile.assistance.isNotBlank()) append("\n${profile.assistance}")
        if (profile.ownPhone.isNotBlank()) append("\nرقم هاتفي: ${profile.ownPhone}")
        if (profile.emergencyContactPhone.isNotBlank()) {
            val name = profile.emergencyContactName.ifBlank { "جهة الطوارئ" }
            append("\n$name: ${profile.emergencyContactPhone}")
        }
    }

    fun activate(context: Context, profile: EmergencyBeaconProfile, durationHours: Int?) {
        if (!NotificationPermissionSupport.isGranted(context)) return
        ensureChannel(context)
        val expiresAt = if (durationHours == null) 0L else System.currentTimeMillis() + durationHours.coerceIn(1, 24) * 3_600_000L
        val activeProfile = profile.copy(active = true, expiresAt = expiresAt)
        EmergencyBeaconStore.save(context, activeProfile)
        postActiveNotification(context, activeProfile)
        scheduleExpiry(context, expiresAt)
    }

    fun activateFromHardwareShortcut(context: Context) {
        val profile = EmergencyBeaconStore.load(context)
        if (!profile.hardwareShortcutEnabled || !NotificationPermissionSupport.isGranted(context)) return
        activate(context, profile, profile.hardwareDurationHours)
    }

    fun deactivate(context: Context) {
        cancelExpiry(context)
        EmergencyBeaconStore.setActive(context, false, 0L)
        context.getSystemService(NotificationManager::class.java).cancel(BEACON_NOTIFICATION_ID)
    }

    fun restore(context: Context) {
        val profile = EmergencyBeaconStore.load(context)
        if (!profile.active) return
        if (profile.expiresAt > 0L && profile.expiresAt <= System.currentTimeMillis()) {
            deactivate(context)
            return
        }
        if (!NotificationPermissionSupport.isGranted(context)) return
        ensureChannel(context)
        postActiveNotification(context, profile)
        scheduleExpiry(context, profile.expiresAt)
    }

    fun preview(context: Context, profile: EmergencyBeaconProfile) {
        if (!NotificationPermissionSupport.isGranted(context)) return
        ensureChannel(context)
        val open = PendingIntent.getActivity(
            context,
            8812,
            Intent(context, EmergencyBeaconActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(context, BEACON_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(if (profile.condition.isBlank()) "معاينة بطاقة المساعدة" else "أنا مصاب بـ ${profile.condition}")
            .setContentText(profile.assistance.ifBlank { "هذه معاينة فقط ولن تبقى مفعلة." })
            .setStyle(NotificationCompat.BigTextStyle().bigText(buildPublicText(profile)))
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        context.getSystemService(NotificationManager::class.java).notify(BEACON_PREVIEW_NOTIFICATION_ID, notification)
    }

    private fun postActiveNotification(context: Context, profile: EmergencyBeaconProfile) {
        val open = PendingIntent.getActivity(
            context,
            8813,
            Intent(context, EmergencyBeaconActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val builder = NotificationCompat.Builder(context, BEACON_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(if (profile.condition.isBlank()) "أحتاج مساعدة" else "أنا مصاب بـ ${profile.condition}")
            .setContentText(profile.assistance.ifBlank { "افتح البطاقة لمعرفة كيفية المساعدة." })
            .setStyle(NotificationCompat.BigTextStyle().bigText(buildPublicText(profile)))
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(open)

        if (profile.expiresAt > 0L) {
            val timeout = (profile.expiresAt - System.currentTimeMillis()).coerceAtLeast(1_000L)
            builder.setTimeoutAfter(timeout)
        }
        if (profile.emergencyContactPhone.isNotBlank()) {
            val dial = PendingIntent.getActivity(
                context,
                8814,
                Intent(Intent.ACTION_DIAL, Uri.parse("tel:${Uri.encode(profile.emergencyContactPhone)}")),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            builder.addAction(0, "اتصال بجهة الطوارئ", dial)
        }
        context.getSystemService(NotificationManager::class.java).notify(BEACON_NOTIFICATION_ID, builder.build())
    }

    private fun scheduleExpiry(context: Context, expiresAt: Long) {
        cancelExpiry(context)
        if (expiresAt <= 0L) return
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, expiresAt, expiryIntent(context))
    }

    private fun cancelExpiry(context: Context) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarm.cancel(expiryIntent(context))
    }

    private fun expiryIntent(context: Context) = PendingIntent.getBroadcast(
        context,
        8815,
        Intent(context, EmergencyBeaconReceiver::class.java).setAction(ACTION_BEACON_EXPIRE),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
}

class EmergencyBeaconReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_BEACON_EXPIRE) EmergencyBeaconManager.deactivate(context)
    }
}

class SafetyHotkeyAccessibilityService : AccessibilityService() {
    private val sequence = intArrayOf(KeyEvent.KEYCODE_VOLUME_UP, KeyEvent.KEYCODE_VOLUME_DOWN, KeyEvent.KEYCODE_VOLUME_UP)
    private var index = 0
    private var startedAt = 0L

    override fun onServiceConnected() {
        super.onServiceConnected()
        serviceInfo = serviceInfo.apply {
            flags = flags or AccessibilityServiceInfo.FLAG_REQUEST_FILTER_KEY_EVENTS
        }
    }

    override fun onKeyEvent(event: KeyEvent): Boolean {
        if (event.action != KeyEvent.ACTION_DOWN || event.repeatCount > 0) return false
        if (!EmergencyBeaconStore.load(this).hardwareShortcutEnabled) return false
        if (event.keyCode != KeyEvent.KEYCODE_VOLUME_UP && event.keyCode != KeyEvent.KEYCODE_VOLUME_DOWN) return false

        val now = SystemClock.elapsedRealtime()
        if (index == 0 || now - startedAt > 5_000L) {
            index = 0
            startedAt = now
        }

        if (event.keyCode == sequence[index]) {
            index++
            if (index == sequence.size) {
                index = 0
                startedAt = 0L
                EmergencyBeaconManager.activateFromHardwareShortcut(this)
            }
        } else {
            index = if (event.keyCode == sequence[0]) 1 else 0
            startedAt = if (index == 1) now else 0L
        }
        return false
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) = Unit
    override fun onInterrupt() = Unit
}

class EmergencyBeaconActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        EmergencyBeaconManager.ensureChannel(this)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { EmergencyBeaconScreen() }
                }
            }
        }
    }
}

@Composable
private fun EmergencyBeaconScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    val stored = remember(version) { EmergencyBeaconStore.load(context) }
    var draft by remember(version) { mutableStateOf(stored) }
    var durationHours by remember(version) { mutableIntStateOf(stored.hardwareDurationHours) }
    var indefinite by remember(version) { mutableStateOf(false) }
    var showSaveConfirm by remember { mutableStateOf(false) }
    var showActivateConfirm by remember { mutableStateOf(false) }
    var permissionMessage by remember { mutableStateOf("") }
    val dirty = draft.copy(active = stored.active, expiresAt = stored.expiresAt, updatedAt = stored.updatedAt) != stored
    val publicPreview = EmergencyBeaconManager.buildPublicText(draft)

    val requestNotifications = rememberNotificationPermissionRequester { granted ->
        permissionMessage = if (granted) "تم السماح بالإشعارات. يمكنك الآن تفعيل بطاقة شاشة القفل." else "لن تظهر بطاقة المساعدة على شاشة القفل دون السماح بإشعارات روافد."
    }

    LazyColumn(
        contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("بطاقة المساعدة على شاشة القفل", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("لمن قد يتعرض لنوبة، ارتباك، ضياع، فقدان ذاكرة أو حالة تجعل فتح الهاتف صعبًا. أنت تختار النص والمدة وجهة الطوارئ.")
            }
        }

        if (stored.active) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text("البطاقة مفعلة الآن", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = RawafidSemanticColors.Success)
                        Text(if (stored.expiresAt > 0L) "تنتهي: ${formatBeaconTime(stored.expiresAt)}" else "المدة: مستمرة حتى إيقافها يدويًا")
                        Button(modifier = Modifier.fillMaxWidth(), onClick = { EmergencyBeaconManager.deactivate(context); version++ }) { Text("إيقاف بطاقة شاشة القفل") }
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("ماذا يجب أن يراه من يجد الهاتف؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(
                        value = draft.condition,
                        onValueChange = { draft = draft.copy(condition = it.take(120)) },
                        label = { Text("الحالة — مثال: الصرع، الزهايمر") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = draft.assistance,
                        onValueChange = { draft = draft.copy(assistance = it.take(400)) },
                        label = { Text("كيف تساعدني — مثال: أبقني في مكان آمن واتصل بجهة الطوارئ") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                    OutlinedTextField(
                        value = draft.ownPhone,
                        onValueChange = { draft = draft.copy(ownPhone = it.take(40)) },
                        label = { Text("رقم هاتفي الذي أريد إظهاره — اختياري") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("جهة الطوارئ", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("هذا هو المكان المباشر لإدخال الرقم الذي سيظهر لك لاحقًا في أزرار الاتصال، ويمكنك اختياره أيضًا لاستلام موقع مراقبة الأمان.")
                    OutlinedTextField(
                        value = draft.emergencyContactName,
                        onValueChange = { draft = draft.copy(emergencyContactName = it.take(80)) },
                        label = { Text("اسم الشخص") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = draft.emergencyContactPhone,
                        onValueChange = { draft = draft.copy(emergencyContactPhone = it.take(40)) },
                        label = { Text("رقم هاتف الطوارئ") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column(Modifier.weight(1f)) {
                            Text("استلام موقعي من مراقبة الأمان", fontWeight = FontWeight.Bold)
                            Text("فعّله فقط إذا كنت تريد أن يستلم هذا الشخص رسائل الموقع التلقائية أيضًا.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Checkbox(checked = draft.allowLocationSafety, onCheckedChange = { draft = draft.copy(allowLocationSafety = it) })
                    }
                    OutlinedButton(
                        modifier = Modifier.fillMaxWidth(),
                        enabled = draft.emergencyContactPhone.isNotBlank(),
                        onClick = {
                            context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${Uri.encode(draft.emergencyContactPhone)}")))
                        }
                    ) { Text("اتصال بجهة الطوارئ") }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("معاينة مباشرة قبل الحفظ", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(publicPreview)
                    Text("هذه هي المعلومات المقصود أن تكون عامة أثناء تفعيل البطاقة. قد تمنع إعدادات خصوصية شاشة القفل في بعض الهواتف ظهور التفاصيل رغم طلب روافد إظهارها.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    OutlinedButton(modifier = Modifier.fillMaxWidth(), onClick = { requestNotifications(); EmergencyBeaconManager.preview(context, draft) }) { Text("اختبار شكل الإشعار") }
                }
            }
        }

        item {
            Button(modifier = Modifier.fillMaxWidth(), enabled = dirty, onClick = { showSaveConfirm = true }) {
                Text(if (dirty) "مراجعة وحفظ الإعدادات" else "الإعدادات محفوظة")
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("التفعيل السريع بدون فتح التطبيق", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("اختصار اختياري: رفع الصوت ← خفض الصوت ← رفع الصوت خلال 5 ثوانٍ. التسلسل يقلل التشغيل بالخطأ ولا يقرأ محتوى الشاشة.")
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("السماح باختصار أزرار الصوت", Modifier.weight(1f))
                        Switch(checked = draft.hardwareShortcutEnabled, onCheckedChange = { draft = draft.copy(hardwareShortcutEnabled = it) })
                    }
                    Text("مدة البطاقة عند التفعيل بالأزرار")
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        listOf(1, 2, 4, 8, 12, 24).forEach { hours ->
                            FilterChip(
                                selected = draft.hardwareDurationHours == hours,
                                onClick = { draft = draft.copy(hardwareDurationHours = hours) },
                                label = { Text(if (hours == 1) "ساعة" else "$hours ساعات") }
                            )
                        }
                    }
                    OutlinedButton(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = { context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
                    ) { Text("فتح إعدادات الوصولية لتفعيل الاختصار") }
                    Text("تفعيل خدمة الاختصار اختياري. إذا لم ترغب في منح هذه الصلاحية، استخدم بطاقة شاشة القفل من التطبيق أو مركز الأمان.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("فعّل البطاقة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("اختر مدة مؤقتة أو اجعلها مستمرة حتى توقفها بنفسك.")
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        listOf(1, 2, 4, 8, 12, 24).forEach { hours ->
                            FilterChip(selected = !indefinite && durationHours == hours, onClick = { indefinite = false; durationHours = hours }, label = { Text(if (hours == 1) "ساعة" else "$hours ساعات") })
                        }
                        FilterChip(selected = indefinite, onClick = { indefinite = true }, label = { Text("مستمر") })
                    }
                    Button(modifier = Modifier.fillMaxWidth(), onClick = { requestNotifications(); showActivateConfirm = true }) { Text("مراجعة ثم تفعيل") }
                    OutlinedButton(modifier = Modifier.fillMaxWidth(), onClick = { context.startActivity(Intent(context, SafetyMonitorActivity::class.java)) }) { Text("مراقبة الموقع والإرسال المجدول") }
                }
            }
        }

        if (permissionMessage.isNotBlank()) item { Text(permissionMessage, color = MaterialTheme.colorScheme.primary) }

        item {
            Text(
                "بطاقة شاشة القفل ومراقبة الموقع أدوات مساعدة وليستا بديلًا عن خدمات الطوارئ أو جهاز تتبع طبي معتمد. ظهور المعلومات على شاشة القفل يعتمد أيضًا على إعدادات Android والشركة المصنّعة للهاتف.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }

    if (showSaveConfirm) {
        AlertDialog(
            onDismissRequest = { showSaveConfirm = false },
            title = { Text("تأكيد الحفظ") },
            text = { Text("راجع ما سيظهر عند التفعيل:\n\n$publicPreview") },
            confirmButton = {
                TextButton(onClick = {
                    EmergencyBeaconStore.save(context, draft.copy(active = stored.active, expiresAt = stored.expiresAt))
                    showSaveConfirm = false
                    version++
                }) { Text("حفظ") }
            },
            dismissButton = { TextButton(onClick = { showSaveConfirm = false }) { Text("رجوع") } }
        )
    }

    if (showActivateConfirm) {
        AlertDialog(
            onDismissRequest = { showActivateConfirm = false },
            title = { Text("تفعيل بطاقة شاشة القفل؟") },
            text = {
                val duration = if (indefinite) "حتى توقفها يدويًا" else "لمدة $durationHours ساعة/ساعات"
                Text("$publicPreview\n\nالمدة: $duration\n\nسيُحفظ هذا الإعداد محليًا ثم يظهر كإشعار أمان عام على شاشة القفل حيث يسمح Android بذلك.")
            },
            confirmButton = {
                TextButton(onClick = {
                    val value = draft.copy(active = false, expiresAt = 0L)
                    EmergencyBeaconStore.save(context, value)
                    EmergencyBeaconManager.activate(context, value, if (indefinite) null else durationHours)
                    showActivateConfirm = false
                    version++
                }) { Text("تفعيل") }
            },
            dismissButton = { TextButton(onClick = { showActivateConfirm = false }) { Text("إلغاء") } }
        )
    }
}

private fun formatBeaconTime(value: Long): String =
    if (value <= 0L) "—" else DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(value))
