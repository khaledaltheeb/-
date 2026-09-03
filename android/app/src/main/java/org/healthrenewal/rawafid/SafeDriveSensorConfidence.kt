package org.healthrenewal.rawafid

import kotlin.math.roundToInt

data class SafeDriveSensorConfidenceResult(
    val label: String,
    val explanation: String,
    val corroborationPercent: Int?,
    val canInfluenceScore: Boolean = false
)

object SafeDriveSensorConfidence {
    fun evaluate(summary: SafeDriveSensorFusionSummary?): SafeDriveSensorConfidenceResult {
        if (summary == null) {
            return SafeDriveSensorConfidenceResult(
                label = "لا توجد بيانات معايرة",
                explanation = "لا تتوفر خلاصة حساسات لهذه الرحلة. يبقى تقييم الرحلة مبنيًا على القياسات الأساسية فقط.",
                corroborationPercent = null
            )
        }
        if (!summary.gyroscopeAvailable) {
            return SafeDriveSensorConfidenceResult(
                label = "GPS دون Gyroscope",
                explanation = "الهاتف لا يوفّر Gyroscope متاحًا لهذه الرحلة؛ لا نخفض الدرجة بسبب غياب الحساس.",
                corroborationPercent = null
            )
        }
        if (summary.gpsHardTurnCount <= 0) {
            return SafeDriveSensorConfidenceResult(
                label = "لا توجد انعطافات حادة للمقارنة",
                explanation = "لم يرصد تحليل GPS انعطافات حادة في هذه الرحلة، لذلك لا توجد عينة انعطاف تحتاج تأكيدًا بالحساس.",
                corroborationPercent = null
            )
        }

        val totalClassified = (summary.gyroCorroboratedTurnCount + summary.gpsOnlyTurnCount).coerceAtLeast(1)
        val percent = (summary.gyroCorroboratedTurnCount * 100.0 / totalClassified).roundToInt().coerceIn(0, 100)
        val label = when {
            totalClassified < 3 -> "عينة معايرة صغيرة"
            percent >= 75 -> "توافق حساسات مرتفع"
            percent >= 45 -> "توافق حساسات متوسط"
            else -> "تحتاج معايرة ميدانية"
        }
        val explanation = when {
            totalClassified < 3 -> "عدد الانعطافات المرصودة قليل؛ لا نستنتج جودة نهائية من عينة صغيرة."
            percent >= 75 -> "معظم انعطافات GPS الحادة تزامنت مع حركة دورانية قوية من Gyroscope. هذا يزيد الثقة في القياس، لكنه لا يغيّر الدرجة تلقائيًا."
            percent >= 45 -> "بعض انعطافات GPS الحادة تأكدت بالحساس وبعضها لم يتأكد. راجع موضع الهاتف وجودة GPS قبل الاعتماد على النتيجة."
            else -> "عدد كبير من انعطافات GPS لم يجد دعمًا قريبًا من Gyroscope. قد يكون السبب موضع الهاتف أو جودة GPS؛ لذلك تبقى هذه بيانات معايرة فقط."
        }
        return SafeDriveSensorConfidenceResult(label, explanation, percent)
    }

    fun liveLabel(state: SafeDriveSensorFusionState): String = when {
        !state.active -> "الحساسات غير نشطة"
        !state.gyroscopeAvailable -> "Gyroscope غير متاح — القياس الأساسي مستمر"
        state.gpsHardTurnCount == 0 -> "GPS + Gyroscope نشطان — بانتظار عينة انعطاف"
        else -> "GPS + Gyroscope نشطان — تأكيد ${state.gyroCorroboratedTurnCount}/${state.gpsHardTurnCount} من الانعطافات المرصودة"
    }
}
