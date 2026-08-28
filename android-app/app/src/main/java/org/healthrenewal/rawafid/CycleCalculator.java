package org.healthrenewal.rawafid;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public final class CycleCalculator {
    private CycleCalculator(){}

    public static final class Estimate {
        public final LocalDate recordedStart;
        public final LocalDate nextPeriod;
        public final LocalDate estimatedOvulation;
        public final LocalDate fertileWindowStart;
        public final LocalDate fertileWindowEnd;
        public final long daysUntilNext;

        Estimate(LocalDate recordedStart,LocalDate nextPeriod,LocalDate estimatedOvulation,LocalDate fertileWindowStart,LocalDate fertileWindowEnd,long daysUntilNext){
            this.recordedStart=recordedStart;
            this.nextPeriod=nextPeriod;
            this.estimatedOvulation=estimatedOvulation;
            this.fertileWindowStart=fertileWindowStart;
            this.fertileWindowEnd=fertileWindowEnd;
            this.daysUntilNext=daysUntilNext;
        }
    }

    public static Estimate estimate(LocalDate recordedStart,int averageCycleLength,LocalDate today){
        if(recordedStart==null || today==null) throw new IllegalArgumentException("Dates are required");
        if(recordedStart.isAfter(today)) throw new IllegalArgumentException("Cycle start cannot be in the future");
        int cycle=Math.max(21,Math.min(45,averageCycleLength));
        LocalDate next=recordedStart.plusDays(cycle);
        while(next.isBefore(today)) next=next.plusDays(cycle);
        LocalDate ovulation=next.minusDays(14);
        LocalDate fertileStart=ovulation.minusDays(5);
        LocalDate fertileEnd=ovulation.plusDays(1);
        return new Estimate(recordedStart,next,ovulation,fertileStart,fertileEnd,ChronoUnit.DAYS.between(today,next));
    }
}
