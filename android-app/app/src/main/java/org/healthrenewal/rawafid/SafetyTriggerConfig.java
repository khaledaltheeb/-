package org.healthrenewal.rawafid;

import android.view.KeyEvent;
import java.util.ArrayList;
import java.util.List;

/** Pure helpers for the optional user-configured SOS hardware shortcut. */
public final class SafetyTriggerConfig {
    public static final String PATTERN_VOLUME_UP="volume_up";
    public static final String PATTERN_VOLUME_DOWN="volume_down";
    public static final String PATTERN_ALTERNATE="alternate";
    /** Two different volume keys pressed within a deliberately short interval. */
    public static final String PATTERN_VOLUME_CHORD="volume_chord";

    public static final String ACTION_CARD="card";
    public static final String ACTION_CENTER="center";
    public static final String ACTION_CALL_PRIMARY="call_primary";
    public static final String ACTION_SMS_PRIMARY="sms_primary";
    public static final String ACTION_WHATSAPP_PRIMARY="whatsapp_primary";

    public static final int MIN_PRESSES=2;
    public static final int MAX_PRESSES=6;
    public static final int MIN_WINDOW_MS=800;
    public static final int MAX_WINDOW_MS=5000;
    public static final int DEFAULT_WINDOW_MS=2200;
    public static final int CHORD_WINDOW_MS=650;

    private SafetyTriggerConfig(){}

    public static boolean supportedKey(int keyCode){
        return keyCode==KeyEvent.KEYCODE_VOLUME_UP || keyCode==KeyEvent.KEYCODE_VOLUME_DOWN;
    }

    public static int clampPresses(int value){
        return Math.max(MIN_PRESSES,Math.min(MAX_PRESSES,value));
    }

    public static int clampWindowMs(int value){
        return Math.max(MIN_WINDOW_MS,Math.min(MAX_WINDOW_MS,value));
    }

    public static String normalizePattern(String pattern){
        if(PATTERN_VOLUME_DOWN.equals(pattern)||PATTERN_ALTERNATE.equals(pattern)||PATTERN_VOLUME_CHORD.equals(pattern)) return pattern;
        return PATTERN_VOLUME_UP;
    }

    public static String normalizeAction(String action){
        if(ACTION_CENTER.equals(action)
                || ACTION_CALL_PRIMARY.equals(action)
                || ACTION_SMS_PRIMARY.equals(action)
                || ACTION_WHATSAPP_PRIMARY.equals(action)) return action;
        return ACTION_CARD;
    }

    /**
     * Matches only the tail of the received key stream. The service always returns false from
     * onKeyEvent(), so normal volume behavior remains intact.
     */
    public static boolean matches(List<Integer> keyCodes,String pattern,int requiredPresses){
        if(keyCodes==null) return false;
        String normalized=normalizePattern(pattern);
        if(PATTERN_VOLUME_CHORD.equals(normalized)) return false; // Chords require timing; see matchesChord().
        int presses=clampPresses(requiredPresses);
        if(keyCodes.size()<presses) return false;
        int start=keyCodes.size()-presses;
        if(PATTERN_VOLUME_UP.equals(normalized)){
            for(int i=start;i<keyCodes.size();i++) if(keyCodes.get(i)!=KeyEvent.KEYCODE_VOLUME_UP) return false;
            return true;
        }
        if(PATTERN_VOLUME_DOWN.equals(normalized)){
            for(int i=start;i<keyCodes.size();i++) if(keyCodes.get(i)!=KeyEvent.KEYCODE_VOLUME_DOWN) return false;
            return true;
        }
        // Alternating means either Up/Down/Up/... or Down/Up/Down/....
        for(int i=start+1;i<keyCodes.size();i++) if(keyCodes.get(i).equals(keyCodes.get(i-1))) return false;
        return true;
    }

    public static boolean matchesChord(int previousKey,int currentKey,long deltaMs){
        return supportedKey(previousKey)
                && supportedKey(currentKey)
                && previousKey!=currentKey
                && deltaMs>=0L
                && deltaMs<=CHORD_WINDOW_MS;
    }

    public static List<Integer> tail(List<Integer> values,int max){
        ArrayList<Integer> out=new ArrayList<>();
        if(values==null||max<=0) return out;
        int start=Math.max(0,values.size()-max);
        for(int i=start;i<values.size();i++) out.add(values.get(i));
        return out;
    }

    public static String patternLabel(String pattern){
        String normalized=normalizePattern(pattern);
        if(PATTERN_VOLUME_DOWN.equals(normalized)) return "خفض الصوت";
        if(PATTERN_ALTERNATE.equals(normalized)) return "رفع وخفض الصوت بالتبادل";
        if(PATTERN_VOLUME_CHORD.equals(normalized)) return "رفع + خفض الصوت معًا";
        return "رفع الصوت";
    }
}