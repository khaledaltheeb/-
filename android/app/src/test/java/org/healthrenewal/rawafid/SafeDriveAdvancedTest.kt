package org.healthrenewal.rawafid

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDateTime
import java.time.ZoneId

class SafeDriveAdvancedTest {
    @Test
    fun newDriverModeCapsRestReminderAtNinetyMinutes() {
        val config = SafeDriveAdvancedConfig(restReminderMinutes = 180, newDriverMode = true, nightGuardEnabled = false)
        val noon = LocalDateTime.of(2026, 8, 31, 12, 0).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
        assertEquals(90, SafeDriveAdvancedPolicy.effectiveRestMinutes(config, noon))
    }

    @Test
    fun weeklySummaryUsesOnlyCurrentSevenDays() {
        val now = 2_000_000_000_000L
        val reports = listOf(
            report(now - 24 * 60 * 60_000L, score = 90, distanceKm = 50.0, harsh = 2),
            report(now - 2 * 24 * 60 * 60_000L, score = 80, distanceKm = 50.0, harsh = 4),
            report(now - 9 * 24 * 60 * 60_000L, score = 60, distanceKm = 100.0, harsh = 12)
        )
        val summary = SafeDriveWeeklyAnalytics.summarize(reports, now)
        assertEquals(2, summary.trips)
        assertEquals(100.0, summary.distanceKm, 0.001)
        assertEquals(85, summary.averageScore)
        assertNotNull(summary.harshEventsPer100Km)
        assertEquals(6.0, summary.harshEventsPer100Km!!, 0.001)
    }

    @Test
    fun normalizationKeepsRestWindowSane() {
        assertEquals(60, SafeDriveAdvancedConfig(restReminderMinutes = 2).normalized().restReminderMinutes)
        assertEquals(240, SafeDriveAdvancedConfig(restReminderMinutes = 1000).normalized().restReminderMinutes)
        assertTrue(SafeDriveAdvancedConfig().reduceDistractionEnabled)
    }

    private fun report(startedAtMs: Long, score: Int, distanceKm: Double, harsh: Int) = SafeDriveTripReport(
        id = "r-$startedAtMs",
        startedAtMs = startedAtMs,
        endedAtMs = startedAtMs + 60 * 60_000L,
        durationMs = 60 * 60_000L,
        distanceKm = distanceKm,
        averageSpeedKmh = distanceKm,
        maxSpeedKmh = 100.0,
        personalSpeedAlertKmh = 120,
        highSpeedDurationMs = 0L,
        harshAccelerationCount = harsh / 2,
        harshBrakingCount = harsh - harsh / 2,
        hardTurnCount = 0,
        severeSpeedCount = 0,
        riskClusterCount = 0,
        score = score,
        riskLabel = SafeDriveScoring.riskLabel(score),
        dataQuality = "جيدة",
        acceptedSamples = 100,
        rejectedSamples = 0,
        events = emptyList()
    )
}
