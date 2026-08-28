package org.healthrenewal.rawafid;

import static org.junit.Assert.*;
import org.junit.Test;

public class ReadingModeTest {
    @Test public void settingsAreClamped(){
        ReadingMode.Settings s=new ReadingMode.Settings(500,20,true,true);
        assertEquals(ReadingMode.MAX_TEXT_SCALE,s.textScale);
        assertEquals(ReadingMode.MIN_LINE_HEIGHT,s.lineHeight);
    }

    @Test public void defaultsAreReadableAndNonNight(){
        ReadingMode.Settings s=ReadingMode.Settings.defaults();
        assertEquals(100,s.textScale);
        assertEquals(155,s.lineHeight);
        assertFalse(s.highContrast);
        assertFalse(s.night);
    }

    @Test public void scriptContainsOnlyBoundedNumericPreferences(){
        String js=ReadingMode.webScript(new ReadingMode.Settings(130,180,false,false));
        assertTrue(js.contains("font-size:130%"));
        assertTrue(js.contains("line-height:1.8"));
        assertTrue(js.contains("rawafid-reading-mode-v1"));
    }

    @Test public void nightModeUsesDarkPalette(){
        String js=ReadingMode.webScript(new ReadingMode.Settings(100,155,false,true));
        assertTrue(js.contains("#121817"));
        assertTrue(js.contains("brightness(.88)"));
    }
}
