package org.healthrenewal.rawafid

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CircleRulesTest {
    @Test
    fun rawafidId_isNormalizedAndValidated() {
        assertEquals("RFD-A1B2-C3D4-E5F6-0A1B", CircleRules.normalizeRawafidId("  rfd-a1b2-c3d4-e5f6-0a1b  "))
        assertTrue(CircleRules.isValidRawafidId("rfd-a1b2-c3d4-e5f6-0a1b"))
    }

    @Test
    fun rawafidId_rejectsMalformedValues() {
        assertFalse(CircleRules.isValidRawafidId("RFD-A1B2-C3D4-E5F6-0A1"))
        assertFalse(CircleRules.isValidRawafidId("RFD-G1B2-C3D4-E5F6-0A1B"))
    }

    @Test
    fun textInputs_areBounded() {
        assertEquals(80, CircleRules.safeLabel("x".repeat(100)).length)
        assertEquals(4000, CircleRules.safeMessage("x".repeat(5000)).length)
    }
}
