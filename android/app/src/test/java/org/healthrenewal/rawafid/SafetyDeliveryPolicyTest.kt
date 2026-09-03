package org.healthrenewal.rawafid

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SafetyDeliveryPolicyTest {
    @Test
    fun cloudOnlyDeliveryIsSuccessful() {
        val result = SafetyDeliveryOutcome(cloudRecipients = 2, cloudAttempted = true)
        assertTrue(result.success)
        assertTrue(result.userMessage().contains("دائرة روافد: 2"))
    }

    @Test
    fun smsOnlyDeliveryIsSuccessful() {
        val result = SafetyDeliveryOutcome(smsRecipients = 1, smsAttempted = true)
        assertTrue(result.success)
        assertTrue(result.userMessage().contains("SMS: 1"))
    }

    @Test
    fun oneFailedChannelDoesNotCancelSuccessfulChannel() {
        val result = SafetyDeliveryOutcome(
            cloudRecipients = 0,
            smsRecipients = 1,
            cloudAttempted = true,
            smsAttempted = true,
            cloudError = "تعذر اتصال دائرة روافد"
        )
        assertTrue(result.success)
    }

    @Test
    fun noRecipientIsNotSuccessful() {
        val result = SafetyDeliveryOutcome(cloudAttempted = true, smsAttempted = true)
        assertFalse(result.success)
    }

    @Test
    fun smsPermissionIsOnlyNeededForLocalSmsRecipients() {
        assertFalse(SafetyDeliveryPolicy.requiresSmsPermission(0))
        assertTrue(SafetyDeliveryPolicy.requiresSmsPermission(1))
    }

    @Test
    fun circleSessionProvidesPotentialCloudChannel() {
        assertTrue(SafetyDeliveryPolicy.hasPotentialChannel(0, true))
        assertFalse(SafetyDeliveryPolicy.hasPotentialChannel(0, false))
    }
}
