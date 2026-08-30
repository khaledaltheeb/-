package org.healthrenewal.rawafid

import android.Manifest
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import org.json.JSONArray
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

data class FlexibleReminderDefinition(
    val id: String,
    val title: String,
    val description: String,
    val channel: String,
    val defaultMinutes: Long,
    val minMinutes: Long,
    val maxPerDay: Int,
    val body: String
)

object FlexibleReminderCatalog {
    private const val ASSET = "rawafid_reminder_catalog.json"
    @Volatile private var cache: List<FlexibleReminderDefinition>? = null

    fun all(context: Context): List<FlexibleReminderDefinition> = cache ?: synchronized(this) {
        cache ?: runCatching {
            val raw = context.assets.open(ASSET).bufferedReader(Charsets.UTF_8).use { it.readText() }
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    add(
                        FlexibleReminderDefinition(
                            id = o.getString("id"),
                            title = o.getString("title"),
                            description = o.optString("description"),
                            channel = o.optString("channel", "daily"),
                            defaultMinutes = o.optLong("default_minutes", 120L),
                            minMinutes = o.optLong("min_minutes", 15L),
                            maxPerDay = o.optInt("max_per_day", 8).coerceAtLeast(1),
                            body = o.optString("body")
                        )
                    )
                }
            }
        }.getOrDefault(emptyList()).also { cache = it }
    }

    fun byId(context: Context, id: String): FlexibleReminderDefinition? = all(context).firstOrNull { it.id == id }
}

object FlexibleReminderStore {
    private const val PREFS = "rawafid_flexible_reminders_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun enabled(context: Context, definition: FlexibleReminderDefinition): Boolean = prefs(context).getBoolean("${definition.id}_enabled", false)
    fun setEnabled(context: Context, definition: FlexibleReminderDefinition, value: Boolean) = prefs(context).edit().putBoolean("${definition.id}_enabled", value).apply()
    fun minutes(context: Context, definition: FlexibleReminderDefinition): Long = prefs(context).getLong("${definition.id}_minutes", definition.defaultMinutes)
    fun setMinutes(context: Context, definition: FlexibleReminderDefinition, value: Long) = prefs(context).edit().putLong("${definition.id}_minutes", value.coerceAtLeast(definition.minMinutes)).apply()
    fun maxPerDay(context: Context, definition: FlexibleReminderDefinition): Int = prefs(context).getInt("${definition.id}_max", definition.maxPerDay).coerceIn(1, definition.maxPerDay)
    fun setMaxPerDay(context: Context, definition: FlexibleReminderDefinition, value: Int) = prefs(context).edit().putInt("${definition.id}_max", value.coerceIn(1, definition.maxPerDay)).apply()

    fun claim(context: Context, definition: FlexibleReminderDefinition): Boolean {
        val p = prefs(context)
        val dayKey = "${definition.id}_day"
        val countKey = "${definition.id}_count"
        val today = LocalDate.now().toString()
        val count = if (p.getString(dayKey, "") == today) p.getInt(countKey, 0) else 0
        if (count >= maxPerDay(context, definition)) return false
        p.edit().putString(dayKey, today).putInt(countKey, count + 1).apply()
        return true
    }
}

object FlexibleReminderScheduler {
    fun syncAll(context: Context) = FlexibleReminderCatalog.all(context).forEach { sync(context, it) }

    fun sync(context: Context, definition: FlexibleReminderDefinition) {
        val manager = WorkManager.getInstance(context)
        val name = "rawafid_flexible_${definition.id}"
        if (!FlexibleReminderStore.enabled(context, definition)) {
            manager.cancelUniqueWork(name)
            return
        }
        val minutes = FlexibleReminderStore.minutes(context, definition).coerceAtLeast(15L)
        val request = PeriodicWorkRequestBuilder<FlexibleReminderWorker>(minutes, TimeUnit.MINUTES)
            .setInitialDelay(minutes, TimeUnit.MINUTES)
            .setInputData(Data.Builder().putString("reminder_id", definition.id).build())
            .build()
        manager.enqueueUniquePeriodicWork(name, ExistingPeriodicWorkPolicy.UPDATE, request)
    }
}

class FlexibleReminderWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val id = inputData.getString("reminder_id") ?: return Result.success()
        val definition = FlexibleReminderCatalog.byId(applicationContext, id) ?: return Result.success()
        if (!FlexibleReminderStore.enabled(applicationContext, definition)) return Result.success()
        if (LocalStore.isQuietHour(applicationContext, LocalDateTime.now().hour)) return Result.success()
        if (!FlexibleReminderStore.claim(applicationContext, definition)) return Result.success()
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(applicationContext, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return Result.success()

        NotificationChannels.create(applicationContext)
        val channel = when (definition.channel) {
            "eye" -> NotificationChannels.EYE
            "motivation" -> NotificationChannels.MOTIVATION
            else -> NotificationChannels.DAILY
        }
        val open = PendingIntent.getActivity(
            applicationContext,
            9200 + definition.id.hashCode().and(0x0fff),
            Intent(applicationContext, CareHubActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(applicationContext, channel)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(definition.title)
            .setContentText(definition.body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(definition.body))
            .setContentIntent(open)
            .setAutoCancel(true)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .build()
        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(9300 + definition.id.hashCode().and(0x0fff), notification)
        return Result.success()
    }
}
