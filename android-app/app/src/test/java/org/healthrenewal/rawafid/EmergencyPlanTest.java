package org.healthrenewal.rawafid;

import static org.junit.Assert.*;
import org.junit.Test;
import java.util.Arrays;
import java.util.List;

public class EmergencyPlanTest {
    @Test public void contactRoundTripPreservesChannels(){
        EmergencyPlan.Contact c=new EmergencyPlan.Contact("ابنتي","+962 79 123 4567","care@example.org",true,true,true,true);
        String encoded=EmergencyPlan.encodeContacts(Arrays.asList(c));
        List<EmergencyPlan.Contact> decoded=EmergencyPlan.decodeContacts(encoded);
        assertEquals(1,decoded.size());
        assertEquals("ابنتي",decoded.get(0).name);
        assertEquals("+962 79 123 4567",decoded.get(0).phone);
        assertTrue(decoded.get(0).callEnabled);
        assertTrue(decoded.get(0).smsEnabled);
        assertTrue(decoded.get(0).whatsappEnabled);
        assertTrue(decoded.get(0).emailEnabled);
    }

    @Test public void whatsappNumberKeepsCountryCodeDigits(){
        assertEquals("962791234567",EmergencyPlan.whatsappNumber("+962 79-123-4567"));
    }

    @Test public void messageIncludesLocationOnlyWhenAvailable(){
        assertEquals("أحتاج مساعدة",EmergencyPlan.buildMessage("أحتاج مساعدة",""));
        String with=EmergencyPlan.buildMessage("أحتاج مساعدة","https://maps.google.com/?q=31.9,35.9");
        assertTrue(with.contains("أحتاج مساعدة"));
        assertTrue(with.contains("موقعي الحالي"));
        assertTrue(with.contains("31.9,35.9"));
    }

    @Test public void emptyMessageGetsSafeFallback(){
        assertEquals(EmergencyPlan.DEFAULT_MESSAGE,EmergencyPlan.buildMessage("   ",""));
    }

    @Test public void invalidContactIsNotPersisted(){
        EmergencyPlan.Contact empty=new EmergencyPlan.Contact("","","",true,true,true,true);
        assertFalse(empty.hasAnyAction());
        assertTrue(EmergencyPlan.decodeContacts(EmergencyPlan.encodeContacts(Arrays.asList(empty))).isEmpty());
    }

    @Test public void basicEmailValidation(){
        assertTrue(EmergencyPlan.looksLikeEmail("care@example.org"));
        assertFalse(EmergencyPlan.looksLikeEmail("care example.org"));
        assertFalse(EmergencyPlan.looksLikeEmail("care@example"));
    }
}
