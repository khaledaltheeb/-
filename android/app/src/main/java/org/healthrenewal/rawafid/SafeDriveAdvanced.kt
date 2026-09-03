package org.healthrenewal.rawafid

import android.content.Context
import android.os.SystemClock
import android.speech.tts.TextToSpeech
import org.json.JSONObject
import java.time.Instant
import java.time.ZoneId
import java.util.Locale
import kotlin.math.roundToInt

data class SafeDriveAdvancedConfig(
    val autoDetectionEnabled: Boolean = false,
    val spokenAlertsEnabled: Boolean = false,
    val reduceDistractionEnabled: Boolean = true,
    val restReminderMinutes: Int = 120,
    val newDriverMode: Boolean = false,
    val nightGuardEnabled: Boolean = true,
    val arrivalPromptOnTripEnd: Boolean = true
) {
    fun normalized() = copy(restReminderMinutes = restReminderMinutes.coerceIn(60, 240))
}

object SafeDriveAdvancedStore {
    private const val CONFIG_KEY = "rawafid_safe_drive_advanced_config_v1"
    private const val PASSENGER_SUPPRESS_KEY = "rawafid_safe_drive_passenger_until_v1"

    fun config(context: Context): SafeDriveAdvancedConfig {
        val raw = EncryptedLocalStore.get(context, CONFIG_KEY) ?: return SafeDriveAdvancedConfig()
        return runCatching {
            val o = JSONObject(raw)
            SafeDriveAdvancedConfig(
                autoDetectionEnabled = o.optBoolean("auto_detection", false),
                spokenAlertsEnabled = o.optBoolean("spoken_alerts", false),
                reduceDistractionEnabled = o.optBoolean("reduce_distraction", true),
                restReminderMinutes = o.optInt("rest_minutes", 120),
                newDriverMode = o.optBoolean("new_driver", false),
                nightGuardEnabled = o.optBoolean("night_guard", true),
                arrivalPromptOnTripEnd = o.optBoolean("arrival_prompt", true)
            ).normalized()
        }.getOrDefault(SafeDriveAdvancedConfig())
    }

    fun save(context: Context, config: SafeDriveAdvancedConfig) {
        val normalized = config.normalized()
        EncryptedLocalStore.put(
            context,
            CONFIG_KEY,
            JSONObject()
                .put("auto_detection", normalized.autoDetectionEnabled)
                .put("spoken_alerts", normalized.spokenAlertsEnabled)
                .put("reduce_distraction", normalized.reduceDistractionEnabled)
                .put("rest_minutes", normalized.restReminderMinutes)
                .put("new_driver", normalized.newDriverMode)
                .put("night_guard", normalized.nightGuardEnabled)
                .put("arrival_prompt", normalized.arrivalPromptOnTripEnd)
                .toString()
        )
    }

    fun suppressAsPassenger(context: Context, durationMs: Long = 2 * 60 * 60_000L) {
        EncryptedLocalStore.put(
            context,
            PASSENGER_SUPPRESS_KEY,
            (System.currentTimeMillis() + durationMs.coerceIn(15 * 60_000L, 8 * 60 * 60_000L)).toString()
        )
    }

    fun clearPassengerSuppression(context: Context) = EncryptedLocalStore.remove(context, PASSENGER_SUPPRESS_KEY)

    fun passengerSuppressed(context: Context): Boolean =
        EncryptedLocalStore.get(context, PASSENGER_SUPPRESS_KEY)?.toLongOrNull()?.let { it > System.currentTimeMillis() } == true
}

data class SafeDriveWeeklySummary(
    val trips: Int,
    val distanceKm: Double,
    val durationMs: Long,
    val averageScore: Int?,
    val harshEventsPer100Km: Double?,
    val previousAverageScore: Int?,
    val previousHarshEventsPer100Km: Double?,
    val trend: String
) {
    fun shareText(): String = buildString {
        append("روافد · ملخص القيادة الآمنة لآخر 7 أيام\n")
        append("الرحلات: $trips · المسافة: ${oneDecimal(distanceKm)} كم · المدة: ${SafeDriveScoring.formatDuration(durationMs)}\n")
        averageScore?.let { append("متوسط التقييم: $it/100\n") }
        harshEventsPer100Km?.let { append("مؤشرات الحركة الحادة لكل 100 كم: ${oneDecimal(it)}\n") }
        append(trend)
        append("\nالقياسات تقديرية من الهاتف ولا تمثل حكمًا قانونيًا على القيادة.")
    }

    private fun oneDecimal(value: Double) = String.format(Locale.US, "%.1f", value)
}

object SafeDriveWeeklyAnalytics {
    private const val WEEK_MS = 7L * 24 * 60 * 60_000L

    fun summarize(reports: List<SafeDriveTripReport>, nowMs: Long = System.currentTimeMillis()): SafeDriveWeeklySummary {
        val current = reports.filter { it.startedAtMs in (nowMs - WEEK_MS)..nowMs }
        val previous = reports.filter { it.startedAtMs in (nowMs - 2 * WEEK_MS) until (nowMs - WEEK_MS) }
        val currentScore = current.takeIf { it.isNotEmpty() }?.map { it.score }?.average()?.roundToInt()
        val previousScore = previous.takeIf { it.isNotEmpty() }?.map { it.score }?.average()?.roundToInt()
        val currentRate = harshRate(current)
        val previousRate = harshRate(previous)
        val trend = when {
            current.size < 2 || current.sumOf { it.distanceKm } < 10.0 -> "نحتاج رحلات أكثر قبل إصدار مقارنة أسبوعية موثوقة."
            previous.size < 2 || previous.sumOf { it.distanceKm } < 10.0 -> "هذا أول أسبوع تتوفر فيه بيانات كافية للمقارنة القادمة."
            currentScore != null && previousScore != null && currentScore >= previousScore + 5 -> "تحسن متوسط تقييم القيادة مقارنة بالأسبوع السابق."
            currentScore != null && previousScore != null && currentScore <= previousScore - 5 -> "انخفض متوسط التقييم مقارنة بالأسبوع السابق؛ راجع أسباب التنبيهات بدل الاعتماد على الدرجة وحدها."
            currentRate != null && previousRate != null && currentRate <= previousRate * 0.8 -> "انخفض معدل مؤشرات الحركة الحادة مقارنة بالأسبوع السابق."
            currentRate != null && previousRate != null && currentRate >= previousRate * 1.2 -> "ارتفع معدل مؤشرات الحركة الحادة مقارنة بالأسبوع السابق."
            else -> "أداء القيادة قريب من الأسبوع السابق دون تغير كبير."
        }
        return SafeDriveWeeklySummary(
            trips = current.size,
            distanceKm = current.sumOf { it.distanceKm },
            durationMs = current.sumOf { it.durationMs },
            averageScore = currentScore,
            harshEventsPer100Km = currentRate,
            previousAverageScore = previousScore,
            previousHarshEventsPer100Km = previousRate,
            trend = trend
        )
    }

    private fun harshRate(reports: List<SafeDriveTripReport>): Double? {
        val distance = reports.sumOf { it.distanceKm }
        if (distance < 1.0) return null
        val events = reports.sumOf { it.harshAccelerationCount + it.harshBrakingCount + it.hardTurnCount }
        return events * 100.0 / distance
    }
}

object SafeDriveAdvancedPolicy {
    fun isNightTime(wallTimeMs: Long): Boolean {
        val hour = Instant.ofEpochMilli(wallTimeMs).atZone(ZoneId.systemDefault()).hour
        return hour >= 22 || hour < 5
    }

    fun effectiveRestMinutes(config: SafeDriveAdvancedConfig, wallTimeMs: Long): Int {
        var minutes = config.restReminderMinutes
        if (config.newDriverMode) minutes = minOf(minutes, 90)
        if (config.nightGuardEnabled && isNightTime(wallTimeMs)) minutes = minOf(minutes, 90)
        return minutes.coerceIn(60, 240)
    }

    fun spokenEvent(event: SafeDriveEvent, newDriverMode: Boolean): String? = when (event.type) {
        SafeDriveEventType.SPEEDING_PERSISTENT -> "تنبيه. استمرت السرعة فوق حدك الشخصي. خفف السرعة عندما يكون ذلك آمنًا."
        SafeDriveEventType.SEVERE_SPEED -> "تنبيه. السرعة مرتفعة جدًا مقارنة بحدك الشخصي. خفف السرعة بأمان."
        SafeDriveEventType.RISK_CLUSTER -> "تنبيه. تكررت مؤشرات قيادة حادة خلال وقت قصير. قد بهدوء."
        SafeDriveEventType.HARSH_BRAKING -> if (newDriverMode) "فرملة حادة. اترك مسافة أمان أكبر." else null
        SafeDriveEventType.HARSH_ACCELERATION -> if (newDriverMode) "تسارع حاد. زد السرعة تدريجيًا." else null
        SafeDriveEventType.HARD_TURN -> if (newDriverMode) "انعطاف حاد. خفف السرعة قبل المنعطف." else null
    }
}

class SafeDriveVoiceCoach(context: Context, private val enabled: Boolean) : TextToSpeech.OnInitListener {
    private val engine = TextToSpeech(context.applicationContext, this)
    @Volatile private var ready = false

    override fun onInit(status: Int) {
        if (!enabled || status != TextToSpeech.SUCCESS) return
        val arabic = Locale("ar")
        val result = engine.setLanguage(arabic)
        ready = result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED
    }

    fun speak(text: String) {
        if (!enabled || !ready || text.isBlank()) return
        engine.speak(text.take(180), TextToSpeech.QUEUE_FLUSH, null, "safe_drive_${SystemClock.elapsedRealtime()}")
    }

    fun shutdown() {
        runCatching { engine.stop() }
        runCatching { engine.shutdown() }
        ready = false
    }
}
