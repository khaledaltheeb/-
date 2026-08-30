package org.healthrenewal.rawafid

import android.Manifest
import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.telephony.SmsManager
import androidx.activity.ComponentActivity
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
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import java.text.DateFormat
import java.util.Calendar
import java.util.Date

private const val SAFETY_CHANNEL = "rawafid_safety_monitor"
private const val ACTION_PRE_ALERT = "org.healthrenewal.rawafid.SAFETY_PRE_ALERT"
private const val ACTION_SEND = "org.healthrenewal.rawafid.SAFETY_SEND"
private const val ACTION_SKIP = "org.healthrenewal.rawafid.SAFETY_SKIP"
private const val ACTION_SEND_NOW = "org.healthrenewal.rawafid.SAFETY_SEND_NOW"

data class SafetyMonitorConfig(
    val enabled: Boolean = false,
    val label: String = "مراقبة أمان",
    val startHour: Int = 20,
    val endHour: Int = 6,
    val intervalHours: Int = 2,
    val warningMinutes: Int = 10,
    val nextDueAt: Long = 0L
)

object SafetyMonitorStore {
    private const val PREFS = "rawafid_safety_monitor_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun load(context: Context) = SafetyMonitorConfig(
        enabled = prefs(context).getBoolean("enabled", false),
        label = prefs(context).getString("label", "مراقبة أمان") ?: "مراقبة أمان",
        startHour = prefs(context).getInt("start_hour", 20),
        endHour = prefs(context).getInt("end_hour", 6),
        intervalHours = prefs(context).getInt("interval_hours", 2),
        warningMinutes = prefs(context).getInt("warning_minutes", 10),
        nextDueAt = prefs(context).getLong("next_due", 0L)
    )

    fun save(context: Context, value: SafetyMonitorConfig) {
        prefs(context).edit()
            .putBoolean("enabled", value.enabled)
            .putString("label", value.label)
            .putInt("start_hour", value.startHour)
            .putInt("end_hour", value.endHour)
            .putInt("interval_hours", value.intervalHours)
            .putInt("warning_minutes", value.warningMinutes)
            .putLong("next_due", value.nextDueAt)
            .apply()
    }

    fun disable(context: Context) = save(context, load(context).copy(enabled = false, nextDueAt = 0L))
}

object SafetyMonitorScheduler {
    private const val PRE_REQUEST = 8701
    private const val SEND_REQUEST = 8702

    fun start(context: Context, config: SafetyMonitorConfig) {
        ensureChannel(context)
        val next = nextWindowTime(config, System.currentTimeMillis())
        val active = config.copy(enabled = true, nextDueAt = next)
        SafetyMonitorStore.save(context, active)
        scheduleCurrent(context, active)
        postPersistentStatus(context, active)
    }

    fun stop(context: Context) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarm.cancel(pending(context, ACTION_PRE_ALERT, PRE_REQUEST))
        alarm.cancel(pending(context, ACTION_SEND, SEND_REQUEST))
        SafetyMonitorStore.disable(context)
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(8700)
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(8703)
    }

    fun advance(context: Context) {
        val current = SafetyMonitorStore.load(context)
        if (!current.enabled) return
        val next = nextWindowTime(current, maxOf(System.currentTimeMillis() + current.intervalHours * 3_600_000L, current.nextDueAt + current.intervalHours * 3_600_000L))
        val updated = current.copy(nextDueAt = next)
        SafetyMonitorStore.save(context, updated)
        scheduleCurrent(context, updated)
        postPersistentStatus(context, updated)
    }

    fun resync(context: Context) {
        val current = SafetyMonitorStore.load(context)
        if (!current.enabled) return
        val next = if (current.nextDueAt > System.currentTimeMillis()) current.nextDueAt else nextWindowTime(current, System.currentTimeMillis())
        val updated = current.copy(nextDueAt = next)
        SafetyMonitorStore.save(context, updated)
        scheduleCurrent(context, updated)
        postPersistentStatus(context, updated)
    }

    private fun scheduleCurrent(context: Context, config: SafetyMonitorConfig) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val preAt = (config.nextDueAt - config.warningMinutes * 60_000L).coerceAtLeast(System.currentTimeMillis() + 1_000L)
        alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, preAt, pending(context, ACTION_PRE_ALERT, PRE_REQUEST))
        alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, config.nextDueAt, pending(context, ACTION_SEND, SEND_REQUEST))
    }

    private fun pending(context: Context, action: String, request: Int) = PendingIntent.getBroadcast(
        context,
        request,
        Intent(context, SafetyMonitorReceiver::class.java).setAction(action),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    private fun nextWindowTime(config: SafetyMonitorConfig, from: Long): Long {
        val cal = Calendar.getInstance().apply { timeInMillis = from }
        val hour = cal.get(Calendar.HOUR_OF_DAY)
        val inside = if (config.startHour < config.endHour) hour in config.startHour until config.endHour else hour >= config.startHour || hour < config.endHour
        if (inside) return from.coerceAtLeast(System.currentTimeMillis() + 5_000L)

        val next = Calendar.getInstance().apply {
            timeInMillis = from
            set(Calendar.HOUR_OF_DAY, config.startHour)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= from) add(Calendar.DAY_OF_YEAR, 1)
        }
        return next.timeInMillis
    }

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(
            NotificationChannel(SAFETY_CHANNEL, "مراقبة الأمان", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "إشعارات واضحة أثناء مراقبة الأمان وقبل إرسال الموقع"
            }
        )
    }

    private fun postPersistentStatus(context: Context, config: SafetyMonitorConfig) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        ensureChannel(context)
        val open = PendingIntent.getActivity(context, 8704, Intent(context, SafetyMonitorActivity::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val text = "نشطة · الإرسال التالي ${DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT).format(Date(config.nextDueAt))}"
        val notification = NotificationCompat.Builder(context, SAFETY_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(config.label)
            .setContentText(text)
            .setOngoing(true)
            .setContentIntent(open)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(8700, notification)
    }
}

class SafetyMonitorReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val config = SafetyMonitorStore.load(context)
        if (!config.enabled) return
        when (intent.action) {
            ACTION_PRE_ALERT -> showPreAlert(context, config)
            ACTION_SEND -> startSend(context)
            ACTION_SKIP -> {
                (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(8703)
                SafetyMonitorScheduler.advance(context)
            }
            ACTION_SEND_NOW -> {
                (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(8703)
                startSend(context)
            }
        }
    }

    private fun startSend(context: Context) {
        ContextCompat.startForegroundService(context, Intent(context, SafetyLocationService::class.java))
    }

    private fun showPreAlert(context: Context, config: SafetyMonitorConfig) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        SafetyMonitorScheduler.ensureChannel(context)
        val skip = PendingIntent.getBroadcast(context, 8710, Intent(context, SafetyMonitorReceiver::class.java).setAction(ACTION_SKIP), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val send = PendingIntent.getBroadcast(context, 8711, Intent(context, SafetyMonitorReceiver::class.java).setAction(ACTION_SEND_NOW), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notification = NotificationCompat.Builder(context, SAFETY_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("سيتم إرسال موقعك قريبًا")
            .setContentText("إذا كنت بخير، اضغط «أنا بخير — لا ترسل». إذا لم تتدخل سيُرسل موقع هذا الهاتف تلقائيًا.")
            .setStyle(NotificationCompat.BigTextStyle().bigText("مراقبة الأمان ستُرسل موقع هذا الهاتف تلقائيًا إلى الجهات التي سمحت لها باستلام الموقع بعد ${config.warningMinutes} دقائق تقريبًا. ألغِ هذه المرة إذا لم تعد بحاجة للإرسال."))
            .addAction(0, "أنا بخير — لا ترسل", skip)
            .addAction(0, "أرسل الآن", send)
            .setAutoCancel(false)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(8703, notification)
    }
}

class SafetyLocationService : Service(), LocationListener {
    private lateinit var locationManager: LocationManager
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate() {
        super.onCreate()
        SafetyMonitorScheduler.ensureChannel(this)
        val notification = NotificationCompat.Builder(this, SAFETY_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("جارٍ تحديد الموقع")
            .setContentText("يحدد روافد موقع هذا الهاتف لإرسال تنبيه الأمان الذي فعّلته.")
            .setOngoing(true)
            .build()
        startForeground(8705, notification)
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!hasLocationPermission()) {
            finishWithoutLocation("تعذر تحديد الموقع لأن إذن الموقع غير متاح.")
            return START_NOT_STICKY
        }
        val provider = when {
            locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) -> LocationManager.GPS_PROVIDER
            locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) -> LocationManager.NETWORK_PROVIDER
            else -> null
        }
        if (provider == null) {
            finishWithoutLocation("خدمات الموقع غير مفعلة على الهاتف.")
            return START_NOT_STICKY
        }
        @Suppress("MissingPermission")
        locationManager.requestLocationUpdates(provider, 0L, 0f, this, Looper.getMainLooper())
        handler.postDelayed({ finishWithoutLocation("لم يتمكن الهاتف من الحصول على موقع حديث في الوقت المحدد.") }, 30_000L)
        return START_NOT_STICKY
    }

    override fun onLocationChanged(location: Location) {
        handler.removeCallbacksAndMessages(null)
        runCatching { locationManager.removeUpdates(this) }
        sendLocation(location)
        SafetyMonitorScheduler.advance(this)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun sendLocation(location: Location) {
        val recipients = MyCircleStore.forPermission(this, CirclePermission.LOCATION_SAFETY).filter { it.phone.isNotBlank() }
        if (recipients.isEmpty()) {
            notifyResult("لم يتم الإرسال", "لا توجد جهة موثوقة مفعّل لها «استلام موقع مراقبة الأمان».")
            return
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            notifyResult("لم يتم الإرسال", "إذن إرسال SMS غير متاح. افتح مراقبة الأمان لمراجعة الأذونات.")
            return
        }
        val config = SafetyMonitorStore.load(this)
        val mapUrl = "https://maps.google.com/?q=${location.latitude},${location.longitude}"
        val time = DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date())
        val message = "روافد · ${config.label}\nهذا تنبيه أمان تلقائي فعّله صاحب هذا الهاتف.\nموقعي الحالي: $mapUrl\nوقت الإرسال: $time"
        val sms = SmsManager.getDefault()
        var sent = 0
        recipients.forEach { person ->
            runCatching {
                val parts = sms.divideMessage(message)
                sms.sendMultipartTextMessage(person.phone, null, parts, null, null)
                sent++
            }
        }
        notifyResult("تم إرسال موقع الأمان", "تم الإرسال إلى $sent من ${recipients.size} جهة محددة.")
    }

    private fun finishWithoutLocation(reason: String) {
        handler.removeCallbacksAndMessages(null)
        runCatching { locationManager.removeUpdates(this) }
        notifyResult("تعذر إرسال موقع الأمان", reason)
        SafetyMonitorScheduler.advance(this)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun notifyResult(title: String, text: String) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        val open = PendingIntent.getActivity(this, 8715, Intent(this, SafetyMonitorActivity::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notification = NotificationCompat.Builder(this, SAFETY_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(8716, notification)
    }

    private fun hasLocationPermission() = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    override fun onBind(intent: Intent?): IBinder? = null
}

class SafetyMonitorActivity : ComponentActivity() {
    private var onPermissionsReady: ((Boolean) -> Unit)? = null

    private val basePermissions = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { grants ->
        val locationGranted = grants[Manifest.permission.ACCESS_FINE_LOCATION] == true || grants[Manifest.permission.ACCESS_COARSE_LOCATION] == true || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val smsGranted = grants[Manifest.permission.SEND_SMS] == true || ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED
        if (locationGranted && smsGranted && Build.VERSION.SDK_INT >= 29 && ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            backgroundPermission.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
        } else {
            onPermissionsReady?.invoke(locationGranted && smsGranted)
            onPermissionsReady = null
        }
    }

    private val backgroundPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        onPermissionsReady?.invoke(granted)
        onPermissionsReady = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        SafetyMonitorScheduler.ensureChannel(this)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { SafetyMonitorScreen(::ensurePermissions) }
                }
            }
        }
    }

    private fun ensurePermissions(result: (Boolean) -> Unit) {
        onPermissionsReady = result
        val permissions = buildList {
            add(Manifest.permission.ACCESS_FINE_LOCATION)
            add(Manifest.permission.ACCESS_COARSE_LOCATION)
            add(Manifest.permission.SEND_SMS)
            if (Build.VERSION.SDK_INT >= 33) add(Manifest.permission.POST_NOTIFICATIONS)
        }.toTypedArray()
        basePermissions.launch(permissions)
    }
}

@Composable
private fun SafetyMonitorScreen(requestPermissions: ((Boolean) -> Unit) -> Unit) {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    val config = remember(version) { SafetyMonitorStore.load(context) }
    val recipients = remember(version) { MyCircleStore.forPermission(context, CirclePermission.LOCATION_SAFETY).filter { it.phone.isNotBlank() } }
    var label by rememberSaveable(config.enabled) { mutableStateOf(config.label) }
    var startHour by rememberSaveable(config.enabled) { mutableIntStateOf(config.startHour) }
    var endHour by rememberSaveable(config.enabled) { mutableIntStateOf(config.endHour) }
    var interval by rememberSaveable(config.enabled) { mutableIntStateOf(config.intervalHours) }
    var warning by rememberSaveable(config.enabled) { mutableIntStateOf(config.warningMinutes) }
    var permissionMessage by remember { mutableStateOf("") }

    LazyColumn(
        contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("مراقبة الأمان والموقع", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("ميزة اختيارية لهذا الهاتف: تنبّهك قبل الموعد، وإذا لم تلغِ الإرسال تُرسل موقع الهاتف تلقائيًا إلى الأشخاص الذين سمحت لهم بذلك.")
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("خصوصية وموافقة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("عند تفعيل المراقبة سيظهر إشعار دائم، وستطلب روافد إذن الموقع في الخلفية وإرسال SMS. لا يمكن تشغيل هذه الميزة سرًا، ولا تُستخدم لتتبع هاتف شخص آخر دون موافقته.")
                }
            }
        }

        if (config.enabled) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text("المراقبة نشطة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = RawafidSemanticColors.Success)
                        Text("الإرسال التالي: ${DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(config.nextDueAt))}")
                        Text("الجهات المستلمة: ${recipients.size}")
                        Button(modifier = Modifier.fillMaxWidth(), onClick = { SafetyMonitorScheduler.stop(context); version++ }) { Text("إيقاف المراقبة") }
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("من سيستلم موقعي؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    if (recipients.isEmpty()) {
                        Text("لا توجد جهة مفعّل لها استلام موقع الأمان.", color = MaterialTheme.colorScheme.error)
                        OutlinedButton(modifier = Modifier.fillMaxWidth(), onClick = { context.startActivity(Intent(context, MyCircleActivity::class.java)) }) { Text("اختيار شخص من دائرتي") }
                    } else {
                        recipients.forEach { Text("• ${it.name}${if (it.relation.isNotBlank()) " — ${it.relation}" else ""}") }
                        OutlinedButton(onClick = { context.startActivity(Intent(context, MyCircleActivity::class.java)) }) { Text("تعديل الجهات") }
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("جدول المراقبة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(label, { label = it.take(80) }, label = { Text("اسم واضح — مثال: خروج الوالد مساءً") }, modifier = Modifier.fillMaxWidth())
                    Text("ابدأ الإرسال من الساعة")
                    HourChips(startHour) { startHour = it }
                    Text("أوقف نافذة الإرسال عند الساعة")
                    HourChips(endHour) { endHour = it }
                    Text("أرسل كل")
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        listOf(1, 2, 3, 4).forEach { hours -> FilterChip(selected = interval == hours, onClick = { interval = hours }, label = { Text(if (hours == 1) "ساعة" else "$hours ساعات") }) }
                    }
                    Text("نبّهني قبل الإرسال")
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        listOf(5, 10, 15).forEach { minutes -> FilterChip(selected = warning == minutes, onClick = { warning = minutes }, label = { Text("$minutes دقائق") }) }
                    }
                }
            }
        }

        item {
            Button(
                modifier = Modifier.fillMaxWidth(),
                enabled = !config.enabled && recipients.isNotEmpty(),
                onClick = {
                    permissionMessage = ""
                    requestPermissions { granted ->
                        if (granted) {
                            SafetyMonitorScheduler.start(
                                context,
                                SafetyMonitorConfig(
                                    enabled = true,
                                    label = label.trim().ifBlank { "مراقبة أمان" },
                                    startHour = startHour,
                                    endHour = endHour,
                                    intervalHours = interval,
                                    warningMinutes = warning
                                )
                            )
                            version++
                        } else {
                            permissionMessage = "لم تبدأ المراقبة لأن أذونات الموقع/الخلفية/SMS المطلوبة لم تُمنح بالكامل."
                        }
                    }
                }
            ) { Text("مراجعة الأذونات وبدء المراقبة") }
        }
        if (permissionMessage.isNotBlank()) item { Text(permissionMessage, color = MaterialTheme.colorScheme.error) }

        item {
            Text("تنبيه: هذه ميزة مساعدة وليست بديلًا عن خدمات الطوارئ أو أجهزة التتبع الطبية المعتمدة. قد تؤثر قيود البطارية أو الشبكة أو إيقاف الموقع على التسليم.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun HourChips(selected: Int, onSelect: (Int) -> Unit) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
        listOf(0, 6, 8, 12, 18, 20, 22).forEach { hour ->
            FilterChip(selected = selected == hour, onClick = { onSelect(hour) }, label = { Text(String.format("%02d:00", hour)) })
        }
    }
}
