package org.healthrenewal.rawafid;

import android.view.KeyEvent;
import org.junit.Test;
import java.util.Arrays;
import static org.junit.Assert.*;

public final class SafetyTriggerConfigTest {
    @Test public void matchesRepeatedVolumeUp(){
        assertTrue(SafetyTriggerConfig.matches(Arrays.asList(KeyEvent.KEYCODE_VOLUME_UP,KeyEvent.KEYCODE_VOLUME_UP,KeyEvent.KEYCODE_VOLUME_UP),SafetyTriggerConfig.PATTERN_VOLUME_UP,3));
        assertFalse(SafetyTriggerConfig.matches(Arrays.asList(KeyEvent.KEYCODE_VOLUME_UP,KeyEvent.KEYCODE_VOLUME_DOWN,KeyEvent.KEYCODE_VOLUME_UP),SafetyTriggerConfig.PATTERN_VOLUME_UP,3));
    }

    @Test public void matchesRepeatedVolumeDown(){
        assertTrue(SafetyTriggerConfig.matches(Arrays.asList(KeyEvent.KEYCODE_VOLUME_DOWN,KeyEvent.KEYCODE_VOLUME_DOWN,KeyEvent.KEYCODE_VOLUME_DOWN,KeyEvent.KEYCODE_VOLUME_DOWN),SafetyTriggerConfig.PATTERN_VOLUME_DOWN,4));
    }

    @Test public void matchesAlternatingEitherDirection(){
        assertTrue(SafetyTriggerConfig.matches(Arrays.asList(KeyEvent.KEYCODE_VOLUME_UP,KeyEvent.KEYCODE_VOLUME_DOWN,KeyEvent.KEYCODE_VOLUME_UP),SafetyTriggerConfig.PATTERN_ALTERNATE,3));
        assertTrue(SafetyTriggerConfig.matches(Arrays.asList(KeyEvent.KEYCODE_VOLUME_DOWN,KeyEvent.KEYCODE_VOLUME_UP,KeyEvent.KEYCODE_VOLUME_DOWN),SafetyTriggerConfig.PATTERN_ALTERNATE,3));
        assertFalse(SafetyTriggerConfig.matches(Arrays.asList(KeyEvent.KEYCODE_VOLUME_DOWN,KeyEvent.KEYCODE_VOLUME_DOWN,KeyEvent.KEYCODE_VOLUME_UP),SafetyTriggerConfig.PATTERN_ALTERNATE,3));
    }

    @Test public void matchesNearSimultaneousChordEitherDirection(){
        assertTrue(SafetyTriggerConfig.matchesChord(KeyEvent.KEYCODE_VOLUME_UP,KeyEvent.KEYCODE_VOLUME_DOWN,200));
        assertTrue(SafetyTriggerConfig.matchesChord(KeyEvent.KEYCODE_VOLUME_DOWN,KeyEvent.KEYCODE_VOLUME_UP,650));
        assertFalse(SafetyTriggerConfig.matchesChord(KeyEvent.KEYCODE_VOLUME_UP,KeyEvent.KEYCODE_VOLUME_DOWN,651));
        assertFalse(SafetyTriggerConfig.matchesChord(KeyEvent.KEYCODE_VOLUME_UP,KeyEvent.KEYCODE_VOLUME_UP,100));
        assertFalse(SafetyTriggerConfig.matches(Arrays.asList(KeyEvent.KEYCODE_VOLUME_UP,KeyEvent.KEYCODE_VOLUME_DOWN),SafetyTriggerConfig.PATTERN_VOLUME_CHORD,2));
    }

    @Test public void clampsUnsafeValues(){
        assertEquals(2,SafetyTriggerConfig.clampPresses(0));
        assertEquals(6,SafetyTriggerConfig.clampPresses(99));
        assertEquals(800,SafetyTriggerConfig.clampWindowMs(100));
        assertEquals(5000,SafetyTriggerConfig.clampWindowMs(9000));
    }

    @Test public void normalizesDirectCallAction(){
        assertEquals(SafetyTriggerConfig.ACTION_CALL_PRIMARY,SafetyTriggerConfig.normalizeAction(SafetyTriggerConfig.ACTION_CALL_PRIMARY));
        assertEquals(SafetyTriggerConfig.ACTION_CARD,SafetyTriggerConfig.normalizeAction("unknown"));
    }
}