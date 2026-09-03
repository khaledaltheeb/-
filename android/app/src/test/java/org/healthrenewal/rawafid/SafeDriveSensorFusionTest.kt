package org.healthrenewal.rawafid

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SafeDriveSensorFusionTest {
    @Test
    fun recentStrongGyroSignalCorroboratesGpsHardTurn() {
        assertTrue(
            SafeDriveTurnFusionRule.corroborates(
                hardTurnDetectedAtElapsedMs = 12_000L,
                gyroSignalAtElapsedMs = 11_200L,
                gyroAngularRateDegPerSec = 48.0,
                gyroscopeAvailable = true
            )
        )
    }

    @Test
    fun oldGyroSignalDoesNotCorroborateGpsHardTurn() {
        assertFalse(
            SafeDriveTurnFusionRule.corroborates(
                hardTurnDetectedAtElapsedMs = 20_000L,
                gyroSignalAtElapsedMs = 10_000L,
                gyroAngularRateDegPerSec = 80.0,
                gyroscopeAvailable = true
            )
        )
    }

    @Test
    fun weakOrUnavailableGyroDoesNotCorroborate() {
        assertFalse(SafeDriveTurnFusionRule.corroborates(10_000L, 9_900L, 10.0, true))
        assertFalse(SafeDriveTurnFusionRule.corroborates(10_000L, 9_900L, 80.0, false))
    }
}
