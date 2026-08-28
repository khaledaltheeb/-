package org.healthrenewal.rawafid;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

public final class MessageSelector {
    private MessageSelector(){}

    public static String chooseNonRepeating(List<String> pool,Set<Integer> recent){
        if(pool==null || pool.isEmpty()) return null;
        int start=ThreadLocalRandom.current().nextInt(pool.size());
        for(int i=0;i<pool.size();i++){
            String candidate=pool.get((start+i)%pool.size());
            if(recent==null || !recent.contains(candidate.hashCode())) return candidate;
        }
        return pool.get(start);
    }
}
