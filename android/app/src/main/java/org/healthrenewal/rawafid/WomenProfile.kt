package org.healthrenewal.rawafid

import android.content.Context

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
    private const val PREFS = "rawafid_women_profile_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun load(context: Context): WomenProfile {
        val p = prefs(context)
        val stage = WomenStage.entries.firstOrNull { it.key == p.getString("stage", WomenStage.GENERAL.key) } ?: WomenStage.GENERAL
        return WomenProfile(
            stage = stage,
            irregularCycles = p.getBoolean("irregular_cycles", false),
            wantsBreastAwareness = p.getBoolean("breast_awareness", true),
            wantsPelvicHealth = p.getBoolean("pelvic_health", true),
            wantsMentalSupport = p.getBoolean("mental_support", true),
            wantsSelfCareDays = p.getBoolean("selfcare_days", true),
            wantsSleepSupport = p.getBoolean("sleep_support", true),
            wantsRelationshipBoundaries = p.getBoolean("relationship_boundaries", true)
        )
    }

    fun save(context: Context, profile: WomenProfile) {
        prefs(context).edit()
            .putString("stage", profile.stage.key)
            .putBoolean("irregular_cycles", profile.irregularCycles)
            .putBoolean("breast_awareness", profile.wantsBreastAwareness)
            .putBoolean("pelvic_health", profile.wantsPelvicHealth)
            .putBoolean("mental_support", profile.wantsMentalSupport)
            .putBoolean("selfcare_days", profile.wantsSelfCareDays)
            .putBoolean("sleep_support", profile.wantsSleepSupport)
            .putBoolean("relationship_boundaries", profile.wantsRelationshipBoundaries)
            .apply()
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
}
