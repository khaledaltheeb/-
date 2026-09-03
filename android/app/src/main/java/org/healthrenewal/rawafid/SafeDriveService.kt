package org.healthrenewal.rawafid

import android.Manifest
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
import android.telephony.SmsManager
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Locale
import kotlin.math.sqrt

private const val SAFE_DRIVE_STATUS_CHANNEL = "rawafid_safe_drive_status"
private const val SAFE_DRIVE_ALERT_CHANNEL = "rawafid_safe_drive_alerts"
private const val SAFE_DRIVE_STATUS_ID = 9801
private const val SAFE_DRIVE_INCIDENT_ID = 9802
private const val SAFE_DRIVE_RESULT_ID = 9803
private const val SAFE_DRIVE_REST_ID = 9804
private const val SAFE_DRIVE_ARRIVAL_ID = 9805
private const val SAFE_DRIVE_EVENT_BASE_ID = 9820

const val ACTION_SAFE_DRIVE_START = "org.healthrenewal.rawafid.SAFE_DRIVE_START"
const val ACTION_SAFE_DRIVE_STOP = "org.healthrenewal.rawafid.SAFE_DRIVE_STOP"
const val ACTION_SAFE_DRIVE_INCIDENT_OK = "org.healthrenewal.rawafid.SAFE_DRIVE_INCIDENT_OK"
const val ACTION_SAFE_DRIVE_INCIDENT_HELP = "org.healthrenewal.rawafid.SAFE_DRIVE_INCIDENT_HELP"
const val ACTION_SAFE_DRIVE_HELP_NOW = "org.healthrenewal.rawafid.SAFE_DRIVE_HELP_NOW"

data class SafeDrivePendingCheck(
    val candidate: SafeDriveIncidentCandidate,
    val expiresAtMs: Long
)

object SafeDriveRuntime {
    private val _state = MutableStateFlow(SafeDriveLiveState())
    val state: StateFlow<SafeDriveLiveState> = _state.asStateFlow()

    private val _pendingCheck = MutableStateFlow<SafeDrivePendingCheck?>(null)
    val pendingCheck: StateFlow<SafeDrivePendingCheck?> = _pendingCheck.asStateFlow()

    internal fun update(state: SafeDriveLiveState) { _state.value = state }
    internal fun pending(value: SafeDrivePendingCheck?) { _pendingCheck.value = value }
}

object SafeDriveController {
    fun start(context: Context) {
        ContextCompat.startForegroundService(
            context,
            Intent(context, SafeDriveService::class.java).setAction(ACTION_SAFE_DRIVE_START)
        )
    }

    fun stop(context: Context) {
        context.startService(Intent(context, SafeDriveService::class.java).setAction(ACTION_SAFE_DRIVE_STOP))
    }

    fun confirmSafe(context: Context) {
        context.startService(Intent(context, SafeDriveService::class.java).setAction(ACTION_SAFE_DRIVE_INCIDENT_OK))
    }

    fun requestHelp(context: Context) {
        context.startService(Intent(context, SafeDriveService::class.java).setAction(ACTION_SAFE_DRIVE_INCIDENT_HELP))
    }

    fun requestHelpNow(context: Context) {
        context.startService(Intent(context, SafeDriveService::class.java).setAction(ACTION_SAFE_DRIVE_HELP_NOW))
    }
}

class SafeDriveService : Service(), LocationListener, SensorEventListener {
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private lateinit var locationManager: LocationManager
    private lateinit var sensorManager: SensorManager
    private var analyzer: SafeDriveAnalyzer? = null
    private var incidentDetector: SafeDriveIncidentDetector? = null
    private var driveConfig = SafeDriveConfig()
    private var incidentConfig = SafeDriveIncidentConfig()
    private var advancedConfig = SafeDriveAdvancedConfig()
    private var voiceCoach: SafeDriveVoiceCoach? = null
    private var lastLocation: Location? = null
    private var incidentTimeoutJob: Job? = null
    private var sessionStartedWallMs = 0L
    private var sessionStartedElapsedMs = 0L
    private var lastStatusNotificationAt = 0L
    private var lastRestReminderElapsedMs = 0L
    private var monitoring = false

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        ensureChannels()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SAFE_DRIVE_START -> startMonitoring()
            ACTION_SAFE_DRIVE_STOP -> finishTrip()
            ACTION_SAFE_DRIVE_INCIDENT_OK -> resolveIncidentSafe()
            ACTION_SAFE_DRIVE_INCIDENT_HELP -> resolveIncidentHelp(auto = false)
            ACTION_SAFE_DRIVE_HELP_NOW -> manualHelpRequest()
        }
        return START_NOT_STICKY
    }

    private fun startMonitoring() {
        if (monitoring) return
        if (!hasFineLocation()) {
            postResult("تعذر بدء القيادة الآمنة", "يلزم منح إذن الموقع الدقيق من شاشة قيادة آمنة أولًا.")
            stopSelf()
            return
        }

        driveConfig = SafeDriveStore.config(this)
        incidentConfig = SafeDriveIncidentStore.config(this)
        advancedConfig = SafeDriveAdvancedStore.config(this)
        voiceCoach?.shutdown()
        voiceCoach = SafeDriveVoiceCoach(this, advancedConfig.spokenAlertsEnabled)
        sessionStartedWallMs = System.currentTimeMillis()
        sessionStartedElapsedMs = SystemClock.elapsedRealtime()
        lastRestReminderElapsedMs = 0L
        analyzer = SafeDriveAnalyzer(driveConfig, sessionStartedWallMs, sessionStartedElapsedMs)
        incidentDetector = SafeDriveIncidentDetector(incidentConfig)
        lastLocation = null
        monitoring = true

        startForeground(SAFE_DRIVE_STATUS_ID, statusNotification(SafeDriveLiveState(active = true, startedAtMs = sessionStartedWallMs)))
        SafeDriveRuntime.update(SafeDriveLiveState(active = true, startedAtMs = sessionStartedWallMs, statusMessage = "جارٍ تثبيت إشارة الموقع..."))
        requestLocationUpdates()
        registerMotionSensor()
        if (advancedConfig.nightGuardEnabled && SafeDriveAdvancedPolicy.isNightTime(sessionStartedWallMs)) {
            voiceCoach?.speak("قيادة ليلية. حافظ على الانتباه وخذ استراحة أبكر عند الشعور بالتعب.")
        }
    }

    @SuppressLint("MissingPermission")
    private fun requestLocationUpdates() {
        if (!hasFineLocation()) return
        val providers = buildList {
            if (runCatching { locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) }.getOrDefault(false)) add(LocationManager.GPS_PROVIDER)
            if (runCatching { locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) }.getOrDefault(false)) add(LocationManager.NETWORK_PROVIDER)
        }.distinct()
        if (providers.isEmpty()) {
            SafeDriveRuntime.update(SafeDriveRuntime.state.value.copy(statusMessage = "فعّل خدمة الموقع لمتابعة الرحلة."))
            return
        }
        providers.forEach { provider ->
            runCatching {
                locationManager.requestLocationUpdates(provider, if (provider == LocationManager.GPS_PROVIDER) 1000L else 2500L, 0f, this, Looper.getMainLooper())
            }
        }
    }

    private fun registerMotionSensor() {
        val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) ?: return
        sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME)
    }

    override fun onLocationChanged(location: Location) {
        if (!monitoring) return
        val engine = analyzer ?: return
        val elapsedMs = if (location.elapsedRealtimeNanos > 0L) location.elapsedRealtimeNanos / 1_000_000L else SystemClock.elapsedRealtime()
        val sample = SafeDriveSample(
            wallTimeMs = location.time.takeIf { it > 0L } ?: System.currentTimeMillis(),
            elapsedMs = elapsedMs,
            latitude = location.latitude,
            longitude = location.longitude,
            accuracyM = if (location.hasAccuracy()) location.accuracy else 999f,
            speedMps = if (location.hasSpeed()) location.speed.toDouble().coerceAtLeast(0.0) else null,
            speedAccuracyMps = if (location.hasSpeedAccuracy()) location.speedAccuracyMetersPerSecond else null,
            bearingDegrees = if (location.hasBearing()) location.bearing else null,
            bearingAccuracyDegrees = if (location.hasBearingAccuracy()) location.bearingAccuracyDegrees else null
        )
        val reliableLocation = location.hasAccuracy() && location.accuracy in 0.1f..driveConfig.maxLocationAccuracyM
        if (reliableLocation) lastLocation = location
        val events = engine.consume(sample)
        val state = engine.liveState(statusMessage = if (reliableLocation) "القياس نشط" else "إشارة GPS ضعيفة")
        SafeDriveRuntime.update(state)
        if (reliableLocation) {
            incidentDetector?.consume(sample, state.currentSpeedKmh, state.currentAccelerationMps2)?.let(::beginIncidentCheck)
        }
        handleDrivingEvents(events, state)
        maybeRestReminder(state)
        maybeUpdateStatusNotification(state)
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (!monitoring || event.sensor.type != Sensor.TYPE_ACCELEROMETER || event.values.size < 3) return
        val magnitude = sqrt(
            event.values[0].toDouble() * event.values[0].toDouble() +
                event.values[1].toDouble() * event.values[1].toDouble() +
                event.values[2].toDouble() * event.values[2].toDouble()
        ) / SensorManager.GRAVITY_EARTH.toDouble()
        incidentDetector?.recordImpact(event.timestamp / 1_000_000L, magnitude)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
    override fun onProviderEnabled(provider: String) = Unit
    override fun onProviderDisabled(provider: String) {
        SafeDriveRuntime.update(SafeDriveRuntime.state.value.copy(statusMessage = "خدمة موقع $provider غير متاحة حاليًا."))
    }

    private fun handleDrivingEvents(events: List<SafeDriveEvent>, state: SafeDriveLiveState) {
        val highRiskTypes = setOf(
            SafeDriveEventType.SPEEDING_PERSISTENT,
            SafeDriveEventType.SEVERE_SPEED,
            SafeDriveEventType.RISK_CLUSTER
        )
        events.forEach { event ->
            val highRisk = event.type in highRiskTypes
            if (!advancedConfig.reduceDistractionEnabled || highRisk) {
                postDrivingEvent(event, state.provisionalScore)
            }
            SafeDriveAdvancedPolicy.spokenEvent(event, advancedConfig.newDriverMode)?.let { voiceCoach?.speak(it) }
            if (driveConfig.shareLiveAlerts && highRisk) {
                val summary = SafeDriveScoring.alertSummary(event, state.provisionalScore)
                serviceScope.launch(Dispatchers.IO) {
                    runCatching {
                        if (RawafidCircleApi.hasSession(this@SafeDriveService)) {
                            RawafidCircleApi.broadcastDriveAlert(
                                this@SafeDriveService,
                                null,
                                null,
                                null,
                                "risky_driving",
                                summary
                            )
                        }
                    }
                }
            }
        }
    }

    private fun maybeRestReminder(state: SafeDriveLiveState) {
        val restMinutes = SafeDriveAdvancedPolicy.effectiveRestMinutes(advancedConfig, System.currentTimeMillis())
        val thresholdMs = restMinutes * 60_000L
        if (state.elapsedMs < thresholdMs) return
        if (lastRestReminderElapsedMs != 0L && state.elapsedMs - lastRestReminderElapsedMs < 60 * 60_000L) return
        lastRestReminderElapsedMs = state.elapsedMs
        val text = "قدت قرابة $restMinutes دقيقة. توقف للاستراحة في مكان آمن قبل متابعة الرحلة."
        postGuidance("استراحة السائق", text, SAFE_DRIVE_REST_ID)
        voiceCoach?.speak("تذكير بالاستراحة. توقف في مكان آمن وخذ استراحة قبل متابعة القيادة.")
    }

    private fun beginIncidentCheck(candidate: SafeDriveIncidentCandidate) {
        if (SafeDriveRuntime.pendingCheck.value != null) return
        val pending = SafeDrivePendingCheck(candidate, System.currentTimeMillis() + incidentConfig.responseSeconds * 1000L)
        SafeDriveRuntime.pending(pending)
        postIncidentCheck(pending)
        voiceCoach?.speak("هل أنت بخير؟ افتح تنبيه روافد لتأكيد سلامتك أو طلب المساعدة.")
        incidentTimeoutJob?.cancel()
        if (incidentConfig.autoEscalateIfUnanswered) {
            incidentTimeoutJob = serviceScope.launch {
                delay(incidentConfig.responseSeconds * 1000L)
                if (SafeDriveRuntime.pendingCheck.value?.candidate?.id == candidate.id) {
                    resolveIncidentHelp(auto = true)
                }
            }
        }
    }

    private fun resolveIncidentSafe() {
        val pending = SafeDriveRuntime.pendingCheck.value ?: return
        incidentTimeoutJob?.cancel()
        SafeDriveIncidentStore.add(this, pending.candidate, SafeDriveIncidentOutcome.SAFE_CONFIRMED, "أكد المستخدم أنه بخير بعد التوقف المفاجئ.")
        SafeDriveRuntime.pending(null)
        notificationManager().cancel(SAFE_DRIVE_INCIDENT_ID)
        postResult("تم تسجيل الاطمئنان", "تم تسجيل نقطة الاطمئنان: أكدت أنك بخير، ولم يُرسل تنبيه مساعدة.")
    }

    private fun resolveIncidentHelp(auto: Boolean) {
        val pending = SafeDriveRuntime.pendingCheck.value ?: return
        incidentTimeoutJob?.cancel()
        val outcome = if (auto) SafeDriveIncidentOutcome.AUTO_ESCALATED else SafeDriveIncidentOutcome.HELP_REQUESTED
        SafeDriveIncidentStore.add(
            this,
            pending.candidate,
            outcome,
            if (auto) "لم يصل رد ضمن مهلة الأمان فتم تشغيل التصعيد المفعّل مسبقًا." else "اختار المستخدم أنه يحتاج مساعدة."
        )
        SafeDriveRuntime.pending(null)
        notificationManager().cancel(SAFE_DRIVE_INCIDENT_ID)
        deliverIncidentAlert(pending.candidate, auto)
    }

    private fun manualHelpRequest() {
        val location = lastLocation
        if (location == null || !location.hasAccuracy() || location.accuracy > driveConfig.maxLocationAccuracyM) {
            postResult("أحتاج مساعدة", "لم يتوفر موقع موثوق بعد. أبقِ قيادة آمنة مفتوحة حتى يثبت GPS ثم أعد المحاولة.")
            return
        }
        val candidate = SafeDriveIncidentCandidate(
            detectedAtMs = System.currentTimeMillis(),
            elapsedMs = SystemClock.elapsedRealtime(),
            latitude = location.latitude,
            longitude = location.longitude,
            accuracyM = location.accuracy,
            preStopSpeedKmh = SafeDriveRuntime.state.value.currentSpeedKmh,
            currentSpeedKmh = SafeDriveRuntime.state.value.currentSpeedKmh,
            decelerationMps2 = SafeDriveRuntime.state.value.currentAccelerationMps2,
            peakImpactG = 0.0,
            reason = "طلب مساعدة يدوي من السائق"
        )
        SafeDriveIncidentStore.add(this, candidate, SafeDriveIncidentOutcome.HELP_REQUESTED, "طلب المستخدم مساعدة مباشرة أثناء الرحلة.")
        deliverIncidentAlert(candidate, auto = false)
    }

    private fun deliverIncidentAlert(candidate: SafeDriveIncidentCandidate, auto: Boolean) {
        val event = if (auto) "sudden_stop_unanswered" else "help_requested"
        val summary = if (auto) {
            "توقف مفاجئ محتمل أثناء قيادة آمنة ولم يصل رد خلال مهلة الاطمئنان. يُنصح بالتواصل مع صاحب الحساب."
        } else {
            "صاحب الحساب طلب المساعدة من قيادة آمنة بعد توقف مفاجئ أو أثناء الرحلة. يُنصح بالتواصل معه."
        }
        serviceScope.launch(Dispatchers.IO) {
            var cloudRecipients = 0
            var smsRecipients = 0
            var cloudError = false
            if (RawafidCircleApi.hasSession(this@SafeDriveService)) {
                runCatching {
                    RawafidCircleApi.broadcastDriveAlert(
                        this@SafeDriveService,
                        candidate.latitude,
                        candidate.longitude,
                        candidate.accuracyM.toDouble(),
                        event,
                        summary
                    )
                }.onSuccess { cloudRecipients = it }.onFailure { cloudError = true }
            }
            smsRecipients = sendLocalDriveSms(candidate, summary)
            val result = buildString {
                append("تمت محاولة إرسال تنبيه المساعدة مع آخر موقع موثوق. ")
                append("دائرة روافد: $cloudRecipients · SMS: $smsRecipients")
                if (cloudError) append(" · تعذر جزء من الإرسال السحابي")
                if (cloudRecipients + smsRecipients == 0) append(". لم تُحدد جهة قيادة آمنة مستلمة بعد.")
            }
            postResult("تنبيه قيادة آمنة", result)
        }
    }

    private fun sendLocalDriveSms(candidate: SafeDriveIncidentCandidate, summary: String): Int {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) return 0
        val recipients = MyCircleStore.forPermission(this, CirclePermission.DRIVING_SAFETY)
            .map { it.phone.trim() }
            .filter { it.isNotBlank() }
            .distinct()
            .take(10)
        if (recipients.isEmpty()) return 0
        val maps = "https://maps.google.com/?q=${String.format(Locale.US, "%.6f", candidate.latitude)},${String.format(Locale.US, "%.6f", candidate.longitude)}"
        val body = "روافد · قيادة آمنة\n$summary\nالموقع: $maps"
        val sms = SmsManager.getDefault()
        var sent = 0
        recipients.forEach { phone ->
            runCatching {
                val parts = sms.divideMessage(body)
                if (parts.size <= 1) sms.sendTextMessage(phone, null, body, null, null)
                else sms.sendMultipartTextMessage(phone, null, parts, null, null)
            }.onSuccess { sent++ }
        }
        return sent
    }

    private fun finishTrip() {
        if (!monitoring) {
            stopSelf()
            return
        }
        monitoring = false
        incidentTimeoutJob?.cancel()
        SafeDriveRuntime.pending(null)
        runCatching { locationManager.removeUpdates(this) }
        runCatching { sensorManager.unregisterListener(this) }
        notificationManager().cancel(SAFE_DRIVE_INCIDENT_ID)

        val report = analyzer?.finish(System.currentTimeMillis())
        analyzer = null
        incidentDetector = null
        if (report != null && report.acceptedSamples >= 2) {
            SafeDriveStore.addReport(this, report)
            if (driveConfig.shareTripReports && RawafidCircleApi.hasSession(this)) {
                SafeDriveReportShareWorker.enqueue(this, report.id)
            }
            SafeDriveRuntime.update(SafeDriveLiveState(active = false, lastCompletedReport = report, statusMessage = "تم حفظ تقرير الرحلة."))
        } else {
            SafeDriveRuntime.update(SafeDriveLiveState(active = false, statusMessage = "انتهت الرحلة قبل توفر بيانات كافية للتقرير."))
        }
        if (advancedConfig.arrivalPromptOnTripEnd && SafeArrivalStore.load(this).active) {
            postArrivalPrompt()
        }
        voiceCoach?.shutdown()
        voiceCoach = null
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        incidentTimeoutJob?.cancel()
        runCatching { locationManager.removeUpdates(this) }
        runCatching { sensorManager.unregisterListener(this) }
        voiceCoach?.shutdown()
        voiceCoach = null
        if (monitoring) {
            monitoring = false
            SafeDriveRuntime.update(SafeDriveLiveState(active = false, statusMessage = "توقفت جلسة القيادة الآمنة."))
        }
        serviceScope.cancel()
        super.onDestroy()
    }

    private fun hasFineLocation(): Boolean = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED

    private fun maybeUpdateStatusNotification(state: SafeDriveLiveState) {
        val now = SystemClock.elapsedRealtime()
        if (now - lastStatusNotificationAt < 4_000L) return
        lastStatusNotificationAt = now
        notificationManager().notify(SAFE_DRIVE_STATUS_ID, statusNotification(state))
    }

    private fun statusNotification(state: SafeDriveLiveState): Notification {
        val open = PendingIntent.getActivity(
            this,
            9801,
            Intent(this, SafeDriveActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val stop = PendingIntent.getService(
            this,
            9814,
            Intent(this, SafeDriveService::class.java).setAction(ACTION_SAFE_DRIVE_STOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val help = PendingIntent.getService(
            this,
            9815,
            Intent(this, SafeDriveService::class.java).setAction(ACTION_SAFE_DRIVE_HELP_NOW),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val text = if (state.currentSpeedKmh > 0.0) {
            "${state.currentSpeedKmh.toInt()} كم/س · تقييم ${state.provisionalScore}/100"
        } else "الرحلة قيد المتابعة · ${state.statusMessage.ifBlank { "بانتظار الحركة" }}"
        return NotificationCompat.Builder(this, SAFE_DRIVE_STATUS_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("قيادة آمنة تعمل")
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText("$text. لا تنظر إلى الشاشة أثناء القيادة."))
            .setContentIntent(open)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .addAction(0, "أحتاج مساعدة", help)
            .addAction(0, "إنهاء الرحلة", stop)
            .build()
    }

    private fun postDrivingEvent(event: SafeDriveEvent, score: Int) {
        val text = SafeDriveScoring.alertSummary(event, score)
        val open = PendingIntent.getActivity(
            this,
            SAFE_DRIVE_EVENT_BASE_ID + event.type.ordinal,
            Intent(this, SafeDriveActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        notificationManager().notify(
            SAFE_DRIVE_EVENT_BASE_ID + event.type.ordinal,
            NotificationCompat.Builder(this, SAFE_DRIVE_ALERT_CHANNEL)
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentTitle(event.type.label)
                .setContentText(text)
                .setStyle(NotificationCompat.BigTextStyle().bigText(text))
                .setContentIntent(open)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION)
                .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
                .build()
        )
    }

    private fun postGuidance(title: String, text: String, notificationId: Int) {
        val open = PendingIntent.getActivity(
            this,
            notificationId,
            Intent(this, SafeDriveActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        notificationManager().notify(
            notificationId,
            NotificationCompat.Builder(this, SAFE_DRIVE_ALERT_CHANNEL)
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(NotificationCompat.BigTextStyle().bigText(text))
                .setContentIntent(open)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION)
                .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
                .build()
        )
    }

    private fun postArrivalPrompt() {
        val open = PendingIntent.getActivity(
            this,
            SAFE_DRIVE_ARRIVAL_ID,
            Intent(this, SafeArrivalActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        notificationManager().notify(
            SAFE_DRIVE_ARRIVAL_ID,
            NotificationCompat.Builder(this, SAFE_DRIVE_ALERT_CHANNEL)
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentTitle("انتهت رحلة القيادة")
                .setContentText("لديك فحص «وصلت بالسلامة» نشط. أكد وصولك إذا كنت وصلت فعلًا.")
                .setStyle(NotificationCompat.BigTextStyle().bigText("انتهاء جلسة القيادة لا يثبت الوصول تلقائيًا. افتح «وصلت بالسلامة» وأكد أنك بخير فقط إذا وصلت بالفعل."))
                .setContentIntent(open)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
                .build()
        )
    }

    private fun postIncidentCheck(pending: SafeDrivePendingCheck) {
        val open = PendingIntent.getActivity(
            this,
            9810,
            Intent(this, SafeDriveActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val ok = PendingIntent.getService(
            this,
            9811,
            Intent(this, SafeDriveService::class.java).setAction(ACTION_SAFE_DRIVE_INCIDENT_OK),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val help = PendingIntent.getService(
            this,
            9812,
            Intent(this, SafeDriveService::class.java).setAction(ACTION_SAFE_DRIVE_INCIDENT_HELP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val text = "رُصد توقف سريع بعد حركة. ${pending.candidate.reason}. إذا كنت بخير أكد ذلك؛ وإذا احتجت مساعدة سنرسل آخر موقع موثوق للجهات التي اخترتها."
        notificationManager().notify(
            SAFE_DRIVE_INCIDENT_ID,
            NotificationCompat.Builder(this, SAFE_DRIVE_ALERT_CHANNEL)
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentTitle("هل أنت بخير؟")
                .setContentText(text)
                .setStyle(NotificationCompat.BigTextStyle().bigText(text))
                .setContentIntent(open)
                .setAutoCancel(false)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
                .addAction(0, "نعم، أنا بخير", ok)
                .addAction(0, "لا، أحتاج مساعدة", help)
                .build()
        )
    }

    private fun postResult(title: String, text: String) {
        notificationManager().notify(
            SAFE_DRIVE_RESULT_ID,
            NotificationCompat.Builder(this, SAFE_DRIVE_ALERT_CHANNEL)
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(NotificationCompat.BigTextStyle().bigText(text))
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
                .build()
        )
    }

    private fun ensureChannels() {
        val manager = notificationManager()
        manager.createNotificationChannels(
            listOf(
                NotificationChannel(SAFE_DRIVE_STATUS_CHANNEL, "حالة القيادة الآمنة", NotificationManager.IMPORTANCE_LOW).apply {
                    description = "إشعار مستمر أثناء جلسة القيادة الآمنة"
                    lockscreenVisibility = Notification.VISIBILITY_PRIVATE
                },
                NotificationChannel(SAFE_DRIVE_ALERT_CHANNEL, "تنبيهات القيادة الآمنة", NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "تنبيهات السرعة ومؤشرات القيادة والتوقف المفاجئ"
                    lockscreenVisibility = Notification.VISIBILITY_PRIVATE
                }
            )
        )
    }

    private fun notificationManager(): NotificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
}

class SafeDriveReportShareWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        val reportId = inputData.getString(KEY_REPORT_ID).orEmpty()
        if (reportId.isBlank() || !RawafidCircleApi.hasSession(applicationContext)) return Result.success()
        val report = SafeDriveStore.reports(applicationContext).firstOrNull { it.id == reportId } ?: return Result.success()
        return runCatching {
            RawafidCircleApi.broadcastDriveReport(applicationContext, report)
            Result.success()
        }.getOrElse {
            if (runAttemptCount < 4) Result.retry() else Result.success()
        }
    }

    companion object {
        private const val KEY_REPORT_ID = "report_id"
        fun enqueue(context: Context, reportId: String) {
            val constraints = Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
            val request = OneTimeWorkRequestBuilder<SafeDriveReportShareWorker>()
                .setConstraints(constraints)
                .setInputData(workDataOf(KEY_REPORT_ID to reportId))
                .build()
            WorkManager.getInstance(context).enqueue(request)
        }
    }
}
