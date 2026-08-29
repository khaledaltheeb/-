package org.healthrenewal.rawafid;

import static org.junit.Assert.*;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import org.junit.Test;

public class CompanionSchedulePlannerTest {
    private final ZoneId zone=ZoneId.of("Asia/Amman");

    @Test public void disabledHasNoAlarm(){
        long next=CompanionSchedulePlanner.nextTriggerMillis(false,ZonedDateTime.of(2026,8,29,10,0,0,0,zone),8,22,0,4,"2026-08-29",0L,4);
        assertEquals(0L,next);
    }

    @Test public void insideWindowSchedulesWithoutOpeningApp(){
        ZonedDateTime now=ZonedDateTime.of(2026,8,29,10,0,0,0,zone);
        long next=CompanionSchedulePlanner.nextTriggerMillis(true,now,8,22,0,4,"2026-08-29",0L,4);
        assertEquals(now.plusMinutes(15).withSecond(0).withNano(0).toInstant().toEpochMilli(),next);
    }

    @Test public void beforeWindowMovesToStart(){
        ZonedDateTime now=ZonedDateTime.of(2026,8,29,6,0,0,0,zone);
        long next=CompanionSchedulePlanner.nextTriggerMillis(true,now,8,22,0,4,"2026-08-29",0L,4);
        assertEquals(ZonedDateTime.of(2026,8,29,8,0,0,0,zone).toInstant().toEpochMilli(),next);
    }

    @Test public void afterWindowMovesToTomorrow(){
        ZonedDateTime now=ZonedDateTime.of(2026,8,29,23,0,0,0,zone);
        long next=CompanionSchedulePlanner.nextTriggerMillis(true,now,8,22,0,4,"2026-08-29",0L,4);
        assertEquals(ZonedDateTime.of(2026,8,30,8,0,0,0,zone).toInstant().toEpochMilli(),next);
    }

    @Test public void respectsMinimumGap(){
        ZonedDateTime now=ZonedDateTime.of(2026,8,29,10,0,0,0,zone);
        long last=ZonedDateTime.of(2026,8,29,9,30,0,0,zone).toInstant().toEpochMilli();
        long next=CompanionSchedulePlanner.nextTriggerMillis(true,now,8,22,1,4,"2026-08-29",last,4);
        assertEquals(ZonedDateTime.of(2026,8,29,13,30,0,0,zone).toInstant().toEpochMilli(),next);
    }

    @Test public void dailyCapMovesToNextDay(){
        ZonedDateTime now=ZonedDateTime.of(2026,8,29,14,0,0,0,zone);
        long next=CompanionSchedulePlanner.nextTriggerMillis(true,now,8,22,4,4,"2026-08-29",0L,4);
        assertEquals(ZonedDateTime.of(2026,8,30,8,0,0,0,zone).toInstant().toEpochMilli(),next);
    }

    @Test public void crossMidnightWindowWorks(){
        ZonedDateTime now=ZonedDateTime.of(2026,8,29,23,15,0,0,zone);
        long next=CompanionSchedulePlanner.nextTriggerMillis(true,now,22,7,0,4,"2026-08-29",0L,4);
        assertEquals(now.plusMinutes(15).withSecond(0).withNano(0).toInstant().toEpochMilli(),next);
    }

    @Test public void allDayWindowWorks(){
        ZonedDateTime now=ZonedDateTime.of(2026,8,29,3,15,0,0,zone);
        long next=CompanionSchedulePlanner.nextTriggerMillis(true,now,8,8,0,4,"2026-08-29",0L,4);
        assertEquals(now.plusMinutes(15).withSecond(0).withNano(0).toInstant().toEpochMilli(),next);
    }
}
