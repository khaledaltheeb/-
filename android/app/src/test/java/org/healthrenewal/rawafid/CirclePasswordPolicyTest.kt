package org.healthrenewal.rawafid

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CirclePasswordPolicyTest {
    @Test
    fun acceptsStrongMixedPassword() {
        assertTrue(CirclePasswordPolicy.isValid("Rawafid#2026"))
    }

    @Test
    fun rejectsShortPassword() {
        assertFalse(CirclePasswordPolicy.isValid("Ra#20x"))
    }

    @Test
    fun rejectsPasswordWithoutUppercase() {
        assertFalse(CirclePasswordPolicy.isValid("rawafid#2026"))
    }

    @Test
    fun rejectsPasswordWithoutLowercase() {
        assertFalse(CirclePasswordPolicy.isValid("RAWAFID#2026"))
    }

    @Test
    fun rejectsPasswordWithoutDigit() {
        assertFalse(CirclePasswordPolicy.isValid("Rawafid#Safe"))
    }

    @Test
    fun rejectsPasswordWithoutSymbol() {
        assertFalse(CirclePasswordPolicy.isValid("Rawafid2026"))
    }
}
