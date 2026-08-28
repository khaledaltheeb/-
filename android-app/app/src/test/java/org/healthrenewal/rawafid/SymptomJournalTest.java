package org.healthrenewal.rawafid;

import static org.junit.Assert.*;
import org.junit.Test;
import java.util.ArrayList;
import java.util.List;

public class SymptomJournalTest {
    @Test public void roundTripPreservesUserReportedFields(){
        List<SymptomJournal.Entry> entries=new ArrayList<>();
        entries.add(new SymptomJournal.Entry("evt_1001",1000L,"صداع",7,"بعد يوم طويل","الراحة","ملاحظة"));
        List<SymptomJournal.Entry> decoded=SymptomJournal.decode(SymptomJournal.encode(entries));
        assertEquals(1,decoded.size());
        assertEquals("صداع",decoded.get(0).symptom);
        assertEquals(7,decoded.get(0).intensity);
        assertEquals("بعد يوم طويل",decoded.get(0).context);
    }

    @Test public void intensityIsClampedToUserScale(){
        assertEquals(10,new SymptomJournal.Entry("evt_1001",1,"أ",50,"","","").intensity);
        assertEquals(0,new SymptomJournal.Entry("evt_1002",1,"أ",-5,"","","").intensity);
    }

    @Test public void invalidEntriesAreDropped(){
        List<SymptomJournal.Entry> entries=new ArrayList<>();
        entries.add(new SymptomJournal.Entry("x",0,"",5,"","","") );
        assertTrue(SymptomJournal.decode(SymptomJournal.encode(entries)).isEmpty());
    }

    @Test public void summaryExplicitlyAvoidsDiagnosisAndTreatmentChange(){
        List<SymptomJournal.Entry> entries=new ArrayList<>();
        entries.add(new SymptomJournal.Entry("evt_1001",1000L,"دوخة",4,"عند الوقوف","الجلوس",""));
        String summary=SymptomJournal.summary(entries,10);
        assertTrue(summary.contains("وصفي"));
        assertTrue(summary.contains("لا يحدد سببًا أو تشخيصًا"));
        assertTrue(summary.contains("لا يقترح تغيير علاج"));
    }
}
