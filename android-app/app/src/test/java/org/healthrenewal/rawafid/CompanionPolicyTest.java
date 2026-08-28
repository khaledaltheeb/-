package org.healthrenewal.rawafid;

import static org.junit.Assert.*;
import org.junit.Test;

public final class CompanionPolicyTest {
    @Test public void normalWindowHonorsStartAndExclusiveEnd(){
        assertFalse(CompanionPolicy.withinWindow(7,8,22));
        assertTrue(CompanionPolicy.withinWindow(8,8,22));
        assertTrue(CompanionPolicy.withinWindow(21,8,22));
        assertFalse(CompanionPolicy.withinWindow(22,8,22));
    }

    @Test public void overnightWindowCrossesMidnight(){
        assertTrue(CompanionPolicy.withinWindow(23,20,2));
        assertTrue(CompanionPolicy.withinWindow(1,20,2));
        assertFalse(CompanionPolicy.withinWindow(10,20,2));
    }

    @Test public void equalHoursMeanAllDay(){
        for(int h=0;h<24;h++) assertTrue(CompanionPolicy.withinWindow(h,8,8));
    }

    @Test public void gapMustBeSatisfied(){
        long fourHours=4L*60L*60L*1000L;
        long now=100_000_000L;
        assertTrue(CompanionPolicy.gapSatisfied(now,0L,4));
        assertFalse(CompanionPolicy.gapSatisfied(now,now-fourHours+1L,4));
        assertTrue(CompanionPolicy.gapSatisfied(now,now-fourHours,4));
        assertFalse(CompanionPolicy.gapSatisfied(now,now+1L,4));
    }

    @Test public void disabledOrDailyLimitBlocksSending(){
        long now=20_000_000L;
        assertFalse(CompanionPolicy.canSend(false,10,8,22,0,4,now,0,4));
        assertFalse(CompanionPolicy.canSend(true,10,8,22,4,4,now,0,4));
        assertTrue(CompanionPolicy.canSend(true,10,8,22,3,4,now,0,4));
    }

    @Test public void periodMappingCoversWholeDay(){
        assertEquals("morning_start",CompanionPolicy.periodKey(6));
        assertEquals("morning",CompanionPolicy.periodKey(9));
        assertEquals("late_morning",CompanionPolicy.periodKey(11));
        assertEquals("midday",CompanionPolicy.periodKey(13));
        assertEquals("afternoon",CompanionPolicy.periodKey(15));
        assertEquals("early_evening",CompanionPolicy.periodKey(17));
        assertEquals("evening",CompanionPolicy.periodKey(20));
        assertEquals("bedtime",CompanionPolicy.periodKey(23));
    }
}
