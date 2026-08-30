package org.healthrenewal.rawafid

import android.content.Context
import android.content.Intent
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
    @Volatile private var cache: List<RawafidFeature>? = null

    fun all(context: Context): List<RawafidFeature> = cache ?: synchronized(this) {
        cache ?: load(context).also { cache = it }
    }

    fun byCategory(context: Context, category: String): List<RawafidFeature> =
        all(context).filter { it.category == category }.sortedByDescending { it.priority }

    fun visible(context: Context): List<RawafidFeature> =
        all(context).filter { it.status != "hidden" }.sortedByDescending { it.priority }

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
    }.getOrDefault(emptyList())
}

object FeatureRouter {
    fun open(context: Context, feature: RawafidFeature) {
        when (feature.routeType) {
            "web" -> context.startActivity(
                Intent(context, WebActivity::class.java).putExtra(WebActivity.EXTRA_URL, feature.routeTarget)
            )
            "main" -> context.startActivity(
                Intent(context, MainActivity::class.java)
                    .putExtra("destination", feature.routeTarget)
                    .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            )
            "quick" -> context.startActivity(
                Intent(context, LifeUtilityActivity::class.java)
                    .putExtra(LifeUtilityActivity.EXTRA_TOOL_ID, feature.routeTarget)
            )
            "activity" -> {
                val clazz = runCatching { Class.forName(feature.routeTarget) }.getOrNull()
                if (clazz != null) context.startActivity(Intent(context, clazz))
            }
        }
    }
}
