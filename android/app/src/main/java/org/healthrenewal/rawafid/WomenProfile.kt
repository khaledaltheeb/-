package org.healthrenewal.rawafid

import android.content.Context
import org.json.JSONObject

enum class WomenStage(val key: String, val label: String, val tags: Set<String>) {
    GENERAL("general", "متابعة عامة", setOf("general", "warm")),
    CYCLE("cycle", "الدورة الشهرية", setOf("period", "cycle")),
    PREGNANCY("pregnancy", "الحمل", setOf("pregnancy", "care")),
    POSTPARTUM("postpartum", "ما بعد الولادة", setOf("postpartum", "care")),
    PERIMENOPAUSE("perimenopause", "ما قبل انقطاع الطمث", setOf("perimenopause", "cycle")),
    MENOPAUSE("menopause", "انقطاع الطمث", setOf("perimenopause", "general"))
}

data class WomenProfile(
    val stage: WomenStage = WomenStage.GENERAL,
    val irregularCycles: Boolean = false,
    val wantsBreastAwareness: Boolean = true,
    val wantsPelvicHealth: Boolean = true,
    val wantsMentalSupport: Boolean = true,
    val wantsSelfCareDays: Boolean = true,
    val wantsSleepSupport: Boolean = true,
    val wantsRelationshipBoundaries: Boolean = true
)

object WomenProfileStore {
    private const val LEGACY_PREFS = "rawafid_women_profile_v1"
    private const val ENCRYPTED_KEY = "rawafid_women_profile_v2"
    private val legacyKeys = arrayOf(
        "stage",
        "irregular_cycles",
        "breast_awareness",
        "pelvic_health",
        "mental_support",
        "selfcare_days",
        "sleep_support",
        "relationship_boundaries"
    )

    fun load(context: Context): WomenProfile {
        val raw = EncryptedLocalStore.get(context, ENCRYPTED_KEY) ?: migrateLegacy(context)
        if (raw.isNullOrBlank()) return WomenProfile()
        return runCatching { decode(JSONObject(raw)) }.getOrDefault(WomenProfile())
    }

    fun save(context: Context, profile: WomenProfile) {
        EncryptedLocalStore.put(context, ENCRYPTED_KEY, encode(profile).toString())
        clearLegacy(context)
    }

    fun adaptiveTags(context: Context): Set<String> {
        val profile = load(context)
        return buildSet {
            addAll(profile.stage.tags)
            if (profile.irregularCycles) add("cycle")
            if (profile.wantsBreastAwareness) add("breast")
            if (profile.wantsPelvicHealth) add("pelvic")
            if (profile.wantsMentalSupport) add("soothing")
            if (profile.wantsSelfCareDays) add("selfcare")
            if (profile.wantsSleepSupport) add("sleep")
            if (profile.wantsRelationshipBoundaries) add("boundaries")
        }
    }

    private fun migrateLegacy(context: Context): String? {
        val prefs = context.getSharedPreferences(LEGACY_PREFS, Context.MODE_PRIVATE)
        if (legacyKeys.none { prefs.contains(it) }) return null
        val legacy = WomenProfile(
            stage = WomenStage.entries.firstOrNull { it.key == prefs.getString("stage", WomenStage.GENERAL.key) } ?: WomenStage.GENERAL,
            irregularCycles = prefs.getBoolean("irregular_cycles", false),
            wantsBreastAwareness = prefs.getBoolean("breast_awareness", true),
            wantsPelvicHealth = prefs.getBoolean("pelvic_health", true),
            wantsMentalSupport = prefs.getBoolean("mental_support", true),
            wantsSelfCareDays = prefs.getBoolean("selfcare_days", true),
            wantsSleepSupport = prefs.getBoolean("sleep_support", true),
            wantsRelationshipBoundaries = prefs.getBoolean("relationship_boundaries", true)
        )
        val raw = encode(legacy).toString()
        EncryptedLocalStore.put(context, ENCRYPTED_KEY, raw)
        clearLegacy(context)
        return raw
    }

    private fun clearLegacy(context: Context) {
        val edit = context.getSharedPreferences(LEGACY_PREFS, Context.MODE_PRIVATE).edit()
        legacyKeys.forEach(edit::remove)
        edit.apply()
    }

    private fun encode(profile: WomenProfile) = JSONObject()
        .put("stage", profile.stage.key)
        .put("irregular_cycles", profile.irregularCycles)
        .put("breast_awareness", profile.wantsBreastAwareness)
        .put("pelvic_health", profile.wantsPelvicHealth)
        .put("mental_support", profile.wantsMentalSupport)
        .put("selfcare_days", profile.wantsSelfCareDays)
        .put("sleep_support", profile.wantsSleepSupport)
        .put("relationship_boundaries", profile.wantsRelationshipBoundaries)

    private fun decode(value: JSONObject): WomenProfile = WomenProfile(
        stage = WomenStage.entries.firstOrNull { it.key == value.optString("stage", WomenStage.GENERAL.key) } ?: WomenStage.GENERAL,
        irregularCycles = value.optBoolean("irregular_cycles", false),
        wantsBreastAwareness = value.optBoolean("breast_awareness", true),
        wantsPelvicHealth = value.optBoolean("pelvic_health", true),
        wantsMentalSupport = value.optBoolean("mental_support", true),
        wantsSelfCareDays = value.optBoolean("selfcare_days", true),
        wantsSleepSupport = value.optBoolean("sleep_support", true),
        wantsRelationshipBoundaries = value.optBoolean("relationship_boundaries", true)
    )
}
