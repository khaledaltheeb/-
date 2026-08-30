package org.healthrenewal.rawafid

import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.Toast
import org.json.JSONArray

data class RawafidFeature(
    val id: String,
    val title: String,
    val subtitle: String,
    val category: String,
    val routeType: String,
    val routeTarget: String,
    val status: String,
    val priority: Int
)

object FeatureCatalog {
    private const val ASSET = "rawafid_feature_catalog.json"
    private const val TAG = "RawafidFeatureCatalog"
    private val allowedRouteTypes = setOf("web", "main", "quick", "activity")
    private val accountFeature = RawafidFeature(
        id = "rawafid_account",
        title = "حساب روافد ورقمي",
        subtitle = "أنشئ الحساب أو سجّل الدخول للحصول على معرّف RFD الثابت ثم استخدمه لربط دائرتك بين الأجهزة.",
        category = "family",
        routeType = "activity",
        routeTarget = "org.healthrenewal.rawafid.CircleAccountActivity",
        status = "stable",
        priority = 121
    )
    private val safeDriveAgreementsFeature = RawafidFeature(
        id = "safe_drive_agreements",
        title = "اتفاق القيادة الآمنة",
        subtitle = "حدد لكل شخص من دائرتك تنبيهات الحوادث والقيادة وتقارير الرحلات وحد السرعة الشخصي ومدة الاستمرار قبل التنبيه.",
        category = "safety",
        routeType = "activity",
        routeTarget = "org.healthrenewal.rawafid.SafeDriveAgreementsActivity",
        status = "beta",
        priority = 103
    )
    @Volatile private var cache: List<RawafidFeature>? = null

    fun all(context: Context): List<RawafidFeature> = cache ?: synchronized(this) {
        cache ?: load(context).also { loaded ->
            validate(context, loaded).forEach { Log.e(TAG, it) }
            cache = loaded
        }
    }

    fun byCategory(context: Context, category: String): List<RawafidFeature> =
        visible(context).filter { it.category == category }.sortedByDescending { it.priority }

    fun visible(context: Context): List<RawafidFeature> {
        val published = all(context)
            .filter { it.status != "hidden" }
            .map { feature ->
                if (feature.id == "my_circle") {
                    feature.copy(
                        title = "دائرتي — الرقم والربط",
                        subtitle = "اعرض رقم RFD والـQR، أضف شخصًا بمعرّفه، واقبل الربط قبل تفعيل المحادثة أو الصلاحيات.",
                        priority = 120
                    )
                } else {
                    feature
                }
            }
        return (listOf(accountFeature, safeDriveAgreementsFeature) + published)
            .distinctBy { it.id }
            .sortedByDescending { it.priority }
    }

    fun diagnostics(context: Context): List<String> = validate(context, all(context))

    private fun validate(context: Context, features: List<RawafidFeature>): List<String> = buildList {
        features.groupBy { it.id }.filterValues { it.size > 1 }.keys.forEach { add("Duplicate feature id: $it") }
        features.forEach { feature ->
            if (feature.id.isBlank()) add("Feature has blank id: ${feature.title}")
            if (feature.title.isBlank()) add("Feature ${feature.id} has blank title")
            if (feature.routeType !in allowedRouteTypes) add("Feature ${feature.id} has unsupported route type: ${feature.routeType}")
            if (feature.routeTarget.isBlank()) add("Feature ${feature.id} has blank route target")
            if (feature.routeType == "web" && !TrustedSitePolicy.isAllowedHttps(feature.routeTarget)) {
                add("Feature ${feature.id} web route is outside healthrenewal.org")
            }
            if (feature.routeType == "activity" && runCatching { Class.forName(feature.routeTarget) }.isFailure) {
                add("Feature ${feature.id} activity class not found: ${feature.routeTarget}")
            }
        }
    }

    private fun load(context: Context): List<RawafidFeature> = runCatching {
        val raw = context.assets.open(ASSET).bufferedReader(Charsets.UTF_8).use { it.readText() }
        val array = JSONArray(raw)
        buildList {
            for (index in 0 until array.length()) {
                val item = array.getJSONObject(index)
                add(
                    RawafidFeature(
                        id = item.getString("id"),
                        title = item.getString("title"),
                        subtitle = item.optString("subtitle"),
                        category = item.optString("category", "other"),
                        routeType = item.getString("route_type"),
                        routeTarget = item.getString("route_target"),
                        status = item.optString("status", "stable"),
                        priority = item.optInt("priority", 0)
                    )
                )
            }
        }
    }.onFailure { Log.e(TAG, "Unable to load feature catalog", it) }.getOrDefault(emptyList())
}

object FeatureRouter {
    private const val TAG = "RawafidFeatureRouter"
    private val interactiveQuickTools = setOf("breathing", "one_minute", "screen_rest")

    fun open(context: Context, feature: RawafidFeature) {
        val intent = when (feature.routeType) {
            "web" -> if (TrustedSitePolicy.isAllowedHttps(feature.routeTarget)) {
                Intent(context, WebActivity::class.java).putExtra(WebActivity.EXTRA_URL, feature.routeTarget)
            } else {
                null
            }
            "main" -> Intent(context, MainActivity::class.java)
                .putExtra("destination", feature.routeTarget)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            "quick" -> if (feature.routeTarget in interactiveQuickTools) {
                Intent(context, InteractiveUtilityActivity::class.java)
                    .putExtra(InteractiveUtilityActivity.EXTRA_TOOL_ID, feature.routeTarget)
            } else {
                Intent(context, LifeUtilityActivity::class.java)
                    .putExtra(LifeUtilityActivity.EXTRA_TOOL_ID, feature.routeTarget)
            }
            "activity" -> {
                val clazz = runCatching { Class.forName(feature.routeTarget) }.getOrNull()
                clazz?.let { Intent(context, it) }
            }
            else -> null
        }

        if (intent == null) {
            Log.e(TAG, "Invalid feature route: ${feature.id} / ${feature.routeType} / ${feature.routeTarget}")
            Toast.makeText(context, "تعذر فتح هذه الأداة. تم تسجيل الخطأ للمراجعة.", Toast.LENGTH_SHORT).show()
            return
        }
        runCatching { context.startActivity(intent) }
            .onFailure {
                Log.e(TAG, "Failed opening feature ${feature.id}", it)
                Toast.makeText(context, "تعذر فتح هذه الأداة الآن.", Toast.LENGTH_SHORT).show()
            }
    }
}
