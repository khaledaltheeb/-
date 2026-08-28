package org.healthrenewal.rawafid;

import android.content.Context;
import android.content.SharedPreferences;

/** Non-sensitive UI preferences. App backup is disabled globally. */
public final class ReadingModeStore {
    private static final String PREFS="rawafid_reading_mode_v1";
    private ReadingModeStore(){}

    public static ReadingMode.Settings load(Context context){
        SharedPreferences p=context.getApplicationContext().getSharedPreferences(PREFS,Context.MODE_PRIVATE);
        return new ReadingMode.Settings(
                p.getInt("text_scale",100),
                p.getInt("line_height",155),
                p.getBoolean("high_contrast",false),
                p.getBoolean("night",false));
    }

    public static void save(Context context,ReadingMode.Settings settings){
        ReadingMode.Settings s=settings==null?ReadingMode.Settings.defaults():settings;
        context.getApplicationContext().getSharedPreferences(PREFS,Context.MODE_PRIVATE).edit()
                .putInt("text_scale",s.textScale)
                .putInt("line_height",s.lineHeight)
                .putBoolean("high_contrast",s.highContrast)
                .putBoolean("night",s.night)
                .apply();
    }

    public static void reset(Context context){
        context.getApplicationContext().getSharedPreferences(PREFS,Context.MODE_PRIVATE).edit().clear().apply();
    }
}
