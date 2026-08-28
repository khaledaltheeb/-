package org.healthrenewal.rawafid;

import static org.junit.Assert.*;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.junit.Test;

public final class MoodPatternEngineTest {
    private static long at(LocalDate d){ return d.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli(); }

    @Test public void roundTripEncodingPreservesEntries(){
        List<MoodPatternEngine.Entry> input=new ArrayList<>();
        input.add(new MoodPatternEngine.Entry(1000L,2));
        input.add(new MoodPatternEngine.Entry(2000L,5));
        List<MoodPatternEngine.Entry> output=MoodPatternEngine.decode(MoodPatternEngine.encode(input));
        assertEquals(2,output.size());
        assertEquals(2,output.get(0).mood);
        assertEquals(5,output.get(1).mood);
    }

    @Test public void capsHistoryToRequestedSize(){
        List<MoodPatternEngine.Entry> list=new ArrayList<>();
        for(int i=0;i<10;i++) list=MoodPatternEngine.appendCapped(list,new MoodPatternEngine.Entry(i,i%5+1),5);
        assertEquals(5,list.size());
        assertEquals(5L,list.get(0).timestamp);
    }

    @Test public void refusesPatternClaimWithTooLittleData(){
        List<MoodPatternEngine.Entry> list=new ArrayList<>();
        for(int i=0;i<6;i++) list.add(new MoodPatternEngine.Entry(1000L+i,3));
        assertTrue(MoodPatternEngine.insight(list,null,28,LocalDate.now()).contains("سبعة"));
    }

    @Test public void describesCycleAssociationAsPreliminaryNotCausal(){
        LocalDate start=LocalDate.of(2026,8,1);
        List<MoodPatternEngine.Entry> list=new ArrayList<>();
        // Several lower mood records near the expected next period and higher records elsewhere.
        list.add(new MoodPatternEngine.Entry(at(LocalDate.of(2026,8,2)),2));
        list.add(new MoodPatternEngine.Entry(at(LocalDate.of(2026,8,8)),5));
        list.add(new MoodPatternEngine.Entry(at(LocalDate.of(2026,8,12)),5));
        list.add(new MoodPatternEngine.Entry(at(LocalDate.of(2026,8,18)),4));
        list.add(new MoodPatternEngine.Entry(at(LocalDate.of(2026,8,24)),2));
        list.add(new MoodPatternEngine.Entry(at(LocalDate.of(2026,8,25)),2));
        list.add(new MoodPatternEngine.Entry(at(LocalDate.of(2026,8,27)),1));
        list.add(new MoodPatternEngine.Entry(at(LocalDate.of(2026,8,28)),2));
        String insight=MoodPatternEngine.insight(list,start,28,LocalDate.of(2026,8,28));
        assertTrue(insight.contains("ليس") || insight.contains("أولي"));
    }
}
