package org.healthrenewal.rawafid

import android.Manifest
import android.app.AlarmManager
import android.app.Notification
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
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.Settings
import android.telephony.SmsManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
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
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.DateFormat
import java.util.Calendar
import java.util.Date

private const val SAFETY_STATUS_CHANNEL = "rawafid_safety_monitor"
private const val SAFETY_ALERT_CHANNEL = "rawafid_safety_alert"
private const val ACTION_PRE_ALERT = "org.healthrenewal.rawafid.SAFETY_PRE_ALERT"
private const val ACTION_SEND = "org.healthrenewal.rawafid.SAFETY_SEND"
private const val ACTION_SKIP = "org.healthrenewal.rawafid.SAFETY_SKIP"
private const val ACTION_SEND_NOW = "org.healthrenewal.rawafid.SAFETY_SEND_NOW"
private const val SERVICE_CAPTURE = "org.healthrenewal.rawafid.SAFETY_SERVICE_CAPTURE"
private const val SERVICE_STOP = "org.healthrenewal.rawafid.SAFETY_SERVICE_STOP"
private const val STATUS_NOTIFICATION_ID = 8705
private const val PRE_ALERT_NOTIFICATION_ID = 8703
private const val RESULT_NOTIFICATION_ID = 8716
private const val LAST_LOCATION_MAX_AGE_MS = 10 * 60_000L

data class SafetyMonitorConfig(
    val enabled: Boolean = false,
    val label: String = "مراقبة أمان",
    val startHour: Int = 20,
    val endHour: Int = 6,
    val intervalHours: Int = 2,
    val warningMinutes: Int = 10,
    val nextDueAt: Long = 0L,
    val lastAttemptAt: Long = 0L,
    val lastSuccessAt: Long = 0L,
    val lastResult: String = ""
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
        nextDueAt = prefs(context).getLong("next_due", 0L),
        lastAttemptAt = prefs(context).getLong("last_attempt", 0L),
        lastSuccessAt = prefs(context).getLong("last_success", 0L),
        lastResult = prefs(context).getString("last_result", "") ?: ""
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
            .putLong("last_attempt", value.lastAttemptAt)
            .putLong("last_success", value.lastSuccessAt)
            .putString("last_result", value.lastResult)
            .apply()
    }

    fun recordResult(context: Context, success: Boolean, result: String) {
        val now = System.currentTimeMillis()
        val current = load(context)
        save(
            context,
            current.copy(
                lastAttemptAt = now,
                lastSuccessAt = if (success) now else current.lastSuccessAt,
                lastResult = result
            )
        )
    }

    fun disable(context: Context) = save(context, load(context).copy(enabled = false, nextDueAt = 0L))
}

object SafetyMonitorScheduler {
    private const val PRE_REQUEST = 8701
    private const val SEND_REQUEST = 8702

    fun start(context: Context, config: SafetyMonitorConfig) {
        ensureChannels(context)
        val next = nextWindowTime(config, System.currentTimeMillis())
        val active = config.copy(enabled = true, nextDueAt = next)
        SafetyMonitorStore.save(context, active)
        scheduleCurrent(context, active)
        updateStatusNotification(context, active)
    }

    fun stop(context: Context) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarm.cancel(pending(context, ACTION_PRE_ALERT, PRE_REQUEST))
        alarm.cancel(pending(context, ACTION_SEND, SEND_REQUEST))
        SafetyMonitorStore.disable(context)
        context.stopService(Intent(context, SafetyLocationService::class.java))
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.cancel(STATUS_NOTIFICATION_ID)
        manager.cancel(PRE_ALERT_NOTIFICATION_ID)
    }

    fun advance(context: Context) {
        val current = SafetyMonitorStore.load(context)
        if (!current.enabled) return
        val candidate = maxOf(
            System.currentTimeMillis() + current.intervalHours.coerceIn(1, 24) * 3_600_000L,
            current.nextDueAt + current.intervalHours.coerceIn(1, 24) * 3_600_000L
        )
        val next = nextWindowTime(current, candidate)
        val updated = current.copy(nextDueAt = next)
        SafetyMonitorStore.save(context, updated)
        scheduleCurrent(context, updated)
        updateStatusNotification(context, updated)
    }

    fun resync(context: Context, ensureService: Boolean = false) {
        val current = SafetyMonitorStore.load(context)
        if (!current.enabled) return
        val next = if (current.nextDueAt > System.currentTimeMillis()) current.nextDueAt
        else nextWindowTime(current, System.currentTimeMillis())
        val updated = current.copy(nextDueAt = next)
        SafetyMonitorStore.save(context, updated)
        scheduleCurrent(context, updated)
        updateStatusNotification(context, updated)
        // Kept for source compatibility with older callers. The capture service is
        // intentionally short-lived and starts only when a location is actually due.
        if (ensureService) Unit
    }

    fun requestSendNow(context: Context) {
        if (!SafetyMonitorStore.load(context).enabled) return
        runCatching {
            ContextCompat.startForegroundService(
                context,
                Intent(context, SafetyLocationService::class.java).setAction(SERVICE_CAPTURE)
            )
        }.onFailure {
            val result = "تعذر بدء خدمة تحديد الموقع في الخلفية. افتح مراقبة الأمان وتحقق من أذونات الموقع طوال الوقت."
            SafetyMonitorStore.recordResult(context, false, result)
            postResult(context, "تعذر إرسال موقع الأمان", result)
            advance(context)
        }
    }

    fun ensureChannels(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannels(
            listOf(
                NotificationChannel(SAFETY_STATUS_CHANNEL, "حالة مراقبة الأمان", NotificationManager.IMPORTANCE_LOW).apply {
                    description = "حالة مراقبة الأمان وجدول الإرسال التلقائي"
                    lockscreenVisibility = Notification.VISIBILITY_PRIVATE
                },
                NotificationChannel(SAFETY_ALERT_CHANNEL, "تنبيهات مراقبة الأمان", NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "التنبيه قبل إرسال الموقع ونتيجة محاولة الإرسال"
                    lockscreenVisibility = Notification.VISIBILITY_PRIVATE
                }
            )
        )
    }

    fun statusNotification(context: Context, config: SafetyMonitorConfig = SafetyMonitorStore.load(context)): Notification {
        ensureChannels(context)
        val open = PendingIntent.getActivity(
            context,
            8704,
            Intent(context, SafetyMonitorActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val stop = PendingIntent.getBroadcast(
            context,
            8706,
            Intent(context, SafetyMonitorReceiver::class.java).setAction(SERVICE_STOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val text = if (config.nextDueAt > 0L) {
            "نشطة · الإرسال التالي ${DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT).format(Date(config.nextDueAt))}"
        } else "مراقبة الأمان نشطة على هذا الهاتف"
        return NotificationCompat.Builder(context, SAFETY_STATUS_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(config.label)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText("$text. سيصلك تنبيه قبل أي إرسال تلقائي."))
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(open)
            .addAction(0, "إيقاف المراقبة", stop)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .build()
    }

    fun postResult(context: Context, title: String, text: String) {
        if (!canNotify(context)) return
        ensureChannels(context)
        val open = PendingIntent.getActivity(
            context,
            8715,
            Intent(context, SafetyMonitorActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(context, SAFETY_ALERT_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setContentIntent(open)
            .setAutoCancel(true)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .build()
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(RESULT_NOTIFICATION_ID, notification)
    }

    private fun updateStatusNotification(context: Context, config: SafetyMonitorConfig) {
        if (!canNotify(context)) return
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .notify(STATUS_NOTIFICATION_ID, statusNotification(context, config))
    }

    private fun scheduleCurrent(context: Context, config: SafetyMonitorConfig) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val preAt = (config.nextDueAt - config.warningMinutes.coerceIn(1, 60) * 60_000L)
            .coerceAtLeast(System.currentTimeMillis() + 1_000L)
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
        val startHour = config.startHour.coerceIn(0, 23)
        val endHour = config.endHour.coerceIn(0, 23)
        val cal = Calendar.getInstance().apply { timeInMillis = from }
        val hour = cal.get(Calendar.HOUR_OF_DAY)
        val inside = when {
            startHour == endHour -> true
            startHour < endHour -> hour in startHour until endHour
            else -> hour >= startHour || hour < endHour
        }
        if (inside) return from.coerceAtLeast(System.currentTimeMillis() + 5_000L)

        return Calendar.getInstance().apply {
            timeInMillis = from
            set(Calendar.HOUR_OF_DAY, startHour)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= from) add(Calendar.DAY_OF_YEAR, 1)
        }.timeInMillis
    }

    private fun canNotify(context: Context) =
        Build.VERSION.SDK_INT < 33 ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
}

class SafetyMonitorReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val config = SafetyMonitorStore.load(context)
        if (intent.action == SERVICE_STOP) {
            SafetyMonitorScheduler.stop(context)
            return
        }
        if (!config.enabled) return
        when (intent.action) {
            ACTION_PRE_ALERT -> showPreAlert(context, config)
            ACTION_SEND -> SafetyMonitorScheduler.requestSendNow(context)
            ACTION_SKIP -> {
                (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(PRE_ALERT_NOTIFICATION_ID)
                SafetyMonitorStore.recordResult(context, false, "أُلغي الإرسال لهذه المرة: المستخدم أكد أنه بخير.")
                SafetyMonitorScheduler.advance(context)
            }
            ACTION_SEND_NOW -> {
                (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(PRE_ALERT_NOTIFICATION_ID)
                SafetyMonitorScheduler.requestSendNow(context)
            }
        }
    }

    private fun showPreAlert(context: Context, config: SafetyMonitorConfig) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        SafetyMonitorScheduler.ensureChannels(context)
        val skip = PendingIntent.getBroadcast(
            context,
            8710,
            Intent(context, SafetyMonitorReceiver::class.java).setAction(ACTION_SKIP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val send = PendingIntent.getBroadcast(
            context,
            8711,
            Intent(context, SafetyMonitorReceiver::class.java).setAction(ACTION_SEND_NOW),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(context, SAFETY_ALERT_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("سيتم إرسال موقعك قريبًا")
            .setContentText("إذا كنت بخير اضغط «أنا بخير — لا ترسل». وإلا سيحاول الهاتف الإرسال تلقائيًا.")
            .setStyle(NotificationCompat.BigTextStyle().bigText("بعد نحو ${config.warningMinutes} دقائق سيحاول روافد إرسال موقع الهاتف فقط إلى الجهات التي اخترتها مسبقًا في دائرة روافد و/أو جهات SMS المحلية."))
            .addAction(0, "أنا بخير — لا ترسل", skip)
            .addAction(0, "أرسل الآن", send)
            .setAutoCancel(false)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .build()
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(PRE_ALERT_NOTIFICATION_ID, notification)
    }
}

class SafetyLocationService : Service(), LocationListener {
    private lateinit var locationManager: LocationManager
    private val handler = Handler(Looper.getMainLooper())
    private val ioScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var locating = false

    override fun onCreate() {
        super.onCreate()
        SafetyMonitorScheduler.ensureChannels(this)
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val config = SafetyMonitorStore.load(this)
        if (!config.enabled || intent?.action == SERVICE_STOP) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }
        startForeground(STATUS_NOTIFICATION_ID, SafetyMonitorScheduler.statusNotification(this, config))
        if (intent?.action == SERVICE_CAPTURE && !locating) requestCurrentLocation()
        return START_NOT_STICKY
    }

    private fun requestCurrentLocation() {
        if (!hasLocationPermission()) {
            finishAttempt(false, "تعذر تحديد الموقع لأن إذن الموقع غير متاح.")
            return
        }
        val provider = when {
            runCatching { locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) }.getOrDefault(false) -> LocationManager.GPS_PROVIDER
            runCatching { locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) }.getOrDefault(false) -> LocationManager.NETWORK_PROVIDER
            else -> null
        }
        if (provider == null) {
            finishAttempt(false, "خدمات الموقع غير مفعلة على الهاتف.")
            return
        }
        locating = true
        @Suppress("MissingPermission")
        locationManager.requestLocationUpdates(provider, 0L, 0f, this, Looper.getMainLooper())
        handler.postDelayed({
            if (!locating) return@postDelayed
            val fallback = bestRecentLastKnown()
            if (fallback != null) {
                locating = false
                runCatching { locationManager.removeUpdates(this) }
                deliverLocation(fallback)
            } else {
                finishAttempt(false, "لم يتمكن الهاتف من الحصول على موقع حديث خلال 30 ثانية.")
            }
        }, 30_000L)
    }

    override fun onLocationChanged(location: Location) {
        if (!locating) return
        locating = false
        handler.removeCallbacksAndMessages(null)
        runCatching { locationManager.removeUpdates(this) }
        deliverLocation(location)
    }

    private fun deliverLocation(location: Location) {
        val config = SafetyMonitorStore.load(this)
        val localRecipients = MyCircleStore.forPermission(this, CirclePermission.LOCATION_SAFETY).filter { it.phone.isNotBlank() }
        ioScope.launch {
            var cloudCount = 0
            var smsCount = 0
            var cloudError: String? = null
            var smsError: String? = null
            val cloudAttempted = RawafidCircleApi.hasSession(this@SafetyLocationService)
            val smsAttempted = localRecipients.isNotEmpty()

            if (cloudAttempted) {
                runCatching {
                    RawafidCircleApi.broadcastSafetyLocation(
                        this@SafetyLocationService,
                        location.latitude,
                        location.longitude,
                        if (location.hasAccuracy()) location.accuracy.toDouble() else null,
                        config.label
                    )
                }.onSuccess { cloudCount = it.coerceAtLeast(0) }
                    .onFailure { cloudError = "تعذر اتصال دائرة روافد" }
            }

            if (smsAttempted) {
                when {
                    ContextCompat.checkSelfPermission(this@SafetyLocationService, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED ->
                        smsError = "إذن SMS غير متاح للجهات المحلية"
                    !packageManager.hasSystemFeature(PackageManager.FEATURE_TELEPHONY_MESSAGING) ->
                        smsError = "هذا الجهاز لا يدعم SMS"
                    else -> {
                        val mapUrl = "https://maps.google.com/?q=${location.latitude},${location.longitude}"
                        val time = DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date())
                        val message = "روافد · ${config.label}\nهذا تنبيه أمان تلقائي فعّله صاحب هذا الهاتف.\nموقعي الحالي: $mapUrl\nوقت الإرسال: $time"
                        val sms = getSystemService(SmsManager::class.java)
                        localRecipients.forEach { person ->
                            runCatching {
                                val parts = sms.divideMessage(message)
                                sms.sendMultipartTextMessage(person.phone, null, parts, null, null)
                                smsCount++
                            }
                        }
                        if (smsCount == 0) smsError = "تعذر إرسال SMS إلى الجهات المحلية"
                    }
                }
            }

            val outcome = SafetyDeliveryOutcome(
                cloudRecipients = cloudCount,
                smsRecipients = smsCount,
                cloudAttempted = cloudAttempted,
                smsAttempted = smsAttempted,
                cloudError = cloudError,
                smsError = smsError
            )
            withContext(Dispatchers.Main) { finishAttempt(outcome.success, outcome.userMessage()) }
        }
    }

    @Suppress("MissingPermission")
    private fun bestRecentLastKnown(): Location? {
        if (!hasLocationPermission()) return null
        val cutoff = System.currentTimeMillis() - LAST_LOCATION_MAX_AGE_MS
        return listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)
            .mapNotNull { provider -> runCatching { locationManager.getLastKnownLocation(provider) }.getOrNull() }
            .filter { it.time >= cutoff }
            .maxWithOrNull(compareBy<Location> { it.time }.thenBy { -it.accuracy })
    }

    private fun finishAttempt(success: Boolean, result: String) {
        locating = false
        handler.removeCallbacksAndMessages(null)
        if (::locationManager.isInitialized) runCatching { locationManager.removeUpdates(this) }
        SafetyMonitorStore.recordResult(this, success, result)
        SafetyMonitorScheduler.postResult(this, if (success) "تم إرسال موقع الأمان" else "تعذر إرسال موقع الأمان", result)
        SafetyMonitorScheduler.advance(this)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun hasLocationPermission() =
        ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        if (::locationManager.isInitialized) runCatching { locationManager.removeUpdates(this) }
        ioScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

class SafetyMonitorActivity : ComponentActivity() {
    private var onPermissionsReady: ((Boolean) -> Unit)? = null

    private val basePermissions = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { grants ->
        val locationGranted = grants[Manifest.permission.ACCESS_FINE_LOCATION] == true || grants[Manifest.permission.ACCESS_COARSE_LOCATION] == true || hasForegroundLocation()
        val smsRequired = localSmsRecipients().isNotEmpty()
        val smsGranted = !smsRequired || grants[Manifest.permission.SEND_SMS] == true || ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED
        val notificationsGranted = Build.VERSION.SDK_INT < 33 || grants[Manifest.permission.POST_NOTIFICATIONS] == true || ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
        if (!locationGranted || !smsGranted || !notificationsGranted) finishPermissionRequest(false)
        else requestBackgroundLocationIfNeeded()
    }

    private val backgroundPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        finishPermissionRequest(granted || hasBackgroundLocation())
    }

    private val backgroundSettings = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        finishPermissionRequest(hasBackgroundLocation())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        SafetyMonitorScheduler.ensureChannels(this)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { SafetyMonitorScreen(::ensurePermissions) }
                }
            }
        }
    }

    private fun ensurePermissions(result: (Boolean) -> Unit) {
        if (hasAllRequiredPermissions()) {
            result(true)
            return
        }
        onPermissionsReady = result
        val permissions = buildList {
            if (!hasForegroundLocation()) {
                add(Manifest.permission.ACCESS_FINE_LOCATION)
                add(Manifest.permission.ACCESS_COARSE_LOCATION)
            }
            if (localSmsRecipients().isNotEmpty() && ContextCompat.checkSelfPermission(this@SafetyMonitorActivity, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
                add(Manifest.permission.SEND_SMS)
            }
            if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(this@SafetyMonitorActivity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        if (permissions.isEmpty()) requestBackgroundLocationIfNeeded() else basePermissions.launch(permissions.toTypedArray())
    }

    private fun requestBackgroundLocationIfNeeded() {
        when {
            hasBackgroundLocation() -> finishPermissionRequest(true)
            Build.VERSION.SDK_INT == 29 -> backgroundPermission.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
            Build.VERSION.SDK_INT >= 30 -> backgroundSettings.launch(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", packageName, null)))
            else -> finishPermissionRequest(true)
        }
    }

    private fun localSmsRecipients() = MyCircleStore.forPermission(this, CirclePermission.LOCATION_SAFETY).filter { it.phone.isNotBlank() }

    private fun hasForegroundLocation() =
        ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    private fun hasBackgroundLocation() =
        Build.VERSION.SDK_INT < 29 || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED

    private fun hasAllRequiredPermissions(): Boolean {
        val smsReady = localSmsRecipients().isEmpty() || ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED
        val notificationsReady = Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
        return hasForegroundLocation() && hasBackgroundLocation() && smsReady && notificationsReady
    }

    private fun finishPermissionRequest(granted: Boolean) {
        onPermissionsReady?.invoke(granted)
        onPermissionsReady = null
    }
}

@Composable
private fun SafetyMonitorScreen(requestPermissions: ((Boolean) -> Unit) -> Unit) {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    val config = remember(version) { SafetyMonitorStore.load(context) }
    val localRecipients = remember(version) { MyCircleStore.forPermission(context, CirclePermission.LOCATION_SAFETY).filter { it.phone.isNotBlank() } }
    val signedIn = RawafidCircleApi.hasSession(context)
    var cloudRecipients by remember { mutableIntStateOf(if (signedIn) -1 else 0) }
    var cloudStatus by remember { mutableStateOf("") }
    var label by rememberSaveable(config.enabled) { mutableStateOf(config.label) }
    var startHour by rememberSaveable(config.enabled) { mutableIntStateOf(config.startHour) }
    var endHour by rememberSaveable(config.enabled) { mutableIntStateOf(config.endHour) }
    var interval by rememberSaveable(config.enabled) { mutableIntStateOf(config.intervalHours) }
    var warning by rememberSaveable(config.enabled) { mutableIntStateOf(config.warningMinutes) }
    var permissionMessage by remember { mutableStateOf("") }

    LaunchedEffect(version, signedIn) {
        if (!signedIn) {
            cloudRecipients = 0
            cloudStatus = ""
        } else {
            cloudRecipients = -1
            cloudStatus = ""
            runCatching {
                withContext(Dispatchers.IO) {
                    RawafidCircleApi.connections(context).count { connection ->
                        RawafidCircleApi.permissionSnapshot(context, connection.connectionId)
                            .any { it.permission == "safety_location" && it.mine }
                    }
                }
            }.onSuccess { cloudRecipients = it }
                .onFailure {
                    cloudRecipients = 0
                    cloudStatus = "تعذر التحقق من مستلمي دائرة روافد الآن. يمكنك إعادة المحاولة بعد التأكد من الإنترنت والحساب."
                }
        }
    }

    val hasChannel = localRecipients.isNotEmpty() || cloudRecipients > 0

    LazyColumn(contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("مراقبة الأمان والموقع", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("جلسة أمان واضحة يفعّلها صاحب الهاتف. تنبيه قبل كل إرسال، وإرسال عبر دائرة روافد المشفرة منطقيًا و/أو SMS المحلي حسب اختيارك.")
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("كيف تعمل؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("1. تختار المستلمين والوقت والتكرار.")
                    Text("2. قبل الإرسال يظهر تنبيه «أنا بخير — لا ترسل».")
                    Text("3. إذا لم تُلغِ، يلتقط الهاتف موقعًا حديثًا، مع fallback لموقع محفوظ عمره أقل من 10 دقائق عند تعذر GPS اللحظي.")
                    Text("4. يحاول الإرسال إلى دائرة روافد وإلى جهات SMS المحلية بصورة مستقلة؛ نجاح قناة لا يتعطل بفشل الأخرى.")
                    Text("لا يمكن لشخص آخر تشغيل الميزة سرًا أو الحصول على موقعك بمجرد معرفة معرّف روافد.", color = MaterialTheme.colorScheme.error)
                }
            }
        }

        if (config.enabled) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text("المراقبة نشطة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = RawafidSemanticColors.Success)
                        Text("الإرسال التالي: ${formatSafetyTime(config.nextDueAt)}")
                        Text("دائرة روافد: ${if (cloudRecipients < 0) "جارٍ التحقق" else "$cloudRecipients مستلم"}")
                        Text("SMS محلي: ${localRecipients.size} مستلم")
                        if (config.lastAttemptAt > 0L) Text("آخر محاولة: ${formatSafetyTime(config.lastAttemptAt)}")
                        if (config.lastSuccessAt > 0L) Text("آخر إرسال ناجح: ${formatSafetyTime(config.lastSuccessAt)}")
                        if (config.lastResult.isNotBlank()) Text(config.lastResult, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        OutlinedButton(modifier = Modifier.fillMaxWidth(), onClick = {
                            SafetyMonitorScheduler.requestSendNow(context)
                            permissionMessage = "بدأ اختبار تحديد الموقع والإرسال عبر القنوات المفعلة."
                        }) { Text("اختبار الإرسال الآن") }
                        Button(modifier = Modifier.fillMaxWidth(), onClick = { SafetyMonitorScheduler.stop(context); version++ }) { Text("إيقاف المراقبة") }
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("من سيستلم موقعي؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    if (signedIn) {
                        Text(if (cloudRecipients < 0) "دائرة روافد: جارٍ التحقق من الصلاحيات..." else "دائرة روافد: $cloudRecipients شخص فعّلت له «موقع مراقبة الأمان».")
                    } else Text("دائرة روافد: سجّل الدخول لإتاحة الإرسال الآمن داخل التطبيق.")
                    if (localRecipients.isEmpty()) Text("SMS محلي: لا توجد جهة مفعلة.")
                    else localRecipients.forEach { person -> Text("• SMS — ${person.name}${if (person.relation.isNotBlank()) " — ${person.relation}" else ""}") }
                    if (cloudStatus.isNotBlank()) Text(cloudStatus, color = MaterialTheme.colorScheme.error)
                    OutlinedButton(modifier = Modifier.fillMaxWidth(), onClick = { context.startActivity(Intent(context, MyCircleActivity::class.java)) }) { Text("إدارة المستلمين والصلاحيات") }
                    OutlinedButton(modifier = Modifier.fillMaxWidth(), onClick = { version++ }) { Text("إعادة التحقق من المستلمين") }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("جدول المراقبة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(label, { label = it.take(80) }, label = { Text("اسم واضح — مثال: خروج الوالد مساءً") }, modifier = Modifier.fillMaxWidth())
                    Text("ابدأ نافذة الإرسال من الساعة")
                    HourChips(startHour) { startHour = it }
                    Text("أوقف نافذة الإرسال عند الساعة")
                    HourChips(endHour) { endHour = it }
                    Text("حاول الإرسال كل")
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        listOf(1, 2, 3, 4).forEach { hours ->
                            FilterChip(selected = interval == hours, onClick = { interval = hours }, label = { Text(if (hours == 1) "ساعة" else "$hours ساعات") })
                        }
                    }
                    Text("نبّهني قبل الإرسال")
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        listOf(5, 10, 15).forEach { minutes ->
                            FilterChip(selected = warning == minutes, onClick = { warning = minutes }, label = { Text("$minutes دقائق") })
                        }
                    }
                }
            }
        }

        item {
            Button(
                modifier = Modifier.fillMaxWidth(),
                enabled = !config.enabled && cloudRecipients >= 0 && hasChannel,
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
                                    warningMinutes = warning,
                                    lastAttemptAt = config.lastAttemptAt,
                                    lastSuccessAt = config.lastSuccessAt,
                                    lastResult = config.lastResult
                                )
                            )
                            version++
                        } else {
                            val smsPart = if (localRecipients.isNotEmpty()) " وإرسال SMS" else ""
                            permissionMessage = "لم تبدأ المراقبة. يلزم الموقع، والموقع طوال الوقت، والإشعارات$smsPart. على Android 11 أو أحدث اختر «السماح طوال الوقت» من إعدادات موقع التطبيق."
                        }
                    }
                }
            ) { Text("مراجعة الأذونات وبدء المراقبة") }
        }

        if (!config.enabled && cloudRecipients >= 0 && !hasChannel) {
            item { Text("أضف مستلمًا واحدًا على الأقل في دائرة روافد أو جهات SMS المحلية قبل بدء المراقبة.", color = MaterialTheme.colorScheme.error) }
        }
        if (permissionMessage.isNotBlank()) item { Text(permissionMessage, color = MaterialTheme.colorScheme.primary) }

        item {
            Text(
                "هذه ميزة مساعدة وليست بديلًا عن خدمات الطوارئ أو جهاز تتبع طبي معتمد. يعتمد الإرسال على تشغيل الهاتف، توفر الموقع، أذونات النظام، وعلى الإنترنت لدائرة روافد أو شبكة الهاتف لمسار SMS. قد يؤخر Android التنبيهات المجدولة قليلًا بسبب سياسات الطاقة.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
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

private fun formatSafetyTime(value: Long): String =
    if (value <= 0L) "—" else DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(value))
