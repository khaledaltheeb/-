package org.healthrenewal.rawafid

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SafeDriveEngineTest {
    @Test
    fun cleanTripKeepsHighScore() {
        val score = SafeDriveScoring.score(
            highSpeedDurationMs = 0L,
            maxSpeedKmh = 80.0,
            speedThresholdKmh = 120,
            harshAccelerationCount = 0,
            harshBrakingCount = 0,
            hardTurnCount = 0,
            severeSpeedCount = 0,
            riskClusterCount = 0
        )
        assertEquals(100, score)
        assertEquals("ممتازة", SafeDriveScoring.riskLabel(score))
    }

    @Test
    fun repeatedRiskLowersScoreWithoutGoingNegative() {
        val score = SafeDriveScoring.score(
            highSpeedDurationMs = 12 * 60_000L,
            maxSpeedKmh = 180.0,
            speedThresholdKmh = 110,
            harshAccelerationCount = 12,
            harshBrakingCount = 12,
            hardTurnCount = 8,
            severeSpeedCount = 5,
            riskClusterCount = 5
        )
        assertTrue(score in 0..45)
    }

    @Test
    fun suddenStopRequiresCorroboratingSignal() {
        val detector = SafeDriveIncidentDetector(SafeDriveIncidentConfig())
        assertNull(detector.consume(sample(0L), currentSpeedKmh = 65.0, currentAccelerationMps2 = 0.0))
        assertNull(detector.consume(sample(3_000L), currentSpeedKmh = 5.0, currentAccelerationMps2 = -2.0))
    }

    @Test
    fun suddenStopTriggersCheckWhenSpeedDropAndImpactAgree() {
        val detector = SafeDriveIncidentDetector(SafeDriveIncidentConfig())
        detector.consume(sample(0L), currentSpeedKmh = 70.0, currentAccelerationMps2 = 0.0)
        detector.recordImpact(2_800L, 2.9)
        val candidate = detector.consume(sample(3_000L), currentSpeedKmh = 4.0, currentAccelerationMps2 = -2.0)
        assertNotNull(candidate)
        assertTrue(candidate!!.preStopSpeedKmh >= 70.0)
        assertTrue(candidate.peakImpactG >= 2.4)
    }

    @Test
    fun suddenStopTriggersCheckOnVeryHardDeceleration() {
        val detector = SafeDriveIncidentDetector(SafeDriveIncidentConfig())
        detector.consume(sample(0L), currentSpeedKmh = 62.0, currentAccelerationMps2 = 0.0)
        val candidate = detector.consume(sample(2_000L), currentSpeedKmh = 6.0, currentAccelerationMps2 = -5.4)
        assertNotNull(candidate)
    }

    @Test
    fun suddenStopRemembersHardDecelerationAcrossFollowingStopSample() {
        val detector = SafeDriveIncidentDetector(SafeDriveIncidentConfig())
        detector.consume(sample(0L), currentSpeedKmh = 72.0, currentAccelerationMps2 = 0.0)
        detector.consume(sample(1_000L), currentSpeedKmh = 32.0, currentAccelerationMps2 = -5.8)
        val candidate = detector.consume(sample(2_000L), currentSpeedKmh = 5.0, currentAccelerationMps2 = -1.0)
        assertNotNull(candidate)
        assertTrue(candidate!!.decelerationMps2 <= -5.8)
    }

    @Test
    fun configClampsUnsafeOrNonsensicalValues() {
        val config = SafeDriveConfig(
            personalSpeedAlertKmh = 5,
            speedAlertAfterSeconds = 2,
            harshAccelerationMps2 = 50.0,
            maxLocationAccuracyM = 500f
        ).normalized()
        assertEquals(50, config.personalSpeedAlertKmh)
        assertEquals(30, config.speedAlertAfterSeconds)
        assertEquals(6.0, config.harshAccelerationMps2, 0.001)
        assertEquals(80f, config.maxLocationAccuracyM, 0.001f)
    }

    private fun sample(elapsedMs: Long) = SafeDriveSample(
        wallTimeMs = 1_000_000L + elapsedMs,
        elapsedMs = elapsedMs,
        latitude = 31.9539,
        longitude = 35.9106,
        accuracyM = 5f,
        speedMps = null,
        speedAccuracyMps = null,
        bearingDegrees = 0f,
        bearingAccuracyDegrees = 2f
    )
}
