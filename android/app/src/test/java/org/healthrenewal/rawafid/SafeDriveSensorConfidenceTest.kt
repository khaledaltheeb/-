package org.healthrenewal.rawafid

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SafeDriveSensorConfidenceTest {
    @Test
    fun noFusionDataNeverChangesDrivingScore() {
        val result = SafeDriveSensorConfidence.evaluate(null)
        assertEquals("لا توجد بيانات معايرة", result.label)
        assertNull(result.corroborationPercent)
        assertFalse(result.canInfluenceScore)
    }

    @Test
    fun missingGyroscopeIsNotPenalized() {
        val result = SafeDriveSensorConfidence.evaluate(summary(gyro = false, gpsTurns = 4, confirmed = 0, gpsOnly = 4))
        assertEquals("GPS دون Gyroscope", result.label)
        assertFalse(result.canInfluenceScore)
    }

    @Test
    fun strongCorroborationIsReportedButStillCalibrationOnly() {
        val result = SafeDriveSensorConfidence.evaluate(summary(gyro = true, gpsTurns = 4, confirmed = 3, gpsOnly = 1))
        assertEquals(75, result.corroborationPercent)
        assertEquals("توافق حساسات مرتفع", result.label)
        assertFalse(result.canInfluenceScore)
        assertTrue(result.explanation.contains("لا يغيّر الدرجة تلقائيًا"))
    }

    @Test
    fun tinySampleDoesNotPretendToBeHighConfidence() {
        val result = SafeDriveSensorConfidence.evaluate(summary(gyro = true, gpsTurns = 1, confirmed = 1, gpsOnly = 0))
        assertEquals("عينة معايرة صغيرة", result.label)
        assertFalse(result.canInfluenceScore)
    }

    private fun summary(gyro: Boolean, gpsTurns: Int, confirmed: Int, gpsOnly: Int) = SafeDriveSensorFusionSummary(
        reportId = "r1",
        startedAtMs = 1L,
        endedAtMs = 2L,
        gyroscopeAvailable = gyro,
        gpsHardTurnCount = gpsTurns,
        gyroCorroboratedTurnCount = confirmed,
        gpsOnlyTurnCount = gpsOnly,
        peakAngularRateDegPerSec = 60.0
    )
}
