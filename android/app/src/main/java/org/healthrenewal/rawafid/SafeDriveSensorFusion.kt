package org.healthrenewal.rawafid

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.HandlerThread
import android.os.SystemClock
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.PI
import kotlin.math.sqrt

data class SafeDriveSensorFusionState(
    val active: Boolean = false,
    val gyroscopeAvailable: Boolean = false,
    val recentAngularRateDegPerSec: Double = 0.0,
    val peakAngularRateDegPerSec: Double = 0.0,
    val gpsHardTurnCount: Int = 0,
    val gyroCorroboratedTurnCount: Int = 0,
    val gpsOnlyTurnCount: Int = 0
)

data class SafeDriveSensorFusionSummary(
    val reportId: String,
    val startedAtMs: Long,
    val endedAtMs: Long,
    val gyroscopeAvailable: Boolean,
    val gpsHardTurnCount: Int,
    val gyroCorroboratedTurnCount: Int,
    val gpsOnlyTurnCount: Int,
    val peakAngularRateDegPerSec: Double
)

object SafeDriveTurnFusionRule {
    const val DEFAULT_MIN_GYRO_RATE_DEG_PER_SEC = 25.0
    const val DEFAULT_MAX_SIGNAL_AGE_MS = 2_500L

    fun corroborates(
        hardTurnDetectedAtElapsedMs: Long,
        gyroSignalAtElapsedMs: Long,
        gyroAngularRateDegPerSec: Double,
        gyroscopeAvailable: Boolean,
        minRateDegPerSec: Double = DEFAULT_MIN_GYRO_RATE_DEG_PER_SEC,
        maxSignalAgeMs: Long = DEFAULT_MAX_SIGNAL_AGE_MS
    ): Boolean {
        if (!gyroscopeAvailable || gyroSignalAtElapsedMs < 0L) return false
        val age = hardTurnDetectedAtElapsedMs - gyroSignalAtElapsedMs
        if (age !in 0L..maxSignalAgeMs) return false
        return gyroAngularRateDegPerSec.isFinite() && gyroAngularRateDegPerSec >= minRateDegPerSec
    }
}

object SafeDriveSensorFusionRuntime {
    private val mutable = MutableStateFlow(SafeDriveSensorFusionState())
    val state: StateFlow<SafeDriveSensorFusionState> = mutable.asStateFlow()
    internal fun update(value: SafeDriveSensorFusionState) { mutable.value = value }
}

object SafeDriveSensorFusionStore {
    private const val KEY = "rawafid_safe_drive_sensor_fusion_v1"

    fun summaries(context: Context): List<SafeDriveSensorFusionSummary> {
        val raw = EncryptedLocalStore.get(context, KEY) ?: return emptyList()
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val o = array.optJSONObject(i) ?: continue
                    add(
                        SafeDriveSensorFusionSummary(
                            reportId = o.optString("report_id"),
                            startedAtMs = o.optLong("started_at_ms"),
                            endedAtMs = o.optLong("ended_at_ms"),
                            gyroscopeAvailable = o.optBoolean("gyroscope_available"),
                            gpsHardTurnCount = o.optInt("gps_hard_turn_count"),
                            gyroCorroboratedTurnCount = o.optInt("gyro_corroborated_turn_count"),
                            gpsOnlyTurnCount = o.optInt("gps_only_turn_count"),
                            peakAngularRateDegPerSec = o.optDouble("peak_angular_rate_deg_per_sec", 0.0)
                        )
                    )
                }
            }
        }.getOrDefault(emptyList())
    }

    fun forReport(context: Context, reportId: String): SafeDriveSensorFusionSummary? =
        summaries(context).firstOrNull { it.reportId == reportId }

    internal fun save(context: Context, summary: SafeDriveSensorFusionSummary) {
        val retained = summaries(context).filterNot { it.reportId == summary.reportId }.take(79)
        val array = JSONArray()
        (listOf(summary) + retained).forEach { item ->
            array.put(
                JSONObject()
                    .put("report_id", item.reportId)
                    .put("started_at_ms", item.startedAtMs)
                    .put("ended_at_ms", item.endedAtMs)
                    .put("gyroscope_available", item.gyroscopeAvailable)
                    .put("gps_hard_turn_count", item.gpsHardTurnCount)
                    .put("gyro_corroborated_turn_count", item.gyroCorroboratedTurnCount)
                    .put("gps_only_turn_count", item.gpsOnlyTurnCount)
                    .put("peak_angular_rate_deg_per_sec", item.peakAngularRateDegPerSec)
            )
        }
        EncryptedLocalStore.put(context, KEY, array.toString())
    }
}

/**
 * Gyroscope is used only while a Safe Drive trip is active. It does not infer a
 * trip, does not collect location, and does not change the legal/personal speed
 * interpretation. It corroborates GPS-derived hard turns for calibration and
 * quality review so a phone movement alone is never treated as a driving turn.
 */
object SafeDriveSensorFusionObserver : SensorEventListener {
    private val started = AtomicBoolean(false)
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var appContext: Context? = null
    private var sensorManager: SensorManager? = null
    private var gyroscope: Sensor? = null
    private var sensorThread: HandlerThread? = null
    private var sensorHandler: Handler? = null
    private var registered = false
    private var tripStartedAtMs = 0L
    private var tripStartedSensorElapsedMs = 0L
    private var previousHardTurnCount = 0
    private var corroboratedTurns = 0
    private var gpsOnlyTurns = 0
    private var peakAngularRate = 0.0
    @Volatile private var recentAngularRate = 0.0
    @Volatile private var recentGyroTripElapsedMs = -1L

    fun start(context: Context) {
        if (!started.compareAndSet(false, true)) return
        val app = context.applicationContext
        appContext = app
        sensorManager = app.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        gyroscope = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
        sensorThread = HandlerThread("RawafidSafeDriveGyro").also { it.start() }
        sensorHandler = sensorThread?.looper?.let(::Handler)

        scope.launch {
            SafeDriveRuntime.state.collectLatest { state ->
                if (state.active) {
                    if (!registered && tripStartedAtMs == 0L) beginTrip(state)
                    evaluateHardTurnChange(state)
                    publish(active = true, gpsHardTurnCount = state.hardTurnCount)
                } else if (registered || tripStartedAtMs > 0L) {
                    endTrip(state.lastCompletedReport)
                } else {
                    publish(active = false, gpsHardTurnCount = 0)
                }
            }
        }
    }

    private fun beginTrip(state: SafeDriveLiveState) {
        tripStartedAtMs = state.startedAtMs
        tripStartedSensorElapsedMs = SystemClock.elapsedRealtime()
        previousHardTurnCount = state.hardTurnCount
        corroboratedTurns = 0
        gpsOnlyTurns = 0
        peakAngularRate = 0.0
        recentAngularRate = 0.0
        recentGyroTripElapsedMs = -1L
        val gyro = gyroscope
        val manager = sensorManager
        val handler = sensorHandler
        registered = gyro != null && manager != null && handler != null &&
            manager.registerListener(this, gyro, SensorManager.SENSOR_DELAY_GAME, handler)
        publish(active = true, gpsHardTurnCount = state.hardTurnCount)
    }

    private fun evaluateHardTurnChange(state: SafeDriveLiveState) {
        if (state.hardTurnCount <= previousHardTurnCount) {
            previousHardTurnCount = state.hardTurnCount
            return
        }
        val delta = (state.hardTurnCount - previousHardTurnCount).coerceAtMost(3)
        repeat(delta) {
            if (
                SafeDriveTurnFusionRule.corroborates(
                    hardTurnDetectedAtElapsedMs = state.elapsedMs,
                    gyroSignalAtElapsedMs = recentGyroTripElapsedMs,
                    gyroAngularRateDegPerSec = recentAngularRate,
                    gyroscopeAvailable = registered
                )
            ) corroboratedTurns++ else gpsOnlyTurns++
        }
        previousHardTurnCount = state.hardTurnCount
    }

    private fun endTrip(report: SafeDriveTripReport?) {
        if (registered) runCatching { sensorManager?.unregisterListener(this) }
        registered = false
        val context = appContext
        if (context != null && report != null && report.startedAtMs == tripStartedAtMs) {
            SafeDriveSensorFusionStore.save(
                context,
                SafeDriveSensorFusionSummary(
                    reportId = report.id,
                    startedAtMs = report.startedAtMs,
                    endedAtMs = report.endedAtMs,
                    gyroscopeAvailable = gyroscope != null,
                    gpsHardTurnCount = report.hardTurnCount,
                    gyroCorroboratedTurnCount = corroboratedTurns,
                    gpsOnlyTurnCount = gpsOnlyTurns,
                    peakAngularRateDegPerSec = peakAngularRate
                )
            )
        }
        tripStartedAtMs = 0L
        tripStartedSensorElapsedMs = 0L
        previousHardTurnCount = 0
        corroboratedTurns = 0
        gpsOnlyTurns = 0
        peakAngularRate = 0.0
        recentAngularRate = 0.0
        recentGyroTripElapsedMs = -1L
        publish(active = false, gpsHardTurnCount = 0)
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (!registered || event.sensor.type != Sensor.TYPE_GYROSCOPE || event.values.size < 3) return
        val radiansPerSecond = sqrt(
            event.values[0].toDouble() * event.values[0].toDouble() +
                event.values[1].toDouble() * event.values[1].toDouble() +
                event.values[2].toDouble() * event.values[2].toDouble()
        )
        val degreesPerSecond = radiansPerSecond * 180.0 / PI
        if (!degreesPerSecond.isFinite() || degreesPerSecond > 2_000.0) return
        val sensorElapsedMs = event.timestamp / 1_000_000L
        recentAngularRate = degreesPerSecond
        recentGyroTripElapsedMs = (sensorElapsedMs - tripStartedSensorElapsedMs).coerceAtLeast(0L)
        if (degreesPerSecond > peakAngularRate) peakAngularRate = degreesPerSecond
        publish(active = true, gpsHardTurnCount = SafeDriveRuntime.state.value.hardTurnCount)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit

    private fun publish(active: Boolean, gpsHardTurnCount: Int) {
        SafeDriveSensorFusionRuntime.update(
            SafeDriveSensorFusionState(
                active = active,
                gyroscopeAvailable = gyroscope != null,
                recentAngularRateDegPerSec = if (active) recentAngularRate else 0.0,
                peakAngularRateDegPerSec = if (active) peakAngularRate else 0.0,
                gpsHardTurnCount = gpsHardTurnCount,
                gyroCorroboratedTurnCount = if (active) corroboratedTurns else 0,
                gpsOnlyTurnCount = if (active) gpsOnlyTurns else 0
            )
        )
    }
}
