package org.healthrenewal.rawafid

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class TrustedSitePolicyTest {
    @Test
    fun allowsRootAndSubdomainsOverHttps() {
        assertTrue(TrustedSitePolicy.isAllowedHttps("https://healthrenewal.org/quick-info"))
        assertTrue(TrustedSitePolicy.isAllowedHttps("https://www.healthrenewal.org/path"))
    }

    @Test
    fun rejectsInsecureAndLookalikeHosts() {
        assertFalse(TrustedSitePolicy.isAllowedHttps("http://healthrenewal.org/path"))
        assertFalse(TrustedSitePolicy.isAllowedHttps("https://healthrenewal.org.evil.example/path"))
        assertFalse(TrustedSitePolicy.isAllowedHttps("https://healthrenewal.org@evil.example/path"))
        assertFalse(TrustedSitePolicy.isAllowedHttps("not a url"))
    }
}

class ToolCatalogSearchTest {
    private val medication = feature(
        id = "medication_companion",
        title = "رفيق الدواء",
        subtitle = "تذكير محلي بالأدوية",
        category = "health"
    )
    private val safeArrival = feature(
        id = "safe_arrival",
        title = "الوصول الآمن",
        subtitle = "مؤقت أمان اختياري",
        category = "safety"
    )
    private val features = listOf(medication, safeArrival)
    private val labels = mapOf("health" to "صحة", "safety" to "أمان")

    @Test
    fun blankQueryReturnsSelectedCategoryOnly() {
        assertEquals(listOf(medication), ToolCatalogSearch.filter(features, "health", "   ", labels))
    }

    @Test
    fun matchesArabicTitleAndSubtitle() {
        assertEquals(listOf(medication), ToolCatalogSearch.filter(features, "all", "الدواء", labels))
        assertEquals(listOf(safeArrival), ToolCatalogSearch.filter(features, "all", "مؤقت", labels))
    }

    @Test
    fun matchesStableIdAndLocalizedCategoryLabel() {
        assertEquals(listOf(safeArrival), ToolCatalogSearch.filter(features, "all", "safe_arrival", labels))
        assertEquals(listOf(medication), ToolCatalogSearch.filter(features, "all", "صحة", labels))
    }

    @Test
    fun categoryFilterRemainsAuthoritativeDuringSearch() {
        assertTrue(ToolCatalogSearch.filter(features, "health", "أمان", labels).isEmpty())
    }

    private fun feature(id: String, title: String, subtitle: String, category: String) = RawafidFeature(
        id = id,
        title = title,
        subtitle = subtitle,
        category = category,
        routeType = "activity",
        routeTarget = "org.healthrenewal.rawafid.MainActivity",
        status = "stable",
        priority = 100
    )
}
