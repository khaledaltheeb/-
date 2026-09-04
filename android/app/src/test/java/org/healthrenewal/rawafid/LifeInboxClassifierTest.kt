package org.healthrenewal.rawafid

import org.junit.Assert.assertEquals
import org.junit.Test

class LifeInboxClassifierTest {
    @Test
    fun classifiesMedicationCapture() {
        assertEquals(LifeCaptureKind.MEDICATION, LifeInboxClassifier.classify("ذكرني بدوائي الساعة الثامنة"))
    }

    @Test
    fun classifiesAppointmentCapture() {
        assertEquals(LifeCaptureKind.APPOINTMENT, LifeInboxClassifier.classify("عندي موعد طبيب الخميس"))
    }

    @Test
    fun classifiesItemLocationCapture() {
        assertEquals(LifeCaptureKind.ITEM, LifeInboxClassifier.classify("وضعت جواز السفر في الدرج العلوي"))
    }

    @Test
    fun classifiesSafetyBeforeOtherCategories() {
        assertEquals(LifeCaptureKind.SAFETY, LifeInboxClassifier.classify("ساعدني هناك خطر وأنا أحتاج الاتصال بأمي"))
    }

    @Test
    fun fallsBackToNoteWithoutGuessing() {
        assertEquals(LifeCaptureKind.NOTE, LifeInboxClassifier.classify("فكرة أريد الرجوع إليها لاحقًا"))
    }
}
