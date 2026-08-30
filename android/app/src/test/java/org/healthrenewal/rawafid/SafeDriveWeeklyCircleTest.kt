package org.healthrenewal.rawafid

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDateTime
import java.time.ZoneId

class SafeDriveWeeklyCircleTest {
    private val zone = ZoneId.of("Asia/Amman")

    @Test
    fun weekKeyUsesCompletedRollingWeekAnchor() {
        val now = LocalDateTime.of(2026, 8, 31, 9, 0).atZone(zone).toInstant().toEpochMilli()
        assertEquals("2026-W35", SafeDriveWeeklyCirclePolicy.weekKey(now, zone))
    }

    @Test
    fun nextScheduleTargetsMondayMorning() {
        val sunday = LocalDateTime.of(2026, 8, 30, 12, 0).atZone(zone).toInstant().toEpochMilli()
        val delay = SafeDriveWeeklyCirclePolicy.nextMondayNineDelayMs(sunday, zone)
        val target = java.time.Instant.ofEpochMilli(sunday + delay).atZone(zone)
        assertEquals(java.time.DayOfWeek.MONDAY, target.dayOfWeek)
        assertEquals(9, target.hour)
        assertTrue(delay > 0L)
    }

    @Test
    fun automaticSummaryNeverContainsLocationTraceLanguage() {
        val summary = SafeDriveWeeklySummary(
            trips = 3,
            distanceKm = 120.5,
            durationMs = 7_200_000L,
            averageScore = 88,
            harshEventsPer100Km = 2.5,
            previousAverageScore = 82,
            previousHarshEventsPer100Km = 3.5,
            trend = "تحسن متوسط تقييم القيادة مقارنة بالأسبوع السابق."
        )
        val text = SafeDriveWeeklyCirclePolicy.automaticSummary(summary)
        assertTrue(text.contains("لا يتضمن هذا الملخص مسار GPS أو موقعك"))
        assertFalse(text.contains("latitude", ignoreCase = true))
        assertFalse(text.contains("longitude", ignoreCase = true))
    }
}
