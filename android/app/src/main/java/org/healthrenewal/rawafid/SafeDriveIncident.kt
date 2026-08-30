package org.healthrenewal.rawafid

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID
import kotlin.math.max
import kotlin.math.min

/**
 * A suspected sudden stop is intentionally conservative: a large speed drop
 * must end near a stop, and it must be supported by hard deceleration or a
 * recent accelerometer impact. This reduces false alerts from GPS jumps.
 */
data class SafeDriveIncidentConfig(
    val enabled: Boolean = true,
    val responseSeconds: Int = 45,
    val autoEscalateIfUnanswered: Boolean = false,
    val minimumPreStopSpeedKmh: Double = 35.0,
    val minimumSpeedDropKmh: Double = 25.0,
    val stoppedSpeedKmh: Double = 8.0,
    val hardDecelerationMps2: Double = 4.5,
    val impactThresholdG: Double = 2.4
) {
    fun normalized() = copy(
        responseSeconds = responseSeconds.coerceIn(20, 120),
        minimumPreStopSpeedKmh = minimumPreStopSpeedKmh.coerceIn(25.0, 80.0),
        minimumSpeedDropKmh = minimumSpeedDropKmh.coerceIn(18.0, 60.0),
        stoppedSpeedKmh = stoppedSpeedKmh.coerceIn(3.0, 15.0),
        hardDecelerationMps2 = hardDecelerationMps2.coerceIn(3.5, 8.0),
        impactThresholdG = impactThresholdG.coerceIn(1.8, 4.5)
    )
}

data class SafeDriveIncidentCandidate(
    val id: String = UUID.randomUUID().toString(),
    val detectedAtMs: Long,
    val elapsedMs: Long,
    val latitude: Double,
    val longitude: Double,
    val accuracyM: Float,
    val preStopSpeedKmh: Double,
    val currentSpeedKmh: Double,
    val decelerationMps2: Double,
    val peakImpactG: Double,
    val reason: String
)

enum class SafeDriveIncidentOutcome(val id: String) {
    SAFE_CONFIRMED("safe_confirmed"),
    HELP_REQUESTED("help_requested"),
    AUTO_ESCALATED("auto_escalated")
}

data class SafeDriveIncidentRecord(
    val id: String,
    val detectedAtMs: Long,
    val resolvedAtMs: Long,
    val outcome: SafeDriveIncidentOutcome,
    val preStopSpeedKmh: Double,
    val decelerationMps2: Double,
    val peakImpactG: Double,
    val note: String
)

class SafeDriveIncidentDetector(config: SafeDriveIncidentConfig) {
    private val config = config.normalized()
    private data class SpeedPoint(val elapsedMs: Long, val speedKmh: Double)
    private val speedWindow = ArrayDeque<SpeedPoint>()
    private var peakImpactG = 0.0
    private var impactAtElapsedMs = Long.MIN_VALUE / 2
    private var strongestRecentDecelerationMps2 = 0.0
    private var decelerationAtElapsedMs = Long.MIN_VALUE / 2
    private var lastCandidateElapsedMs = Long.MIN_VALUE / 2

    fun recordImpact(elapsedMs: Long, magnitudeG: Double) {
        if (!magnitudeG.isFinite()) return
        if (magnitudeG >= peakImpactG || elapsedMs - impactAtElapsedMs > 5_000L) {
            peakImpactG = magnitudeG.coerceIn(0.0, 10.0)
            impactAtElapsedMs = elapsedMs
        }
    }

    fun consume(
        sample: SafeDriveSample,
        currentSpeedKmh: Double,
        currentAccelerationMps2: Double
    ): SafeDriveIncidentCandidate? {
        if (!config.enabled || !currentSpeedKmh.isFinite() || !currentAccelerationMps2.isFinite()) return null

        if (sample.elapsedMs - decelerationAtElapsedMs > 5_000L) {
            strongestRecentDecelerationMps2 = 0.0
            decelerationAtElapsedMs = Long.MIN_VALUE / 2
        }
        if (currentAccelerationMps2 < strongestRecentDecelerationMps2) {
            strongestRecentDecelerationMps2 = currentAccelerationMps2.coerceAtLeast(-15.0)
            decelerationAtElapsedMs = sample.elapsedMs
        }

        speedWindow.addLast(SpeedPoint(sample.elapsedMs, currentSpeedKmh.coerceAtLeast(0.0)))
        while (speedWindow.isNotEmpty() && sample.elapsedMs - speedWindow.first().elapsedMs > 6_000L) {
            speedWindow.removeFirst()
        }
        if (sample.elapsedMs - lastCandidateElapsedMs < 120_000L) return null
        if (currentSpeedKmh > config.stoppedSpeedKmh) return null

        val preStop = speedWindow.maxOfOrNull { it.speedKmh } ?: return null
        val drop = preStop - currentSpeedKmh
        if (preStop < config.minimumPreStopSpeedKmh || drop < config.minimumSpeedDropKmh) return null

        val impactIsRecent = sample.elapsedMs - impactAtElapsedMs in 0L..5_000L
        val decelerationIsRecent = sample.elapsedMs - decelerationAtElapsedMs in 0L..5_000L
        val relevantDeceleration = if (decelerationIsRecent) min(currentAccelerationMps2, strongestRecentDecelerationMps2) else currentAccelerationMps2
        val hardDeceleration = relevantDeceleration <= -config.hardDecelerationMps2
        val impactSupports = impactIsRecent && peakImpactG >= config.impactThresholdG
        if (!hardDeceleration && !impactSupports) return null

        lastCandidateElapsedMs = sample.elapsedMs
        val reason = when {
            hardDeceleration && impactSupports -> "توقف سريع مع تباطؤ حاد وإشارة صدمة من الهاتف"
            hardDeceleration -> "توقف سريع بعد تباطؤ حاد"
            else -> "توقف سريع مع إشارة صدمة من الهاتف"
        }
        val candidate = SafeDriveIncidentCandidate(
            detectedAtMs = sample.wallTimeMs,
            elapsedMs = sample.elapsedMs,
            latitude = sample.latitude,
            longitude = sample.longitude,
            accuracyM = sample.accuracyM,
            preStopSpeedKmh = preStop,
            currentSpeedKmh = currentSpeedKmh,
            decelerationMps2 = relevantDeceleration,
            peakImpactG = if (impactIsRecent) peakImpactG else 0.0,
            reason = reason
        )
        peakImpactG = 0.0
        impactAtElapsedMs = Long.MIN_VALUE / 2
        strongestRecentDecelerationMps2 = 0.0
        decelerationAtElapsedMs = Long.MIN_VALUE / 2
        return candidate
    }
}

object SafeDriveIncidentStore {
    private const val CONFIG_KEY = "safe_drive_incident_config_v1"
    private const val RECORDS_KEY = "safe_drive_incident_records_v1"
    private const val MAX_RECORDS = 120

    fun config(context: Context): SafeDriveIncidentConfig {
        val raw = EncryptedLocalStore.get(context, CONFIG_KEY) ?: return SafeDriveIncidentConfig()
        return runCatching {
            val o = JSONObject(raw)
            SafeDriveIncidentConfig(
                enabled = o.optBoolean("enabled", true),
                responseSeconds = o.optInt("response_seconds", 45),
                autoEscalateIfUnanswered = o.optBoolean("auto_escalate_unanswered", false),
                minimumPreStopSpeedKmh = o.optDouble("minimum_pre_stop_speed_kmh", 35.0),
                minimumSpeedDropKmh = o.optDouble("minimum_speed_drop_kmh", 25.0),
                stoppedSpeedKmh = o.optDouble("stopped_speed_kmh", 8.0),
                hardDecelerationMps2 = o.optDouble("hard_deceleration_mps2", 4.5),
                impactThresholdG = o.optDouble("impact_threshold_g", 2.4)
            ).normalized()
        }.getOrDefault(SafeDriveIncidentConfig())
    }

    fun saveConfig(context: Context, config: SafeDriveIncidentConfig) {
        val v = config.normalized()
        EncryptedLocalStore.put(
            context,
            CONFIG_KEY,
            JSONObject()
                .put("enabled", v.enabled)
                .put("response_seconds", v.responseSeconds)
                .put("auto_escalate_unanswered", v.autoEscalateIfUnanswered)
                .put("minimum_pre_stop_speed_kmh", v.minimumPreStopSpeedKmh)
                .put("minimum_speed_drop_kmh", v.minimumSpeedDropKmh)
                .put("stopped_speed_kmh", v.stoppedSpeedKmh)
                .put("hard_deceleration_mps2", v.hardDecelerationMps2)
                .put("impact_threshold_g", v.impactThresholdG)
                .toString()
        )
    }

    fun add(context: Context, candidate: SafeDriveIncidentCandidate, outcome: SafeDriveIncidentOutcome, note: String) {
        val record = SafeDriveIncidentRecord(
            id = candidate.id,
            detectedAtMs = candidate.detectedAtMs,
            resolvedAtMs = System.currentTimeMillis(),
            outcome = outcome,
            preStopSpeedKmh = candidate.preStopSpeedKmh,
            decelerationMps2 = candidate.decelerationMps2,
            peakImpactG = candidate.peakImpactG,
            note = note.take(500)
        )
        val records = (listOf(record) + records(context).filterNot { it.id == record.id })
            .sortedByDescending { it.detectedAtMs }
            .take(MAX_RECORDS)
        val a = JSONArray()
        records.forEach { item ->
            a.put(
                JSONObject()
                    .put("id", item.id)
                    .put("detected_at_ms", item.detectedAtMs)
                    .put("resolved_at_ms", item.resolvedAtMs)
                    .put("outcome", item.outcome.id)
                    .put("pre_stop_speed_kmh", item.preStopSpeedKmh)
                    .put("deceleration_mps2", item.decelerationMps2)
                    .put("peak_impact_g", item.peakImpactG)
                    .put("note", item.note)
            )
        }
        EncryptedLocalStore.put(context, RECORDS_KEY, a.toString())
    }

    fun records(context: Context): List<SafeDriveIncidentRecord> {
        val raw = EncryptedLocalStore.get(context, RECORDS_KEY) ?: return emptyList()
        return runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    val outcome = SafeDriveIncidentOutcome.entries.firstOrNull { it.id == o.optString("outcome") } ?: continue
                    add(
                        SafeDriveIncidentRecord(
                            id = o.optString("id"),
                            detectedAtMs = o.optLong("detected_at_ms"),
                            resolvedAtMs = o.optLong("resolved_at_ms"),
                            outcome = outcome,
                            preStopSpeedKmh = o.optDouble("pre_stop_speed_kmh"),
                            decelerationMps2 = o.optDouble("deceleration_mps2"),
                            peakImpactG = max(0.0, o.optDouble("peak_impact_g")),
                            note = o.optString("note")
                        )
                    )
                }
            }.sortedByDescending { it.detectedAtMs }
        }.getOrDefault(emptyList())
    }
}
