package org.healthrenewal.rawafid;

public final class CompanionPolicy {
    private CompanionPolicy(){}

    public static boolean withinWindow(int hour,int start,int end){
        hour=clampHour(hour); start=clampHour(start); end=clampHour(end);
        if(start==end) return true;
        if(start<end) return hour>=start && hour<end;
        return hour>=start || hour<end;
    }

    public static boolean gapSatisfied(long nowMillis,long lastSentMillis,int intervalHours){
        if(lastSentMillis<=0L) return true;
        long gap=Math.max(1,Math.min(12,intervalHours))*60L*60L*1000L;
        return nowMillis>=lastSentMillis && nowMillis-lastSentMillis>=gap;
    }

    public static boolean canSend(boolean enabled,int hour,int start,int end,int sentToday,int dailyLimit,long nowMillis,long lastSentMillis,int intervalHours){
        if(!enabled) return false;
        if(!withinWindow(hour,start,end)) return false;
        if(sentToday>=Math.max(1,Math.min(12,dailyLimit))) return false;
        return gapSatisfied(nowMillis,lastSentMillis,intervalHours);
    }

    public static String periodKey(int hour){
        int h=clampHour(hour);
        if(h<9)return "morning_start";
        if(h<11)return "morning";
        if(h<13)return "late_morning";
        if(h<15)return "midday";
        if(h<17)return "afternoon";
        if(h<19)return "early_evening";
        if(h<22)return "evening";
        return "bedtime";
    }

    private static int clampHour(int h){ return Math.max(0,Math.min(23,h)); }
}
