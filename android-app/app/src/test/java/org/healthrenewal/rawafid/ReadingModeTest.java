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

    @Test public void outOfRangeValuesCannotEscapeBoundsInScript(){
        String js=ReadingMode.webScript(new ReadingMode.Settings(999,-5,false,false));
        assertTrue(js.contains("font-size:"+ReadingMode.MAX_TEXT_SCALE+"%"));
        assertTrue(js.contains("line-height:"+(ReadingMode.MIN_LINE_HEIGHT/100.0)));
        assertFalse(js.contains("font-size:999%"));
        assertFalse(js.contains("line-height:-"));
    }

    @Test public void nightModeUsesFixedReadableLocalPaletteOnly(){
        String js=ReadingMode.webScript(new ReadingMode.Settings(100,155,false,true));
        assertTrue(js.contains("#101513"));
        assertTrue(js.contains("#f7faf9"));
        assertTrue(js.contains("#202a26"));
        assertTrue(js.contains("#aebbb6"));
        assertTrue(js.contains("input,textarea,select"));
        assertTrue(js.contains("input::placeholder,textarea::placeholder"));
        assertTrue(js.contains("opacity:1!important"));
        assertTrue(js.contains("brightness(.84)"));
        assertFalse(js.contains("javascript:"));
        assertFalse(js.contains("http://"));
        assertFalse(js.contains("https://"));
    }
}
