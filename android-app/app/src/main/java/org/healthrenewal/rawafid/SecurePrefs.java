package org.healthrenewal.rawafid;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;
import java.util.ArrayDeque;
import java.util.HashSet;
import java.util.Set;

public final class SecurePrefs {
    private static final int RECENT_MESSAGE_LIMIT=200;
    private final SharedPreferences prefs;

    public SecurePrefs(Context context) {
        try {
            MasterKey key = new MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build();
            prefs = EncryptedSharedPreferences.create(
                    context,
                    "rawafid_secure",
                    key,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (Exception e) {
            throw new IllegalStateException("Secure storage unavailable", e);
        }
    }

    public String getName(){ return prefs.getString("companion_name", ""); }
    public void setName(String v){ prefs.edit().putString("companion_name", v == null ? "" : v.trim()).apply(); }

    public String getSectors(){ return prefs.getString("sectors", ""); }
    public void setSectors(String v){ prefs.edit().putString("sectors", v == null ? "" : v).apply(); }

    public long getLastSeen(String key){ return prefs.getLong("seen_" + key, 0L); }
    public void setLastSeen(String key,long v){ prefs.edit().putLong("seen_" + key,v).apply(); }

    public int getCycleLength(){ return prefs.getInt("cycle_length",28); }
    public int getPeriodLength(){ return prefs.getInt("period_length",5); }
    public long getLastPeriod(){ return prefs.getLong("last_period",0L); }
    public void saveCycle(long start,int cycle,int period){
        prefs.edit().putLong("last_period",start).putInt("cycle_length",cycle).putInt("period_length",period).apply();
    }

    public boolean isCompanionEnabled(){ return prefs.getBoolean("companion_enabled", false); }
    public int getCompanionDailyLimit(){ return clamp(prefs.getInt("companion_daily_limit", 4), 1, 12); }
    public int getCompanionStartHour(){ return clamp(prefs.getInt("companion_start_hour", 8), 0, 23); }
    public int getCompanionEndHour(){ return clamp(prefs.getInt("companion_end_hour", 22), 0, 23); }
    public int getCompanionIntervalHours(){ return clamp(prefs.getInt("companion_interval_hours", 4), 1, 12); }

    public void saveCompanionSchedule(boolean enabled,int dailyLimit,int startHour,int endHour,int intervalHours){
        prefs.edit()
                .putBoolean("companion_enabled", enabled)
                .putInt("companion_daily_limit", clamp(dailyLimit,1,12))
                .putInt("companion_start_hour", clamp(startHour,0,23))
                .putInt("companion_end_hour", clamp(endHour,0,23))
                .putInt("companion_interval_hours", clamp(intervalHours,1,12))
                .apply();
    }

    public long getCompanionLastAutoSentAt(){ return prefs.getLong("companion_last_auto_sent_at", 0L); }
    public String getCompanionCounterDay(){ return prefs.getString("companion_counter_day", ""); }
    public int getCompanionCounter(){ return Math.max(0, prefs.getInt("companion_counter", 0)); }

    public void markCompanionAutoSent(long timestamp,String localDay,int newCount){
        prefs.edit()
                .putLong("companion_last_auto_sent_at", timestamp)
                .putString("companion_counter_day", localDay == null ? "" : localDay)
                .putInt("companion_counter", Math.max(0,newCount))
                .apply();
    }

    public void resetCompanionCounter(String localDay){
        prefs.edit().putString("companion_counter_day", localDay == null ? "" : localDay).putInt("companion_counter",0).apply();
    }

    public Set<Integer> getRecentCompanionMessageHashes(){
        Set<Integer> out=new HashSet<>();
        String raw=prefs.getString("companion_recent_hashes","");
        if(raw==null || raw.isEmpty()) return out;
        for(String token:raw.split(",")){
            try { out.add(Integer.parseInt(token)); } catch(NumberFormatException ignored){}
        }
        return out;
    }

    public void recordCompanionMessageHash(int hash){
        String raw=prefs.getString("companion_recent_hashes","");
        ArrayDeque<Integer> queue=new ArrayDeque<>();
        if(raw!=null && !raw.isEmpty()){
            for(String token:raw.split(",")){
                try { int value=Integer.parseInt(token); if(value!=hash) queue.addLast(value); } catch(NumberFormatException ignored){}
            }
        }
        queue.addLast(hash);
        while(queue.size()>RECENT_MESSAGE_LIMIT) queue.removeFirst();
        StringBuilder encoded=new StringBuilder();
        for(Integer value:queue){ if(encoded.length()>0) encoded.append(','); encoded.append(value); }
        prefs.edit().putString("companion_recent_hashes",encoded.toString()).apply();
    }

    private static int clamp(int value,int min,int max){ return Math.max(min,Math.min(max,value)); }
}
