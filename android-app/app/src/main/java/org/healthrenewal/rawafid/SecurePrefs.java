package org.healthrenewal.rawafid;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.ArrayDeque;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** Local private state encrypted with a non-exportable Android Keystore AES-256 key. */
public final class SecurePrefs {
    private static final String PREF_FILE="rawafid_secure_v2";
    private static final String KEY_ALIAS="rawafid_local_data_aes_v1";
    private static final String TRANSFORMATION="AES/GCM/NoPadding";
    private static final int GCM_TAG_BITS=128;
    private static final int RECENT_MESSAGE_LIMIT=200;
    private static final int MOOD_HISTORY_LIMIT=180;

    private final SharedPreferences prefs;
    private final SecretKey secretKey;

    public SecurePrefs(Context context) {
        try {
            Context app=context.getApplicationContext();
            prefs=app.getSharedPreferences(PREF_FILE,Context.MODE_PRIVATE);
            secretKey=getOrCreateKey();
        } catch(Exception e) { throw new IllegalStateException("Secure local storage unavailable",e); }
    }

    private static SecretKey getOrCreateKey() throws Exception {
        KeyStore keyStore=KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        if(keyStore.containsAlias(KEY_ALIAS)){
            java.security.Key key=keyStore.getKey(KEY_ALIAS,null);
            if(key instanceof SecretKey) return (SecretKey)key;
            throw new IllegalStateException("Unexpected key type");
        }
        KeyGenerator generator=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
        KeyGenParameterSpec spec=new KeyGenParameterSpec.Builder(KEY_ALIAS,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256).build();
        generator.init(spec);
        return generator.generateKey();
    }

    private synchronized String encrypt(String plain) throws Exception {
        Cipher cipher=Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE,secretKey);
        byte[] iv=cipher.getIV();
        byte[] encrypted=cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
        return Base64.encodeToString(iv,Base64.NO_WRAP)+":"+Base64.encodeToString(encrypted,Base64.NO_WRAP);
    }

    private synchronized String decrypt(String encoded) throws Exception {
        int split=encoded.indexOf(':');
        if(split<=0 || split>=encoded.length()-1) throw new IllegalArgumentException("Invalid encrypted value");
        byte[] iv=Base64.decode(encoded.substring(0,split),Base64.NO_WRAP);
        byte[] encrypted=Base64.decode(encoded.substring(split+1),Base64.NO_WRAP);
        Cipher cipher=Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE,secretKey,new GCMParameterSpec(GCM_TAG_BITS,iv));
        return new String(cipher.doFinal(encrypted),StandardCharsets.UTF_8);
    }

    private String getString(String key,String fallback){
        String encoded=prefs.getString(key,null);
        if(encoded==null) return fallback;
        try { return decrypt(encoded); } catch(Exception ignored){ return fallback; }
    }
    private void putString(String key,String value){
        try { prefs.edit().putString(key,encrypt(value==null?"":value)).apply(); }
        catch(Exception e){ throw new IllegalStateException("Unable to protect local data",e); }
    }
    private int getInt(String key,int fallback){ try { return Integer.parseInt(getString(key,Integer.toString(fallback))); } catch(NumberFormatException ignored){ return fallback; } }
    private long getLong(String key,long fallback){ try { return Long.parseLong(getString(key,Long.toString(fallback))); } catch(NumberFormatException ignored){ return fallback; } }
    private boolean getBoolean(String key,boolean fallback){ String value=getString(key,Boolean.toString(fallback)); return "true".equalsIgnoreCase(value)?true:"false".equalsIgnoreCase(value)?false:fallback; }

    public String getName(){ return getString("companion_name",""); }
    public void setName(String v){ putString("companion_name",v==null?"":v.trim()); }
    public String getSectors(){ return getString("sectors",""); }
    public void setSectors(String v){ putString("sectors",v==null?"":v); }
    public long getLastSeen(String key){ return getLong("seen_"+key,0L); }
    public void setLastSeen(String key,long v){ putString("seen_"+key,Long.toString(v)); }

    public int getCycleLength(){ return clamp(getInt("cycle_length",28),21,45); }
    public int getPeriodLength(){ return clamp(getInt("period_length",5),2,10); }
    public long getLastPeriod(){ return getLong("last_period",0L); }
    public void saveCycle(long start,int cycle,int period){
        putString("last_period",Long.toString(Math.max(0L,start)));
        putString("cycle_length",Integer.toString(clamp(cycle,21,45)));
        putString("period_length",Integer.toString(clamp(period,2,10)));
    }

    public List<MoodPatternEngine.Entry> getMoodHistory(){ return MoodPatternEngine.decode(getString("mood_history","")); }
    public void recordMood(int mood){
        List<MoodPatternEngine.Entry> updated=MoodPatternEngine.appendCapped(getMoodHistory(),new MoodPatternEngine.Entry(System.currentTimeMillis(),mood),MOOD_HISTORY_LIMIT);
        putString("mood_history",MoodPatternEngine.encode(updated));
    }
    public void clearMoodHistory(){ putString("mood_history",""); }

    public boolean isCompanionEnabled(){ return getBoolean("companion_enabled",false); }
    public int getCompanionDailyLimit(){ return clamp(getInt("companion_daily_limit",4),1,12); }
    public int getCompanionStartHour(){ return clamp(getInt("companion_start_hour",8),0,23); }
    public int getCompanionEndHour(){ return clamp(getInt("companion_end_hour",22),0,23); }
    public int getCompanionIntervalHours(){ return clamp(getInt("companion_interval_hours",4),1,12); }
    public void saveCompanionSchedule(boolean enabled,int dailyLimit,int startHour,int endHour,int intervalHours){
        putString("companion_enabled",Boolean.toString(enabled));
        putString("companion_daily_limit",Integer.toString(clamp(dailyLimit,1,12)));
        putString("companion_start_hour",Integer.toString(clamp(startHour,0,23)));
        putString("companion_end_hour",Integer.toString(clamp(endHour,0,23)));
        putString("companion_interval_hours",Integer.toString(clamp(intervalHours,1,12)));
    }
    public long getCompanionLastAutoSentAt(){ return getLong("companion_last_auto_sent_at",0L); }
    public String getCompanionCounterDay(){ return getString("companion_counter_day",""); }
    public int getCompanionCounter(){ return Math.max(0,getInt("companion_counter",0)); }
    public void markCompanionAutoSent(long timestamp,String localDay,int newCount){
        putString("companion_last_auto_sent_at",Long.toString(Math.max(0L,timestamp)));
        putString("companion_counter_day",localDay==null?"":localDay);
        putString("companion_counter",Integer.toString(Math.max(0,newCount)));
    }
    public void resetCompanionCounter(String localDay){ putString("companion_counter_day",localDay==null?"":localDay); putString("companion_counter","0"); }

    public Set<Integer> getRecentCompanionMessageHashes(){
        Set<Integer> out=new HashSet<>(); String raw=getString("companion_recent_hashes","");
        if(raw.isEmpty()) return out;
        for(String token:raw.split(",")){ try { out.add(Integer.parseInt(token)); } catch(NumberFormatException ignored){} }
        return out;
    }
    public void recordCompanionMessageHash(int hash){
        String raw=getString("companion_recent_hashes",""); ArrayDeque<Integer> queue=new ArrayDeque<>();
        if(!raw.isEmpty()) for(String token:raw.split(",")){ try { int value=Integer.parseInt(token); if(value!=hash) queue.addLast(value); } catch(NumberFormatException ignored){} }
        queue.addLast(hash); while(queue.size()>RECENT_MESSAGE_LIMIT) queue.removeFirst();
        StringBuilder encoded=new StringBuilder(); for(Integer value:queue){ if(encoded.length()>0) encoded.append(','); encoded.append(value); }
        putString("companion_recent_hashes",encoded.toString());
    }

    // Emergency plan: local-only, encrypted with the same Android Keystore-backed store.
    public String getEmergencyMessage(){ return getString("emergency_message",EmergencyPlan.DEFAULT_MESSAGE); }
    public void setEmergencyMessage(String value){ putString("emergency_message",value==null?"":value.trim()); }
    public boolean isEmergencyLocationEnabled(){ return getBoolean("emergency_location_enabled",true); }
    public void setEmergencyLocationEnabled(boolean value){ putString("emergency_location_enabled",Boolean.toString(value)); }
    public List<EmergencyPlan.Contact> getEmergencyContacts(){ return EmergencyPlan.decodeContacts(getString("emergency_contacts","")); }
    public void setEmergencyContacts(List<EmergencyPlan.Contact> contacts){ putString("emergency_contacts",EmergencyPlan.encodeContacts(contacts)); }
    public boolean hasEmergencyPlan(){ return !getEmergencyContacts().isEmpty(); }
    public void clearEmergencyPlan(){
        putString("emergency_message","");
        putString("emergency_location_enabled","true");
        putString("emergency_contacts","");
    }

    // Library: local-only encrypted bookmarks/read-later metadata.
    public List<LocalLibrary.Item> getLibraryItems(){ return LocalLibrary.decode(getString("library_items","")); }
    public void setLibraryItems(List<LocalLibrary.Item> items){ putString("library_items",LocalLibrary.encode(items)); }
    public void saveToLibrary(String path,String title,boolean readLater){
        LocalLibrary.Item item=new LocalLibrary.Item(path,title,System.currentTimeMillis(),0L,readLater);
        if(!item.isValid()) return;
        setLibraryItems(LocalLibrary.upsert(getLibraryItems(),item));
    }
    public void removeFromLibrary(String path){ setLibraryItems(LocalLibrary.remove(getLibraryItems(),path)); }
    public void markLibraryOpened(String path){ setLibraryItems(LocalLibrary.markOpened(getLibraryItems(),path,System.currentTimeMillis())); }
    public void clearLibrary(){ putString("library_items",""); }

    // Symptom journal: observations reported by the user, kept local and encrypted.
    public List<SymptomJournal.Entry> getSymptomEntries(){ return SymptomJournal.decode(getString("symptom_journal",""); }
    public void setSymptomEntries(List<SymptomJournal.Entry> entries){ putString("symptom_journal",SymptomJournal.encode(entries)); }
    public void saveSymptomEntry(SymptomJournal.Entry entry){ if(entry!=null&&entry.isValid()) setSymptomEntries(SymptomJournal.upsert(getSymptomEntries(),entry)); }
    public void removeSymptomEntry(String id){ setSymptomEntries(SymptomJournal.remove(getSymptomEntries(),id)); }
    public void clearSymptomJournal(){ putString("symptom_journal",""); }

    public void clearSensitiveData(){ prefs.edit().clear().apply(); }
    private static int clamp(int value,int min,int max){ return Math.max(min,Math.min(max,value)); }
}
