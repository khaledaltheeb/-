package org.healthrenewal.rawafid

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID
import kotlin.math.PI
import kotlin.math.asin
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Safe Drive deliberately stores aggregate trip telemetry rather than route traces.
 * The personal speed threshold is a user-defined alert threshold and MUST NOT be
 * presented as the legal speed limit of the road.
 */
data class SafeDriveConfig(
    val personalSpeedAlertKmh: Int = 120,
    val speedAlertAfterSeconds: Int = 300,
    val severeSpeedMarginKmh: Int = 30,
    val severeSpeedAfterSeconds: Int = 20,
    val harshAccelerationMps2: Double = 3.0,
    val harshBrakingMps2: Double = 3.5,
    val harshTurnDegPerSec: Double = 38.0,
    val maxLocationAccuracyM: Float = 35f,
    val maxSpeedAccuracyMps: Float = 4f,
    val shareLiveAlerts: Boolean = true,
    val shareTripReports: Boolean = true
) {
    fun normalized() = copy(
        personalSpeedAlertKmh = personalSpeedAlertKmh.coerceIn(50, 180),
        speedAlertAfterSeconds = speedAlertAfterSeconds.coerceIn(30, 900),
        severeSpeedMarginKmh = severeSpeedMarginKmh.coerceIn(10, 60),
        severeSpeedAfterSeconds = severeSpeedAfterSeconds.coerceIn(10, 120),
        harshAccelerationMps2 = harshAccelerationMps2.coerceIn(2.0, 6.0),
        harshBrakingMps2 = harshBrakingMps2.coerceIn(2.0, 7.0),
        harshTurnDegPerSec = harshTurnDegPerSec.coerceIn(20.0, 75.0),
        maxLocationAccuracyM = maxLocationAccuracyM.coerceIn(10f, 80f),
        maxSpeedAccuracyMps = maxSpeedAccuracyMps.coerceIn(1.5f, 8f)
    )
}

enum class SafeDriveEventType(val id: String, val label: String) {
    SPEEDING_PERSISTENT("speeding_persistent", "سرعة مرتفعة مستمرة"),
    SEVERE_SPEED("severe_speed", "سرعة مرتفعة جدًا"),
    HARSH_ACCELERATION("harsh_acceleration", "تسارع حاد"),
    HARSH_BRAKING("harsh_braking", "فرملة حادة"),
    HARD_TURN("hard_turn", "انعطاف حاد"),
    RISK_CLUSTER("risk_cluster", "تكرار مؤشرات خطورة")
}

data class SafeDriveEvent(
    val type: SafeDriveEventType,
    val wallTimeMs: Long,
    val speedKmh: Double,
    val accelerationMps2: Double,
    val note: String
)

data class SafeDriveSample(
    val wallTimeMs: Long,
    val elapsedMs: Long,
    val latitude: Double,
    val longitude: Double,
    val accuracyM: Float,
    val speedMps: Double?,
    val speedAccuracyMps: Float?,
    val bearingDegrees: Float?,
    val bearingAccuracyDegrees: Float?
)

data class SafeDriveLiveState(
    val active: Boolean = false,
    val startedAtMs: Long = 0L,
    val elapsedMs: Long = 0L,
    val currentSpeedKmh: Double = 0.0,
    val currentAccelerationMps2: Double = 0.0,
    val distanceKm: Double = 0.0,
    val maxSpeedKmh: Double = 0.0,
    val highSpeedDurationMs: Long = 0L,
    val harshAccelerationCount: Int = 0,
    val harshBrakingCount: Int = 0,
    val hardTurnCount: Int = 0,
    val severeSpeedCount: Int = 0,
    val riskClusterCount: Int = 0,
    val provisionalScore: Int = 100,
    val dataQuality: String = "جارٍ المعايرة",
    val statusMessage: String = "",
    val lastCompletedReport: SafeDriveTripReport? = null
)

data class SafeDriveTripReport(
    val id: String,
    val startedAtMs: Long,
    val endedAtMs: Long,
    val durationMs: Long,
    val distanceKm: Double,
    val averageSpeedKmh: Double,
    val maxSpeedKmh: Double,
    val personalSpeedAlertKmh: Int,
    val highSpeedDurationMs: Long,
    val harshAccelerationCount: Int,
    val harshBrakingCount: Int,
    val hardTurnCount: Int,
    val severeSpeedCount: Int,
    val riskClusterCount: Int,
    val score: Int,
    val riskLabel: String,
    val dataQuality: String,
    val acceptedSamples: Int,
    val rejectedSamples: Int,
    val events: List<SafeDriveEvent>
)

object SafeDriveScoring {
    fun score(
        highSpeedDurationMs: Long,
        maxSpeedKmh: Double,
        speedThresholdKmh: Int,
        harshAccelerationCount: Int,
        harshBrakingCount: Int,
        hardTurnCount: Int,
        severeSpeedCount: Int,
        riskClusterCount: Int
    ): Int {
        var penalty = 0.0
        val highSpeedMinutes = highSpeedDurationMs / 60_000.0
        penalty += min(35.0, highSpeedMinutes * 4.5)
        penalty += min(15.0, max(0.0, maxSpeedKmh - speedThresholdKmh) * 0.45)
        penalty += min(12.0, harshAccelerationCount * 2.5)
        penalty += min(16.0, harshBrakingCount * 3.5)
        penalty += min(12.0, hardTurnCount * 2.5)
        penalty += min(18.0, severeSpeedCount * 7.0)
        penalty += min(16.0, riskClusterCount * 6.0)
        return (100.0 - penalty).roundToInt().coerceIn(0, 100)
    }

    fun riskLabel(score: Int): String = when {
        score >= 90 -> "ممتازة"
        score >= 75 -> "مستقرة"
        score >= 60 -> "تحتاج انتباهًا"
        else -> "مؤشرات قيادة عالية الخطورة"
    }

    fun reportSummary(report: SafeDriveTripReport): String {
        val highSpeed = formatDuration(report.highSpeedDurationMs)
        return buildString {
            append("تقرير قيادة آمنة · ")
            append(formatDuration(report.durationMs))
            append("\nالمسافة: ")
            append(oneDecimal(report.distanceKm))
            append(" كم · أعلى سرعة: ")
            append(report.maxSpeedKmh.roundToInt())
            append(" كم/س")
            append("\nفوق حد التنبيه الشخصي (")
            append(report.personalSpeedAlertKmh)
            append(" كم/س): ")
            append(highSpeed)
            append("\nتسارع حاد: ")
            append(report.harshAccelerationCount)
            append(" · فرملة حادة: ")
            append(report.harshBrakingCount)
            append(" · انعطاف حاد: ")
            append(report.hardTurnCount)
            if (report.severeSpeedCount > 0 || report.riskClusterCount > 0) {
                append("\nتنبيهات عالية الخطورة: ")
                append(report.severeSpeedCount + report.riskClusterCount)
            }
            append("\nالتقييم: ")
            append(report.score)
            append("/100 — ")
            append(report.riskLabel)
            append("\nجودة القياس: ")
            append(report.dataQuality)
            append(". حد السرعة هنا حد تنبيه شخصي وليس حد الطريق القانوني.")
        }.take(1500)
    }

    fun alertSummary(event: SafeDriveEvent, score: Int): String = buildString {
        append("تنبيه قيادة آمنة: ")
        append(event.type.label)
        append(". السرعة المقدرة ")
        append(event.speedKmh.roundToInt())
        append(" كم/س")
        if (event.accelerationMps2 != 0.0) {
            append("، التسارع ")
            append(oneDecimal(event.accelerationMps2))
            append(" م/ث²")
        }
        append(". التقييم المؤقت ")
        append(score)
        append("/100. ")
        append(event.note)
    }.take(900)

    fun formatDuration(ms: Long): String {
        val totalMinutes = (ms.coerceAtLeast(0L) / 60_000L)
        val hours = totalMinutes / 60
        val minutes = totalMinutes % 60
        return when {
            hours > 0 -> "${hours}س ${minutes}د"
            totalMinutes > 0 -> "${totalMinutes}د"
            else -> "أقل من دقيقة"
        }
    }

    private fun oneDecimal(value: Double): String = String.format(java.util.Locale.US, "%.1f", value)
}

class SafeDriveAnalyzer(
    config: SafeDriveConfig,
    private val startedWallTimeMs: Long,
    private val startedElapsedMs: Long
) {
    private val config = config.normalized()
    private var previousSample: SafeDriveSample? = null
    private var filteredSpeedMps = 0.0
    private var currentAccelerationMps2 = 0.0
    private var distanceM = 0.0
    private var maxSpeedKmh = 0.0
    private var highSpeedDurationMs = 0L
    private var highSpeedEpisodeMs = 0L
    private var severeSpeedEpisodeMs = 0L
    private var highSpeedAlerted = false
    private var severeSpeedAlerted = false
    private var harshAccelerationCount = 0
    private var harshBrakingCount = 0
    private var hardTurnCount = 0
    private var severeSpeedCount = 0
    private var riskClusterCount = 0
    private var acceptedSamples = 0
    private var rejectedSamples = 0
    private var lastWallTimeMs = startedWallTimeMs
    private var lastElapsedMs = startedElapsedMs
    private val events = mutableListOf<SafeDriveEvent>()
    private val lastEventAt = mutableMapOf<SafeDriveEventType, Long>()
    private val recentHarshEvents = ArrayDeque<Long>()

    fun consume(sample: SafeDriveSample): List<SafeDriveEvent> {
        lastWallTimeMs = max(lastWallTimeMs, sample.wallTimeMs)
        lastElapsedMs = max(lastElapsedMs, sample.elapsedMs)
        if (!sample.latitude.isFinite() || !sample.longitude.isFinite() || sample.latitude !in -90.0..90.0 || sample.longitude !in -180.0..180.0) {
            rejectedSamples++
            return emptyList()
        }
        if (!sample.accuracyM.isFinite() || sample.accuracyM <= 0f || sample.accuracyM > config.maxLocationAccuracyM) {
            rejectedSamples++
            return emptyList()
        }

        val previous = previousSample
        if (previous == null) {
            previousSample = sample
            acceptedSamples++
            filteredSpeedMps = reliableSpeed(sample, null, 0.0, 0.0) ?: 0.0
            maxSpeedKmh = max(maxSpeedKmh, filteredSpeedMps * 3.6)
            return emptyList()
        }

        val dtSeconds = (sample.elapsedMs - previous.elapsedMs) / 1000.0
        if (dtSeconds <= 0.0) {
            rejectedSamples++
            return emptyList()
        }

        val segmentDistanceM = haversineMeters(previous.latitude, previous.longitude, sample.latitude, sample.longitude)
        if (dtSeconds <= 5.0 && segmentDistanceM > max(250.0, 90.0 * dtSeconds)) {
            rejectedSamples++
            previousSample = sample
            return emptyList()
        }

        val rawSpeed = reliableSpeed(sample, previous, dtSeconds, segmentDistanceM)
        if (rawSpeed == null) {
            rejectedSamples++
            previousSample = sample
            return emptyList()
        }

        acceptedSamples++
        if (dtSeconds <= 15.0 && segmentDistanceM <= 100.0 * dtSeconds + 100.0) {
            distanceM += segmentDistanceM
        }

        val previousFiltered = filteredSpeedMps
        filteredSpeedMps = if (acceptedSamples <= 2) rawSpeed else previousFiltered * 0.65 + rawSpeed * 0.35
        filteredSpeedMps = filteredSpeedMps.coerceIn(0.0, 75.0)
        val speedKmh = filteredSpeedMps * 3.6
        maxSpeedKmh = max(maxSpeedKmh, speedKmh)

        currentAccelerationMps2 = if (dtSeconds in 0.5..3.0) {
            ((filteredSpeedMps - previousFiltered) / dtSeconds).coerceIn(-12.0, 12.0)
        } else 0.0

        val generated = mutableListOf<SafeDriveEvent>()
        trackSpeeding(sample, dtSeconds, speedKmh, generated)
        trackHarshAcceleration(sample, speedKmh, generated)
        trackTurn(previous, sample, dtSeconds, speedKmh, generated)
        maybeEmitRiskCluster(sample, speedKmh, generated)

        previousSample = sample
        return generated
    }

    fun liveState(statusMessage: String = ""): SafeDriveLiveState {
        val elapsed = (lastElapsedMs - startedElapsedMs).coerceAtLeast(0L)
        val score = currentScore()
        return SafeDriveLiveState(
            active = true,
            startedAtMs = startedWallTimeMs,
            elapsedMs = elapsed,
            currentSpeedKmh = filteredSpeedMps * 3.6,
            currentAccelerationMps2 = currentAccelerationMps2,
            distanceKm = distanceM / 1000.0,
            maxSpeedKmh = maxSpeedKmh,
            highSpeedDurationMs = highSpeedDurationMs,
            harshAccelerationCount = harshAccelerationCount,
            harshBrakingCount = harshBrakingCount,
            hardTurnCount = hardTurnCount,
            severeSpeedCount = severeSpeedCount,
            riskClusterCount = riskClusterCount,
            provisionalScore = score,
            dataQuality = dataQuality(),
            statusMessage = statusMessage
        )
    }

    fun finish(endedAtMs: Long = lastWallTimeMs): SafeDriveTripReport {
        val end = max(endedAtMs, startedWallTimeMs)
        val duration = (end - startedWallTimeMs).coerceAtLeast(1L)
        val distanceKm = distanceM / 1000.0
        val averageSpeedKmh = if (duration > 0L) distanceKm / (duration / 3_600_000.0) else 0.0
        val score = currentScore()
        return SafeDriveTripReport(
            id = UUID.randomUUID().toString(),
            startedAtMs = startedWallTimeMs,
            endedAtMs = end,
            durationMs = duration,
            distanceKm = distanceKm,
            averageSpeedKmh = averageSpeedKmh.coerceIn(0.0, 250.0),
            maxSpeedKmh = maxSpeedKmh,
            personalSpeedAlertKmh = config.personalSpeedAlertKmh,
            highSpeedDurationMs = highSpeedDurationMs,
            harshAccelerationCount = harshAccelerationCount,
            harshBrakingCount = harshBrakingCount,
            hardTurnCount = hardTurnCount,
            severeSpeedCount = severeSpeedCount,
            riskClusterCount = riskClusterCount,
            score = score,
            riskLabel = SafeDriveScoring.riskLabel(score),
            dataQuality = dataQuality(),
            acceptedSamples = acceptedSamples,
            rejectedSamples = rejectedSamples,
            events = events.takeLast(50)
        )
    }

    private fun trackSpeeding(sample: SafeDriveSample, dtSeconds: Double, speedKmh: Double, generated: MutableList<SafeDriveEvent>) {
        val dtMs = (dtSeconds * 1000.0).toLong().coerceIn(0L, 15_000L)
        if (speedKmh >= config.personalSpeedAlertKmh) {
            highSpeedDurationMs += dtMs
            highSpeedEpisodeMs += dtMs
            if (!highSpeedAlerted && highSpeedEpisodeMs >= config.speedAlertAfterSeconds * 1000L) {
                highSpeedAlerted = true
                emit(
                    SafeDriveEventType.SPEEDING_PERSISTENT,
                    sample,
                    speedKmh,
                    "استمرت السرعة فوق حد التنبيه الشخصي لمدة ${SafeDriveScoring.formatDuration(highSpeedEpisodeMs)}.",
                    60_000L,
                    generated
                )
            }
        } else if (speedKmh <= config.personalSpeedAlertKmh - 5) {
            highSpeedEpisodeMs = 0L
            highSpeedAlerted = false
        }

        if (speedKmh >= config.personalSpeedAlertKmh + config.severeSpeedMarginKmh) {
            severeSpeedEpisodeMs += dtMs
            if (!severeSpeedAlerted && severeSpeedEpisodeMs >= config.severeSpeedAfterSeconds * 1000L) {
                severeSpeedAlerted = true
                severeSpeedCount++
                emit(
                    SafeDriveEventType.SEVERE_SPEED,
                    sample,
                    speedKmh,
                    "السرعة أعلى بكثير من حد التنبيه الشخصي. خفف السرعة عندما يكون ذلك آمنًا.",
                    60_000L,
                    generated
                )
            }
        } else if (speedKmh <= config.personalSpeedAlertKmh + config.severeSpeedMarginKmh - 10) {
            severeSpeedEpisodeMs = 0L
            severeSpeedAlerted = false
        }
    }

    private fun trackHarshAcceleration(sample: SafeDriveSample, speedKmh: Double, generated: MutableList<SafeDriveEvent>) {
        if (speedKmh < 15.0) return
        if (currentAccelerationMps2 >= config.harshAccelerationMps2) {
            if (canEmit(SafeDriveEventType.HARSH_ACCELERATION, sample.elapsedMs, 8_000L)) {
                harshAccelerationCount++
                rememberHarsh(sample.elapsedMs)
                emitNow(
                    SafeDriveEventType.HARSH_ACCELERATION,
                    sample,
                    speedKmh,
                    "تم رصد ارتفاع سريع في السرعة. القياس تقديري ويتأثر بجودة GPS.",
                    generated
                )
            }
        } else if (currentAccelerationMps2 <= -config.harshBrakingMps2) {
            if (canEmit(SafeDriveEventType.HARSH_BRAKING, sample.elapsedMs, 8_000L)) {
                harshBrakingCount++
                rememberHarsh(sample.elapsedMs)
                emitNow(
                    SafeDriveEventType.HARSH_BRAKING,
                    sample,
                    speedKmh,
                    "تم رصد انخفاض حاد في السرعة. القياس تقديري ويتأثر بجودة GPS.",
                    generated
                )
            }
        }
    }

    private fun trackTurn(previous: SafeDriveSample, sample: SafeDriveSample, dtSeconds: Double, speedKmh: Double, generated: MutableList<SafeDriveEvent>) {
        if (speedKmh < 25.0 || dtSeconds !in 0.5..3.0) return
        val b1 = previous.bearingDegrees ?: return
        val b2 = sample.bearingDegrees ?: return
        val accuracy = sample.bearingAccuracyDegrees
        if (accuracy != null && accuracy > 30f) return
        val delta = angularDifferenceDegrees(b1.toDouble(), b2.toDouble())
        val rate = delta / dtSeconds
        if (rate >= config.harshTurnDegPerSec && canEmit(SafeDriveEventType.HARD_TURN, sample.elapsedMs, 8_000L)) {
            hardTurnCount++
            rememberHarsh(sample.elapsedMs)
            emitNow(
                SafeDriveEventType.HARD_TURN,
                sample,
                speedKmh,
                "تم رصد تغير سريع في اتجاه الحركة أثناء السير. قد تتأثر النتيجة بجودة اتجاه GPS.",
                generated
            )
        }
    }

    private fun maybeEmitRiskCluster(sample: SafeDriveSample, speedKmh: Double, generated: MutableList<SafeDriveEvent>) {
        while (recentHarshEvents.isNotEmpty() && sample.elapsedMs - recentHarshEvents.first() > 5 * 60_000L) {
            recentHarshEvents.removeFirst()
        }
        if (recentHarshEvents.size >= 3 && canEmit(SafeDriveEventType.RISK_CLUSTER, sample.elapsedMs, 5 * 60_000L)) {
            riskClusterCount++
            emitNow(
                SafeDriveEventType.RISK_CLUSTER,
                sample,
                speedKmh,
                "تكررت مؤشرات تسارع أو فرملة أو انعطاف حاد خلال خمس دقائق. هذا تنبيه سلوكي تقديري وليس حكمًا قانونيًا على القيادة.",
                generated
            )
            recentHarshEvents.clear()
        }
    }

    private fun rememberHarsh(elapsedMs: Long) {
        recentHarshEvents.addLast(elapsedMs)
        while (recentHarshEvents.size > 12) recentHarshEvents.removeFirst()
    }

    private fun emit(
        type: SafeDriveEventType,
        sample: SafeDriveSample,
        speedKmh: Double,
        note: String,
        minGapMs: Long,
        generated: MutableList<SafeDriveEvent>
    ) {
        if (!canEmit(type, sample.elapsedMs, minGapMs)) return
        emitNow(type, sample, speedKmh, note, generated)
    }

    private fun emitNow(type: SafeDriveEventType, sample: SafeDriveSample, speedKmh: Double, note: String, generated: MutableList<SafeDriveEvent>) {
        lastEventAt[type] = sample.elapsedMs
        val event = SafeDriveEvent(type, sample.wallTimeMs, speedKmh, currentAccelerationMps2, note)
        events += event
        generated += event
    }

    private fun canEmit(type: SafeDriveEventType, elapsedMs: Long, minGapMs: Long): Boolean {
        val last = lastEventAt[type] ?: Long.MIN_VALUE / 2
        return elapsedMs - last >= minGapMs
    }

    private fun reliableSpeed(sample: SafeDriveSample, previous: SafeDriveSample?, dtSeconds: Double, distanceM: Double): Double? {
        val direct = sample.speedMps?.takeIf { speed ->
            speed.isFinite() && speed in 0.0..75.0 && (sample.speedAccuracyMps == null || sample.speedAccuracyMps <= config.maxSpeedAccuracyMps)
        }
        if (direct != null) return direct
        if (previous != null && dtSeconds in 0.5..4.0 && distanceM >= 0.0 && distanceM <= 90.0 * dtSeconds) {
            return (distanceM / dtSeconds).coerceIn(0.0, 75.0)
        }
        return null
    }

    private fun currentScore(): Int = SafeDriveScoring.score(
        highSpeedDurationMs = highSpeedDurationMs,
        maxSpeedKmh = maxSpeedKmh,
        speedThresholdKmh = config.personalSpeedAlertKmh,
        harshAccelerationCount = harshAccelerationCount,
        harshBrakingCount = harshBrakingCount,
        hardTurnCount = hardTurnCount,
        severeSpeedCount = severeSpeedCount,
        riskClusterCount = riskClusterCount
    )

    private fun dataQuality(): String {
        val total = acceptedSamples + rejectedSamples
        if (acceptedSamples < 5 || total < 6) return "جارٍ المعايرة"
        val rejectedRatio = rejectedSamples.toDouble() / total.toDouble()
        return when {
            rejectedRatio <= 0.15 -> "جيدة"
            rejectedRatio <= 0.35 -> "متوسطة"
            else -> "ضعيفة"
        }
    }

    companion object {
        internal fun angularDifferenceDegrees(a: Double, b: Double): Double {
            val diff = ((b - a + 540.0) % 360.0) - 180.0
            return kotlin.math.abs(diff)
        }

        internal fun haversineMeters(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
            val earthRadiusM = 6_371_000.0
            val phi1 = lat1 * PI / 180.0
            val phi2 = lat2 * PI / 180.0
            val dPhi = (lat2 - lat1) * PI / 180.0
            val dLambda = (lon2 - lon1) * PI / 180.0
            val h = sin(dPhi / 2.0) * sin(dPhi / 2.0) + cos(phi1) * cos(phi2) * sin(dLambda / 2.0) * sin(dLambda / 2.0)
            return 2.0 * earthRadiusM * asin(min(1.0, sqrt(h)))
        }
    }
}

object SafeDriveStore {
    private const val CONFIG_KEY = "safe_drive_config_v1"
    private const val REPORTS_KEY = "safe_drive_reports_v1"
    private const val MAX_REPORTS = 120

    fun config(context: Context): SafeDriveConfig {
        val raw = EncryptedLocalStore.get(context, CONFIG_KEY) ?: return SafeDriveConfig()
        return runCatching {
            val o = JSONObject(raw)
            SafeDriveConfig(
                personalSpeedAlertKmh = o.optInt("personal_speed_alert_kmh", 120),
                speedAlertAfterSeconds = o.optInt("speed_alert_after_seconds", 300),
                severeSpeedMarginKmh = o.optInt("severe_speed_margin_kmh", 30),
                severeSpeedAfterSeconds = o.optInt("severe_speed_after_seconds", 20),
                harshAccelerationMps2 = o.optDouble("harsh_acceleration_mps2", 3.0),
                harshBrakingMps2 = o.optDouble("harsh_braking_mps2", 3.5),
                harshTurnDegPerSec = o.optDouble("harsh_turn_deg_per_sec", 38.0),
                maxLocationAccuracyM = o.optDouble("max_location_accuracy_m", 35.0).toFloat(),
                maxSpeedAccuracyMps = o.optDouble("max_speed_accuracy_mps", 4.0).toFloat(),
                shareLiveAlerts = o.optBoolean("share_live_alerts", true),
                shareTripReports = o.optBoolean("share_trip_reports", true)
            ).normalized()
        }.getOrDefault(SafeDriveConfig())
    }

    fun saveConfig(context: Context, value: SafeDriveConfig) {
        val v = value.normalized()
        val o = JSONObject()
            .put("personal_speed_alert_kmh", v.personalSpeedAlertKmh)
            .put("speed_alert_after_seconds", v.speedAlertAfterSeconds)
            .put("severe_speed_margin_kmh", v.severeSpeedMarginKmh)
            .put("severe_speed_after_seconds", v.severeSpeedAfterSeconds)
            .put("harsh_acceleration_mps2", v.harshAccelerationMps2)
            .put("harsh_braking_mps2", v.harshBrakingMps2)
            .put("harsh_turn_deg_per_sec", v.harshTurnDegPerSec)
            .put("max_location_accuracy_m", v.maxLocationAccuracyM.toDouble())
            .put("max_speed_accuracy_mps", v.maxSpeedAccuracyMps.toDouble())
            .put("share_live_alerts", v.shareLiveAlerts)
            .put("share_trip_reports", v.shareTripReports)
        EncryptedLocalStore.put(context, CONFIG_KEY, o.toString())
    }

    fun reports(context: Context): List<SafeDriveTripReport> {
        val raw = EncryptedLocalStore.get(context, REPORTS_KEY) ?: return emptyList()
        return runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    parseReport(o)?.let(::add)
                }
            }.sortedByDescending { it.endedAtMs }
        }.getOrDefault(emptyList())
    }

    fun addReport(context: Context, report: SafeDriveTripReport) {
        val next = (listOf(report) + reports(context).filterNot { it.id == report.id })
            .sortedByDescending { it.endedAtMs }
            .take(MAX_REPORTS)
        val a = JSONArray()
        next.forEach { a.put(reportJson(it)) }
        EncryptedLocalStore.put(context, REPORTS_KEY, a.toString())
    }

    fun clearReports(context: Context) = EncryptedLocalStore.remove(context, REPORTS_KEY)

    private fun reportJson(report: SafeDriveTripReport): JSONObject {
        val events = JSONArray()
        report.events.takeLast(50).forEach { event ->
            events.put(
                JSONObject()
                    .put("type", event.type.id)
                    .put("wall_time_ms", event.wallTimeMs)
                    .put("speed_kmh", event.speedKmh)
                    .put("acceleration_mps2", event.accelerationMps2)
                    .put("note", event.note.take(500))
            )
        }
        return JSONObject()
            .put("id", report.id)
            .put("started_at_ms", report.startedAtMs)
            .put("ended_at_ms", report.endedAtMs)
            .put("duration_ms", report.durationMs)
            .put("distance_km", report.distanceKm)
            .put("average_speed_kmh", report.averageSpeedKmh)
            .put("max_speed_kmh", report.maxSpeedKmh)
            .put("personal_speed_alert_kmh", report.personalSpeedAlertKmh)
            .put("high_speed_duration_ms", report.highSpeedDurationMs)
            .put("harsh_acceleration_count", report.harshAccelerationCount)
            .put("harsh_braking_count", report.harshBrakingCount)
            .put("hard_turn_count", report.hardTurnCount)
            .put("severe_speed_count", report.severeSpeedCount)
            .put("risk_cluster_count", report.riskClusterCount)
            .put("score", report.score)
            .put("risk_label", report.riskLabel)
            .put("data_quality", report.dataQuality)
            .put("accepted_samples", report.acceptedSamples)
            .put("rejected_samples", report.rejectedSamples)
            .put("events", events)
    }

    private fun parseReport(o: JSONObject): SafeDriveTripReport? = runCatching {
        val eventsJson = o.optJSONArray("events") ?: JSONArray()
        val events = buildList {
            for (i in 0 until eventsJson.length()) {
                val event = eventsJson.optJSONObject(i) ?: continue
                val type = SafeDriveEventType.entries.firstOrNull { it.id == event.optString("type") } ?: continue
                add(
                    SafeDriveEvent(
                        type = type,
                        wallTimeMs = event.optLong("wall_time_ms"),
                        speedKmh = event.optDouble("speed_kmh"),
                        accelerationMps2 = event.optDouble("acceleration_mps2"),
                        note = event.optString("note")
                    )
                )
            }
        }
        val score = o.optInt("score", 100).coerceIn(0, 100)
        SafeDriveTripReport(
            id = o.optString("id").ifBlank { UUID.randomUUID().toString() },
            startedAtMs = o.optLong("started_at_ms"),
            endedAtMs = o.optLong("ended_at_ms"),
            durationMs = o.optLong("duration_ms"),
            distanceKm = o.optDouble("distance_km"),
            averageSpeedKmh = o.optDouble("average_speed_kmh"),
            maxSpeedKmh = o.optDouble("max_speed_kmh"),
            personalSpeedAlertKmh = o.optInt("personal_speed_alert_kmh", 120),
            highSpeedDurationMs = o.optLong("high_speed_duration_ms"),
            harshAccelerationCount = o.optInt("harsh_acceleration_count"),
            harshBrakingCount = o.optInt("harsh_braking_count"),
            hardTurnCount = o.optInt("hard_turn_count"),
            severeSpeedCount = o.optInt("severe_speed_count"),
            riskClusterCount = o.optInt("risk_cluster_count"),
            score = score,
            riskLabel = o.optString("risk_label").ifBlank { SafeDriveScoring.riskLabel(score) },
            dataQuality = o.optString("data_quality", "غير معروفة"),
            acceptedSamples = o.optInt("accepted_samples"),
            rejectedSamples = o.optInt("rejected_samples"),
            events = events
        )
    }.getOrNull()
}