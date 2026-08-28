package org.healthrenewal.rawafid;

import static org.junit.Assert.*;
import java.time.LocalDate;
import org.junit.Test;

public final class CycleCalculatorTest {
    @Test public void estimatesNextPeriodAndOvulation(){
        LocalDate start=LocalDate.of(2026,8,1);
        CycleCalculator.Estimate e=CycleCalculator.estimate(start,28,LocalDate.of(2026,8,10));
        assertEquals(LocalDate.of(2026,8,29),e.nextPeriod);
        assertEquals(LocalDate.of(2026,8,15),e.estimatedOvulation);
        assertEquals(LocalDate.of(2026,8,10),e.fertileWindowStart);
        assertEquals(LocalDate.of(2026,8,16),e.fertileWindowEnd);
        assertEquals(19,e.daysUntilNext);
    }

    @Test public void advancesEstimateWhenSeveralCyclesPassed(){
        CycleCalculator.Estimate e=CycleCalculator.estimate(LocalDate.of(2026,1,1),28,LocalDate.of(2026,3,10));
        assertFalse(e.nextPeriod.isBefore(LocalDate.of(2026,3,10)));
        assertTrue(e.daysUntilNext>=0);
    }

    @Test(expected=IllegalArgumentException.class)
    public void rejectsFutureRecordedStart(){
        CycleCalculator.estimate(LocalDate.of(2026,9,1),28,LocalDate.of(2026,8,28));
    }

    @Test public void clampsCycleLengthToSupportedRange(){
        CycleCalculator.Estimate shortCycle=CycleCalculator.estimate(LocalDate.of(2026,8,1),10,LocalDate.of(2026,8,2));
        CycleCalculator.Estimate longCycle=CycleCalculator.estimate(LocalDate.of(2026,8,1),80,LocalDate.of(2026,8,2));
        assertEquals(LocalDate.of(2026,8,22),shortCycle.nextPeriod);
        assertEquals(LocalDate.of(2026,9,15),longCycle.nextPeriod);
    }
}
