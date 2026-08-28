package org.healthrenewal.rawafid;

import static org.junit.Assert.*;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.Test;

public final class MessageBankTest {
    private static final String[] PERIODS={"morning_start","morning","late_morning","midday","afternoon","early_evening","evening","bedtime"};

    @Test public void bankHasExactlyOneThousandMessages(){
        assertEquals(1000,MessageBank.totalCount());
        int total=0;
        for(String period:PERIODS) total+=MessageBank.forPeriod(period).size();
        assertEquals(1000,total);
    }

    @Test public void everyPeriodHasOneHundredTwentyFiveMessages(){
        for(String period:PERIODS) assertEquals(period,125,MessageBank.forPeriod(period).size());
    }

    @Test public void generatedMessagesAreUniqueAndNonEmpty(){
        Set<String> all=new HashSet<>();
        for(String period:PERIODS){
            List<String> messages=MessageBank.forPeriod(period);
            for(String message:messages){
                assertNotNull(message);
                assertTrue(message.trim().length()>25);
                assertTrue("duplicate: "+message,all.add(message.trim()));
            }
        }
        assertEquals(1000,all.size());
    }

    @Test public void chooserAvoidsRecentlyUsedMessagesWhenAlternativesExist(){
        List<String> pool=Arrays.asList("first long test message", "second long test message", "third long test message");
        Set<Integer> recent=new HashSet<>();
        recent.add(pool.get(0).hashCode());
        recent.add(pool.get(1).hashCode());
        assertEquals(pool.get(2),MessageSelector.chooseNonRepeating(pool,recent));
    }
}
