package org.healthrenewal.rawafid

import android.content.Context
import android.util.Base64
import java.io.ByteArrayInputStream
import java.io.BufferedReader
import java.io.InputStreamReader
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.concurrent.ConcurrentHashMap
import java.util.zip.GZIPInputStream
import kotlin.math.absoluteValue

private data class RafiqaAssetMessage(
    val id: String,
    val category: String,
    val text: String,
    val semanticFamily: String,
    val openerFamily: String,
    val coreFamily: String,
    val actionFamily: String,
    val tone: String,
    val timeWindow: String,
    val cycleContext: String,
    val safetyTag: String,
    val lockscreenSafe: Boolean,
    val cooldownExactDays: Int,
    val cooldownSemanticDays: Int,
    val cooldownOpenerDays: Int,
    val cooldownCoreDays: Int,
    val cooldownActionDays: Int
)

/** Offline reader for the canonical 12,000-message Rafiqa bank. */
object RafiqaAssetBank {
    private const val HISTORY_PREFS = "rawafid_rafiqa_asset_history_v2"
    private const val EXPECTED_PER_CATEGORY = 1000
    private const val PARTS_PER_CATEGORY = 4

    val categories = listOf(
        "confidence", "hard_day", "personal_checkin", "self_care",
        "morning", "midday", "evening", "boundaries",
        "setback", "achievement", "cycle", "low_confidence"
    )
    private val cache = ConcurrentHashMap<String, List<RafiqaAssetMessage>>()

    fun next(context: Context, tags: Set<String>): CompanionMessage? {
        val category = chooseCategory(tags)
        val messages = loadCategory(context, category)
        if (messages.isEmpty()) return null
        val now = System.currentTimeMillis()
        val profile = WomenProfileStore.load(context)
        val history = context.getSharedPreferences(HISTORY_PREFS, Context.MODE_PRIVATE)
        val window = currentTimeWindow()
        val safe = messages.filter { timeMatches(it.timeWindow, window) && healthAllowed(it, profile, tags) }
            .ifEmpty { messages.filter { healthAllowed(it, profile, tags) } }
        if (safe.isEmpty()) return null
        val pool = safe.filter { offCooldown(history, it, now) }.ifEmpty { safe }
        val seed = (LocalDate.now().dayOfYear * 10000 + LocalDateTime.now().hour * 271 + LocalDateTime.now().minute * 13 + category.hashCode()).absoluteValue
        val chosen = pool[seed % pool.size]
        record(history, chosen, now)
        return CompanionMessage("asset:${chosen.id}", tags + chosen.category + chosen.tone, chosen.text)
    }

    fun nextLockscreenSafe(context: Context, tags: Set<String>): CompanionMessage? {
        val category = chooseCategory(tags)
        val profile = WomenProfileStore.load(context)
        val now = System.currentTimeMillis()
        val history = context.getSharedPreferences(HISTORY_PREFS, Context.MODE_PRIVATE)
        val window = currentTimeWindow()
        val safe = loadCategory(context, category).filter {
            it.lockscreenSafe && timeMatches(it.timeWindow, window) && healthAllowed(it, profile, tags)
        }
        if (safe.isEmpty()) return null
        val pool = safe.filter { offCooldown(history, it, now) }.ifEmpty { safe }
        val seed = (System.currentTimeMillis() / 60000L + category.hashCode()).absoluteValue
        val chosen = pool[(seed % pool.size).toInt()]
        record(history, chosen, now)
        return CompanionMessage("asset:${chosen.id}", tags + chosen.category + chosen.tone, chosen.text)
    }

    fun availableCategories(context: Context): Set<String> = categories.filterTo(mutableSetOf()) { hasAsset(context, it) }
    fun totalBundledMessages(context: Context): Int = categories.sumOf { loadCategory(context, it).size }
    fun categoryCount(context: Context, category: String): Int = loadCategory(context, category).size
    fun isComplete(context: Context): Boolean = categories.all { loadCategory(context, it).size == EXPECTED_PER_CATEGORY }

    private fun hasAsset(context: Context, category: String): Boolean =
        runCatching { context.assets.open(singlePath(category)).close(); true }.getOrDefault(false) || hasAllParts(context, category)

    private fun hasAllParts(context: Context, category: String): Boolean = (0 until PARTS_PER_CATEGORY).all { index ->
        runCatching { context.assets.open(partPath(category, index)).close(); true }.getOrDefault(false)
    }

    private fun loadCategory(context: Context, category: String): List<RafiqaAssetMessage> = cache.getOrPut(category) {
        val encoded = readSingle(context, category) ?: readParts(context, category) ?: return@getOrPut emptyList()
        runCatching {
            val compressed = Base64.decode(encoded, Base64.DEFAULT)
            GZIPInputStream(ByteArrayInputStream(compressed)).use { gzip ->
                BufferedReader(InputStreamReader(gzip, Charsets.UTF_8)).useLines { lines -> lines.mapNotNull(::parseTsv).toList() }
            }
        }.getOrDefault(emptyList())
    }

    private fun readSingle(context: Context, category: String): String? = runCatching {
        context.assets.open(singlePath(category)).bufferedReader(Charsets.US_ASCII).use { it.readText().trim() }
    }.getOrNull()

    private fun readParts(context: Context, category: String): String? {
        if (!hasAllParts(context, category)) return null
        return runCatching {
            buildString {
                for (i in 0 until PARTS_PER_CATEGORY) {
                    context.assets.open(partPath(category, i)).bufferedReader(Charsets.US_ASCII).use { append(it.readText().trim()) }
                }
            }
        }.getOrNull()
    }

    private fun parseTsv(line: String): RafiqaAssetMessage? {
        val p = line.split('\t')
        if (p.size < 20) return null
        return runCatching {
            RafiqaAssetMessage(
                id = p[0], category = p[1], text = p[2], semanticFamily = p[3], openerFamily = p[4],
                coreFamily = p[5], actionFamily = p[6], tone = p[7], timeWindow = p[8], cycleContext = p[11],
                safetyTag = p[12], lockscreenSafe = p[13].equals("TRUE", true),
                cooldownExactDays = p[14].toInt(), cooldownSemanticDays = p[15].toInt(),
                cooldownOpenerDays = p[16].toInt(), cooldownCoreDays = p[17].toInt(), cooldownActionDays = p[18].toInt()
            )
        }.getOrNull()
    }

    private fun singlePath(category: String) = "rafiqa/$category.tsv.gz.b64"
    private fun partPath(category: String, index: Int) = "rafiqa/$category.part${index.toString().padStart(2, '0')}.b64"

    private fun chooseCategory(tags: Set<String>): String {
        val hour = LocalDateTime.now().hour
        return when {
            "cycle" in tags || "period" in tags -> "cycle"
            "boundaries" in tags || "connection" in tags || "social" in tags -> "boundaries"
            "achievement" in tags -> "achievement"
            "setback" in tags -> "setback"
            "selfcare" in tags || "care" in tags -> "self_care"
            "low_confidence" in tags || "sad" in tags -> "low_confidence"
            "confidence" in tags || "motivation" in tags -> "confidence"
            "anxious" in tags || "tired" in tags || "pain" in tags || "soothing" in tags -> "hard_day"
            "checkin" in tags || "warm" in tags -> "personal_checkin"
            hour in 5..10 -> "morning"
            hour in 11..16 -> "midday"
            else -> "evening"
        }
    }

    private fun currentTimeWindow() = when (LocalDateTime.now().hour) { in 5..10 -> "morning"; in 11..16 -> "midday"; else -> "evening" }
    private fun timeMatches(messageWindow: String, current: String) = messageWindow == "any" || messageWindow == current

    private fun healthAllowed(message: RafiqaAssetMessage, profile: WomenProfile, tags: Set<String>): Boolean {
        if (message.safetyTag != "health_sensitive") return true
        if (message.cycleContext == "cycle_related") return "cycle" in tags || "period" in tags || profile.stage == WomenStage.CYCLE || profile.stage == WomenStage.PERIMENOPAUSE
        return false
    }

    private fun offCooldown(history: android.content.SharedPreferences, m: RafiqaAssetMessage, now: Long) =
        elapsed(history, "m:${m.id}", now) >= days(m.cooldownExactDays) &&
        elapsed(history, "s:${m.semanticFamily}", now) >= days(m.cooldownSemanticDays) &&
        elapsed(history, "o:${m.openerFamily}", now) >= days(m.cooldownOpenerDays) &&
        elapsed(history, "c:${m.coreFamily}", now) >= days(m.cooldownCoreDays) &&
        elapsed(history, "a:${m.actionFamily}", now) >= days(m.cooldownActionDays)

    private fun elapsed(history: android.content.SharedPreferences, key: String, now: Long): Long {
        val previous = history.getLong(key, 0L)
        return if (previous <= 0L || now < previous) Long.MAX_VALUE else now - previous
    }
    private fun days(value: Int) = value.coerceAtLeast(0) * 86_400_000L
    private fun record(history: android.content.SharedPreferences, m: RafiqaAssetMessage, now: Long) {
        history.edit().putLong("m:${m.id}", now).putLong("s:${m.semanticFamily}", now).putLong("o:${m.openerFamily}", now)
            .putLong("c:${m.coreFamily}", now).putLong("a:${m.actionFamily}", now).apply()
    }
}
