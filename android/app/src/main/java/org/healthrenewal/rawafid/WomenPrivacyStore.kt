package org.healthrenewal.rawafid

import android.app.KeyguardManager
import android.content.Context

object WomenPrivacyStore {
    private const val PREFS = "rawafid_women_privacy_v1"
    private const val ENABLED = "enabled"
    private const val LAST_UNLOCKED = "last_unlocked_at"
    private const val TIMEOUT_MINUTES = "timeout_minutes"
    private const val SETUP_SEEN = "setup_seen"

    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun enabled(context: Context): Boolean = prefs(context).getBoolean(ENABLED, false)

    fun setEnabled(context: Context, enabled: Boolean) {
        prefs(context).edit().putBoolean(ENABLED, enabled).apply()
        if (!enabled) markUnlocked(context)
    }

    fun setupSeen(context: Context): Boolean = prefs(context).getBoolean(SETUP_SEEN, false)

    fun markSetupSeen(context: Context) {
        prefs(context).edit().putBoolean(SETUP_SEEN, true).apply()
    }

    fun canUseDeviceLock(context: Context): Boolean {
        val manager = context.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
        return manager?.isDeviceSecure == true
    }

    fun timeoutMinutes(context: Context): Int = prefs(context).getInt(TIMEOUT_MINUTES, 5).coerceIn(1, 60)

    fun setTimeoutMinutes(context: Context, minutes: Int) {
        prefs(context).edit().putInt(TIMEOUT_MINUTES, minutes.coerceIn(1, 60)).apply()
    }

    fun markUnlocked(context: Context) {
        prefs(context).edit().putLong(LAST_UNLOCKED, System.currentTimeMillis()).apply()
    }

    fun lockNow(context: Context) {
        prefs(context).edit().putLong(LAST_UNLOCKED, 0L).apply()
    }

    fun sessionUnlocked(context: Context): Boolean {
        if (!enabled(context)) return true
        val last = prefs(context).getLong(LAST_UNLOCKED, 0L)
        val now = System.currentTimeMillis()
        if (last <= 0L || now < last) return false
        return now - last <= timeoutMinutes(context) * 60_000L
    }
}
