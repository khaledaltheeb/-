package org.healthrenewal.rawafid;

import android.accessibilityservice.AccessibilityService;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.KeyEvent;
import android.view.accessibility.AccessibilityEvent;
import java.util.ArrayList;
import java.util.List;

/**
 * Optional user-enabled accessibility service used only to observe volume-key SOS sequences.
 * It never reads screen contents and returns false so normal volume handling continues.
 */
public final class SafetyAccessibilityService extends AccessibilityService {
    private final List<Integer> keys=new ArrayList<>();
    private long sequenceStartedAt=0L;
    private long lastTriggerAt=0L;
    private long previousKeyAt=0L;
    private int previousKey=KeyEvent.KEYCODE_UNKNOWN;

    @Override protected boolean onKeyEvent(KeyEvent event){
        if(event==null||event.getAction()!=KeyEvent.ACTION_DOWN||event.getRepeatCount()!=0) return false;
        int currentKey=event.getKeyCode();
        if(!SafetyTriggerConfig.supportedKey(currentKey)) return false;

        SecurePrefs prefs=new SecurePrefs(this);
        if(!prefs.isEmergencyShortcutEnabled()) return false;

        long now=SystemClock.elapsedRealtime();
        String pattern=prefs.getEmergencyShortcutPattern();
        if(SafetyTriggerConfig.PATTERN_VOLUME_CHORD.equals(pattern)){
            long delta=previousKeyAt==0L?Long.MAX_VALUE:now-previousKeyAt;
            boolean match=SafetyTriggerConfig.matchesChord(previousKey,currentKey,delta);
            previousKey=currentKey;
            previousKeyAt=now;
            if(match) trigger(now,"volume_chord");
            return false;
        }

        int window=SafetyTriggerConfig.clampWindowMs(prefs.getEmergencyShortcutWindowMs());
        if(sequenceStartedAt==0L||now-sequenceStartedAt>window){
            keys.clear();
            sequenceStartedAt=now;
        }
        keys.add(currentKey);
        int required=SafetyTriggerConfig.clampPresses(prefs.getEmergencyShortcutPresses());
        while(keys.size()>required) keys.remove(0);

        if(SafetyTriggerConfig.matches(keys,pattern,required)){
            keys.clear();
            sequenceStartedAt=0L;
            trigger(now,"volume_sequence");
        }
        return false;
    }

    private void trigger(long now,String source){
        if(now-lastTriggerAt<=5000L) return;
        lastTriggerAt=now;
        keys.clear();
        sequenceStartedAt=0L;
        previousKey=KeyEvent.KEYCODE_UNKNOWN;
        previousKeyAt=0L;
        acknowledge();
        EmergencyActionDispatcher.dispatch(this,source);
    }

    private void acknowledge(){
        try {
            Vibrator vibrator=(Vibrator)getSystemService(VIBRATOR_SERVICE);
            if(vibrator==null||!vibrator.hasVibrator()) return;
            vibrator.vibrate(VibrationEffect.createWaveform(new long[]{0,90,70,160},-1));
        } catch(Exception ignored){}
    }

    @Override public void onAccessibilityEvent(AccessibilityEvent event){ /* Intentionally unused. */ }
    @Override public void onInterrupt(){
        keys.clear();
        sequenceStartedAt=0L;
        previousKey=KeyEvent.KEYCODE_UNKNOWN;
        previousKeyAt=0L;
    }
}