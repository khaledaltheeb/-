package org.healthrenewal.rawafid

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.util.Calendar

object ReminderScheduler {
    private val hours = intArrayOf(8, 12, 16, 20)
    private const val PREFS = "rawafid_reminders"
    private const val ENABLED = "enabled"

    fun isEnabled(context: Context): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(ENABLED, false)

    fun enable(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(ENABLED, true).apply()
        scheduleAll(context)
    }

    fun disable(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(ENABLED, false).apply()
        val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        hours.indices.forEach { index -> manager.cancel(pendingIntent(context, index)) }
    }

    fun scheduleAll(context: Context) {
        if (!isEnabled(context)) return
        val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        hours.forEachIndexed { index, hour ->
            val first = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                if (timeInMillis <= System.currentTimeMillis()) add(Calendar.DAY_OF_YEAR, 1)
            }
            manager.setInexactRepeating(
                AlarmManager.RTC_WAKEUP,
                first.timeInMillis,
                AlarmManager.INTERVAL_DAY,
                pendingIntent(context, index)
            )
        }
    }

    private fun pendingIntent(context: Context, slot: Int): PendingIntent {
        val intent = Intent(context, ReminderReceiver::class.java).putExtra("slot", slot)
        return PendingIntent.getBroadcast(
            context,
            4100 + slot,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
