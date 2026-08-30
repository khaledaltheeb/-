package org.healthrenewal.rawafid

data class SafetyDeliveryOutcome(
    val cloudRecipients: Int = 0,
    val smsRecipients: Int = 0,
    val cloudAttempted: Boolean = false,
    val smsAttempted: Boolean = false,
    val cloudError: String? = null,
    val smsError: String? = null
) {
    val deliveredRecipients: Int get() = cloudRecipients.coerceAtLeast(0) + smsRecipients.coerceAtLeast(0)
    val success: Boolean get() = deliveredRecipients > 0

    fun userMessage(): String {
        val parts = mutableListOf<String>()
        if (cloudRecipients > 0) parts += "دائرة روافد: $cloudRecipients"
        else if (cloudAttempted && !cloudError.isNullOrBlank()) parts += "دائرة روافد: لم يتم الإرسال"

        if (smsRecipients > 0) parts += "SMS: $smsRecipients"
        else if (smsAttempted && !smsError.isNullOrBlank()) parts += "SMS: لم يتم الإرسال"

        if (success) {
            return "تم إرسال موقع الأمان إلى $deliveredRecipients جهة. ${parts.joinToString(" · ")}".trim()
        }

        val reasons = listOfNotNull(cloudError?.takeIf { it.isNotBlank() }, smsError?.takeIf { it.isNotBlank() }).distinct()
        return when {
            reasons.isNotEmpty() -> "تعذر إرسال موقع الأمان. ${reasons.joinToString(" · ")}"
            cloudAttempted || smsAttempted -> "تعذر إرسال موقع الأمان إلى أي جهة مفعلة."
            else -> "لا توجد قناة أمان مفعلة لاستلام الموقع. أضف جهة SMS أو فعّل «موقع مراقبة الأمان» لشخص في دائرة روافد."
        }
    }
}

object SafetyDeliveryPolicy {
    fun requiresSmsPermission(localSmsRecipientCount: Int): Boolean = localSmsRecipientCount > 0
    fun hasPotentialChannel(localSmsRecipientCount: Int, hasCircleSession: Boolean): Boolean =
        localSmsRecipientCount > 0 || hasCircleSession
}
