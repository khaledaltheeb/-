package org.healthrenewal.rawafid;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

public final class SecurePrefs {
    private final SharedPreferences prefs;
    public SecurePrefs(Context context) {
        try {
            MasterKey key = new MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build();
            prefs = EncryptedSharedPreferences.create(context, "rawafid_secure", key,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM);
        } catch (Exception e) { throw new IllegalStateException("Secure storage unavailable", e); }
    }
    public String getName(){ return prefs.getString("companion_name", ""); }
    public void setName(String v){ prefs.edit().putString("companion_name", v.trim()).apply(); }
    public String getSectors(){ return prefs.getString("sectors", ""); }
    public void setSectors(String v){ prefs.edit().putString("sectors", v).apply(); }
    public long getLastSeen(String key){ return prefs.getLong("seen_"+key, 0L); }
    public void setLastSeen(String key,long v){ prefs.edit().putLong("seen_"+key,v).apply(); }
    public int getCycleLength(){ return prefs.getInt("cycle_length",28); }
    public int getPeriodLength(){ return prefs.getInt("period_length",5); }
    public long getLastPeriod(){ return prefs.getLong("last_period",0L); }
    public void saveCycle(long start,int cycle,int period){ prefs.edit().putLong("last_period",start).putInt("cycle_length",cycle).putInt("period_length",period).apply(); }
}
