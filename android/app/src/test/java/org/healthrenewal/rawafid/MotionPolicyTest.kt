package org.healthrenewal.rawafid

import org.junit.Assert.assertEquals
import org.junit.Test

class MotionPolicyTest {
    @Test
    fun reducedMotionUsesZeroDuration() {
        assertEquals(0, MotionPolicy.durationMillis(reduceMotion = true))
    }

    @Test
    fun standardMotionKeepsConfiguredDuration() {
        assertEquals(700, MotionPolicy.durationMillis(reduceMotion = false))
        assertEquals(250, MotionPolicy.durationMillis(reduceMotion = false, standardMillis = 250))
    }

    @Test
    fun invalidNegativeDurationIsClamped() {
        assertEquals(0, MotionPolicy.durationMillis(reduceMotion = false, standardMillis = -1))
    }
}
