package org.healthrenewal.basira.voice

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class VoiceCommandsTest {
    @Test fun understandsArabicNavigationCommands() {
        assertTrue(ArabicVoiceCommandInterpreter.interpret("ماذا أمامي؟") is VoiceCommand.DescribeAhead)
        assertTrue(ArabicVoiceCommandInterpreter.interpret("شو أمامي") is VoiceCommand.DescribeAhead)
        assertTrue(ArabicVoiceCommandInterpreter.interpret("أعد التعليمات") is VoiceCommand.RepeatGuidance)
        assertTrue(ArabicVoiceCommandInterpreter.interpret("كم تبقى") is VoiceCommand.Remaining)
        assertTrue(ArabicVoiceCommandInterpreter.interpret("قديش باقي") is VoiceCommand.Remaining)
        assertTrue(ArabicVoiceCommandInterpreter.interpret("توقف الآن") is VoiceCommand.Stop)
        assertTrue(ArabicVoiceCommandInterpreter.interpret("نعم استعمل") is VoiceCommand.Yes)
        assertTrue(ArabicVoiceCommandInterpreter.interpret("لا، ليس الآن") is VoiceCommand.No)
    }

    @Test fun doesNotTreatAppWarningAsUserStop() {
        assertTrue(ArabicVoiceCommandInterpreter.interpret("توقف يوجد خطر قريب امامك") is VoiceCommand.Unknown)
        assertTrue(ArabicVoiceCommandInterpreter.interpret("تم إيقاف الوضع الحي") is VoiceCommand.Unknown)
    }

    @Test fun supportsHandsFreeLiveAndRoomDestinations() {
        assertTrue(ArabicVoiceCommandInterpreter.interpret("بصيرة فعل الوضع الحي") is VoiceCommand.StartLive)
        assertTrue(ArabicVoiceCommandInterpreter.interpret("يا بصيرة شغلي الكاميرا") is VoiceCommand.StartLive)

        val bathroom = ArabicVoiceCommandInterpreter.interpret("خذني إلى الحمام") as VoiceCommand.NavigateTo
        assertEquals("الحمام", bathroom.destination)

        val kitchen = ArabicVoiceCommandInterpreter.interpret("المطبخ") as VoiceCommand.NavigateTo
        assertEquals("المطبخ", kitchen.destination)

        val kitchenAttachedLam = ArabicVoiceCommandInterpreter.interpret("وديني للمطبخ") as VoiceCommand.NavigateTo
        assertEquals("المطبخ", kitchenAttachedLam.destination)

        val bedroom = ArabicVoiceCommandInterpreter.interpret("روح على غرفة النوم") as VoiceCommand.NavigateTo
        assertEquals("غرفة النوم", bedroom.destination)

        val living = ArabicVoiceCommandInterpreter.interpret("وصلني لغرفة المعيشة") as VoiceCommand.NavigateTo
        assertEquals("غرفة المعيشة", living.destination)
    }
}
