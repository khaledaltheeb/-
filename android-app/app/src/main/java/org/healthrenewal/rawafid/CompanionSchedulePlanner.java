package org.healthrenewal.rawafid;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZonedDateTime;

/** Pure scheduling logic for the next automatic Rafiqa notification. */
public final class CompanionSchedulePlanner {
    private static final int INITIAL_DELAY_MINUTES = 15;

    private CompanionSchedulePlanner(){}

    public static long nextTriggerMillis(
            boolean enabled,
            ZonedDateTime now,
            int startHour,
            int endHour,
            int currentCount,
            int dailyLimit,
            String counterDay,
            long lastSentAtMillis,
            int intervalHours) {
        if(!enabled || now==null) return 0L;

        int start=clamp(startHour,0,23);
        int end=clamp(endHour,0,23);
        int limit=clamp(dailyLimit,1,12);
        int interval=clamp(intervalHours,1,12);
        int count=Math.max(0,currentCount);

        ZonedDateTime candidate=now.plusMinutes(INITIAL_DELAY_MINUTES).withSecond(0).withNano(0);
        if(lastSentAtMillis>0L){
            ZonedDateTime gapEnd=Instant.ofEpochMilli(lastSentAtMillis)
                    .atZone(now.getZone())
                    .plusHours(interval);
            if(gapEnd.isAfter(candidate)) candidate=gapEnd.withSecond(0).withNano(0);
        }

        for(int guard=0;guard<12;guard++){
            LocalDate day=candidate.toLocalDate();
            int effectiveCount=day.toString().equals(counterDay)?count:0;
            if(effectiveCount>=limit){
                candidate=nextDayEntry(day.plusDays(1),start,end,now);
                continue;
            }

            ZonedDateTime inWindow=moveIntoAllowedWindow(candidate,start,end);
            if(!inWindow.toLocalDate().equals(day)){
                candidate=inWindow;
                continue;
            }
            return inWindow.toInstant().toEpochMilli();
        }
        return 0L;
    }

    static ZonedDateTime moveIntoAllowedWindow(ZonedDateTime candidate,int start,int end){
        if(start==end) return candidate;
        int hour=candidate.getHour();

        if(start<end){
            if(hour<start) return candidate.toLocalDate().atTime(start,0).atZone(candidate.getZone());
            if(hour>=end) return candidate.toLocalDate().plusDays(1).atTime(start,0).atZone(candidate.getZone());
            return candidate;
        }

        // Cross-midnight window, for example 22:00 -> 07:00.
        if(hour>=start || hour<end) return candidate;
        return candidate.toLocalDate().atTime(start,0).atZone(candidate.getZone());
    }

    private static ZonedDateTime nextDayEntry(LocalDate day,int start,int end,ZonedDateTime reference){
        if(start==end) return day.atStartOfDay(reference.getZone());
        return day.atTime(start,0).atZone(reference.getZone());
    }

    private static int clamp(int value,int min,int max){ return Math.max(min,Math.min(max,value)); }
}
