package org.healthrenewal.rawafid

import java.net.URI

object TrustedSitePolicy {
    private const val ROOT_HOST = "healthrenewal.org"

    fun isAllowedHttps(rawUrl: String): Boolean {
        val uri = runCatching { URI(rawUrl.trim()) }.getOrNull() ?: return false
        if (!uri.scheme.equals("https", ignoreCase = true)) return false
        val host = uri.host?.lowercase() ?: return false
        return host == ROOT_HOST || host.endsWith(".$ROOT_HOST")
    }
}

object ToolCatalogSearch {
    fun filter(
        features: List<RawafidFeature>,
        selectedCategory: String,
        query: String,
        categoryLabels: Map<String, String> = emptyMap()
    ): List<RawafidFeature> {
        val scoped = if (selectedCategory == "all") {
            features
        } else {
            features.filter { it.category == selectedCategory }
        }

        val normalizedQuery = query.trim()
        if (normalizedQuery.isBlank()) return scoped

        return scoped.filter { feature ->
            sequenceOf(
                feature.title,
                feature.subtitle,
                feature.id,
                feature.category,
                categoryLabels[feature.category].orEmpty()
            ).any { value -> value.contains(normalizedQuery, ignoreCase = true) }
        }
    }
}
