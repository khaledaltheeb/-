package org.healthrenewal.rawafid

import android.content.Context
import org.json.JSONObject
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
    val cooldownExactHours: Int,
    val cooldownSemanticHours: Int,
    val cooldownOpenerHours: Int,
    val cooldownCoreHours: Int,
    val cooldownActionHours: Int
)

/**
 * Offline engine for the canonical 12,000-message Rafiqa bank.
 *
 * Assets are intentionally split by category and gzip-compressed under:
 *   assets/rafiqa/<category>.jsonl.gz
 *
 * If an asset is not packaged yet, callers receive null and can fall back to
 * the compact in-code safety bank. No network request is made.
 */
object RafiqaAssetBank {
    private const val HISTORY_PREFS = "rawafid_rafiqa_asset_history_v1"

    private val cache = ConcurrentHashMap<String, List<RafiqaAssetMessage>>()

    private val supportedCategories = setOf(
        "confidence",
        "hard_day",
        "personal_checkin",
        "self_care",
        "morning",
        "midday",
        "evening",
        "boundaries",
        "setback",
        "achievement",
        "cycle",
        "low_confidence"
    )

    fun next(context: Context, tags: Set<String>): CompanionMessage? {
        val category = chooseCategory(tags)
        val messages = loadCategory(context, category)
        if (messages.isEmpty()) return null

        val now = System.currentTimeMillis()
        val window = currentTimeWindow()
        val profile = WomenProfileStore.load(context)
        val history = context.getSharedPreferences(HISTORY_PREFS, Context.MODE_PRIVATE)

        val contextSafe = messages.filter { message ->
            timeMatches(message.timeWindow, window) &&
                healthContextAllowed(message, profile, tags)
        }.ifEmpty { messages.filter { healthContextAllowed(it, profile, tags) } }

        if (contextSafe.isEmpty()) return null

        val eligible = contextSafe.filter { message -> isOffCooldown(history, message, now) }
        val pool = eligible.ifEmpty { contextSafe }
        val seed = (
            LocalDate.now().dayOfYear * 10_000 +
                LocalDateTime.now().hour * 271 +
                LocalDateTime.now().minute * 13 +
                category.hashCode()
            ).absoluteValue
        val chosen = pool[seed % pool.size]
        record(history, chosen, now)

        return CompanionMessage(
            id = "asset:${chosen.id}",
            tags = tags + chosen.category + chosen.tone,
            text = chosen.text
        )
    }

    fun nextLockscreenSafe(context: Context, tags: Set<String>): CompanionMessage? {
        val category = chooseCategory(tags)
        val messages = loadCategory(context, category).filter { it.lockscreenSafe }
        if (messages.isEmpty()) return null
        val now = System.currentTimeMillis()
        val history = context.getSharedPreferences(HISTORY_PREFS, Context.MODE_PRIVATE)
        val profile = WomenProfileStore.load(context)
        val window = currentTimeWindow()
        val pool = messages.filter {
            timeMatches(it.timeWindow, window) &&
                healthContextAllowed(it, profile, tags) &&
                isOffCooldown(history, it, now)
        }.ifEmpty {
            messages.filter { healthContextAllowed(it, profile, tags) }
        }
        if (pool.isEmpty()) return null
        val seed = (System.currentTimeMillis() / 60_000L + category.hashCode()).absoluteValue
        val chosen = pool[(seed % pool.size).toInt()]
        record(history, chosen, now)
        return CompanionMessage("asset:${chosen.id}", tags + chosen.category + chosen.tone, chosen.text)
    }

    fun availableCategories(context: Context): Set<String> = supportedCategories.filterTo(mutableSetOf()) { category ->
        runCatching {
            context.assets.open(assetPath(category)).close()
            true
        }.getOrDefault(false)
    }

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

    private fun loadCategory(context: Context, category: String): List<RafiqaAssetMessage> =
        cache.getOrPut(category) {
            runCatching {
                context.assets.open(assetPath(category)).use { input ->
                    GZIPInputStream(input).use { gzip ->
                        BufferedReader(InputStreamReader(gzip, Charsets.UTF_8)).useLines { lines ->
                            lines.mapNotNull(::parse).toList()
                        }
                    }
                }
            }.getOrDefault(emptyList())
        }

    private fun parse(line: String): RafiqaAssetMessage? = runCatching {
        val json = JSONObject(line)
        RafiqaAssetMessage(
            id = json.getString("message_id"),
            category = json.optString("category_code", "personal_checkin"),
            text = json.getString("text_ar"),
            semanticFamily = json.optString("semantic_family", "none"),
            openerFamily = json.optString("opener_family", "none"),
            coreFamily = json.optString("core_family", "none"),
            actionFamily = json.optString("action_family", "none"),
            tone = json.optString("tone", "warm"),
            timeWindow = json.optString("time_window", "any"),
            cycleContext = json.optString("cycle_context", "any"),
            safetyTag = json.optString("safety_tag", "general"),
            lockscreenSafe = json.optBoolean("lockscreen_safe", false),
            cooldownExactHours = json.optInt("cooldown_exact_hours", 72),
            cooldownSemanticHours = json.optInt("cooldown_semantic_hours", 24),
            cooldownOpenerHours = json.optInt("cooldown_opener_hours", 12),
            cooldownCoreHours = json.optInt("cooldown_core_hours", 24),
            cooldownActionHours = json.optInt("cooldown_action_hours", 12)
        )
    }.getOrNull()

    private fun assetPath(category: String) = "rafiqa/$category.jsonl.gz"

    private fun currentTimeWindow(): String = when (LocalDateTime.now().hour) {
        in 5..10 -> "morning"
        in 11..16 -> "midday"
        else -> "evening"
    }

    private fun timeMatches(messageWindow: String, currentWindow: String): Boolean =
        messageWindow == "any" || messageWindow == currentWindow

    private fun healthContextAllowed(message: RafiqaAssetMessage, profile: WomenProfile, tags: Set<String>): Boolean {
        if (message.safetyTag != "health_sensitive") return true
        if (message.cycleContext == "cycle_related") {
            return "cycle" in tags ||
                "period" in tags ||
                profile.stage == WomenStage.CYCLE ||
                profile.stage == WomenStage.PERIMENOPAUSE
        }
        return false
    }

    private fun isOffCooldown(
        history: android.content.SharedPreferences,
        message: RafiqaAssetMessage,
        now: Long
    ): Boolean {
        return elapsed(history, "m:${message.id}", now) >= hours(message.cooldownExactHours) &&
            elapsed(history, "s:${message.semanticFamily}", now) >= hours(message.cooldownSemanticHours) &&
            elapsed(history, "o:${message.openerFamily}", now) >= hours(message.cooldownOpenerHours) &&
            elapsed(history, "c:${message.coreFamily}", now) >= hours(message.cooldownCoreHours) &&
            elapsed(history, "a:${message.actionFamily}", now) >= hours(message.cooldownActionHours)
    }

    private fun elapsed(history: android.content.SharedPreferences, key: String, now: Long): Long {
        val previous = history.getLong(key, 0L)
        if (previous <= 0L || now < previous) return Long.MAX_VALUE
        return now - previous
    }

    private fun hours(value: Int): Long = value.coerceAtLeast(0) * 3_600_000L

    private fun record(history: android.content.SharedPreferences, message: RafiqaAssetMessage, now: Long) {
        history.edit()
            .putLong("m:${message.id}", now)
            .putLong("s:${message.semanticFamily}", now)
            .putLong("o:${message.openerFamily}", now)
            .putLong("c:${message.coreFamily}", now)
            .putLong("a:${message.actionFamily}", now)
            .apply()
    }
}
