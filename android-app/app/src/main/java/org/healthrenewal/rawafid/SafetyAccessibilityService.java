package org.healthrenewal.rawafid;

import android.accessibilityservice.AccessibilityService;
import android.os.Build;
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

    @Override protected boolean onKeyEvent(KeyEvent event){
        if(event==null||event.getAction()!=KeyEvent.ACTION_DOWN||event.getRepeatCount()!=0) return false;
        if(!SafetyTriggerConfig.supportedKey(event.getKeyCode())) return false;

        SecurePrefs prefs=new SecurePrefs(this);
        if(!prefs.isEmergencyShortcutEnabled()) return false;

        long now=SystemClock.elapsedRealtime();
        int window=SafetyTriggerConfig.clampWindowMs(prefs.getEmergencyShortcutWindowMs());
        if(sequenceStartedAt==0L||now-sequenceStartedAt>window){
            keys.clear();
            sequenceStartedAt=now;
        }
        keys.add(event.getKeyCode());
        int required=SafetyTriggerConfig.clampPresses(prefs.getEmergencyShortcutPresses());
        while(keys.size()>required) keys.remove(0);

        if(SafetyTriggerConfig.matches(keys,prefs.getEmergencyShortcutPattern(),required)){
            keys.clear();
            sequenceStartedAt=0L;
            if(now-lastTriggerAt>5000L){
                lastTriggerAt=now;
                acknowledge();
                EmergencyActionDispatcher.dispatch(this,"volume_shortcut");
            }
        }
        return false;
    }

    private void acknowledge(){
        try {
            Vibrator vibrator=(Vibrator)getSystemService(VIBRATOR_SERVICE);
            if(vibrator==null||!vibrator.hasVibrator()) return;
            if(Build.VERSION.SDK_INT>=26) vibrator.vibrate(VibrationEffect.createWaveform(new long[]{0,90,70,160},-1));
            else vibrator.vibrate(new long[]{0,90,70,160},-1);
        } catch(Exception ignored){}
    }

    @Override public void onAccessibilityEvent(AccessibilityEvent event){ /* Intentionally unused. */ }
    @Override public void onInterrupt(){ keys.clear(); sequenceStartedAt=0L; }
}