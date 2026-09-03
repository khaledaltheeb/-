package org.healthrenewal.rawafid

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import java.time.DayOfWeek
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.temporal.WeekFields
import java.util.Locale
import java.util.concurrent.TimeUnit
import kotlin.math.max

object SafeDriveWeeklyCirclePolicy {
    private const val WEEK_MS = 7L * 24 * 60 * 60_000L

    fun weekKey(nowMs: Long, zoneId: ZoneId = ZoneId.systemDefault()): String {
        val anchor = Instant.ofEpochMilli(nowMs - WEEK_MS).atZone(zoneId).toLocalDate()
        val fields = WeekFields.ISO
        val weekYear = anchor.get(fields.weekBasedYear())
        val week = anchor.get(fields.weekOfWeekBasedYear())
        return String.format(Locale.US, "%04d-W%02d", weekYear, week)
    }

    fun nextMondayNineDelayMs(nowMs: Long, zoneId: ZoneId = ZoneId.systemDefault()): Long {
        val now = Instant.ofEpochMilli(nowMs).atZone(zoneId)
        var target = now.withHour(9).withMinute(0).withSecond(0).withNano(0)
        while (target.dayOfWeek != DayOfWeek.MONDAY || !target.isAfter(now)) {
            target = target.plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0)
        }
        return max(0L, target.toInstant().toEpochMilli() - nowMs)
    }

    fun automaticSummary(summary: SafeDriveWeeklySummary): String = buildString {
        append("روافد · ملخص القيادة الآمنة الأسبوعي من هذا الجهاز\n")
        append("الرحلات: ${summary.trips} · المسافة: ${oneDecimal(summary.distanceKm)} كم · المدة: ${SafeDriveScoring.formatDuration(summary.durationMs)}\n")
        summary.averageScore?.let { append("متوسط التقييم: $it/100\n") }
        summary.harshEventsPer100Km?.let { append("مؤشرات الحركة الحادة لكل 100 كم: ${oneDecimal(it)}\n") }
        append(summary.trend)
        append("\nلا يتضمن هذا الملخص مسار GPS أو موقعك، والقياسات تقديرية من الهاتف وليست حكمًا قانونيًا على القيادة.")
    }.take(1500)

    private fun oneDecimal(value: Double): String = String.format(Locale.US, "%.1f", value)
}

object SafeDriveWeeklyCircleScheduler {
    private const val UNIQUE_WORK = "rawafid_safe_drive_weekly_circle_report_v1"

    fun ensure(context: Context) {
        if (!RawafidCircleApi.hasSession(context)) {
            cancel(context)
            return
        }
        val request = PeriodicWorkRequestBuilder<SafeDriveWeeklyCircleWorker>(7, TimeUnit.DAYS)
            .setInitialDelay(
                SafeDriveWeeklyCirclePolicy.nextMondayNineDelayMs(System.currentTimeMillis()),
                TimeUnit.MILLISECONDS
            )
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .build()
        WorkManager.getInstance(context.applicationContext).enqueueUniquePeriodicWork(
            UNIQUE_WORK,
            ExistingPeriodicWorkPolicy.KEEP,
            request
        )
    }

    fun cancel(context: Context) {
        WorkManager.getInstance(context.applicationContext).cancelUniqueWork(UNIQUE_WORK)
    }
}

class SafeDriveWeeklyCircleWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        if (!RawafidCircleApi.hasSession(applicationContext)) return Result.success()

        return runCatching {
            val recipients = RawafidCircleApi.driveWeeklyPreferences(applicationContext)
                .filter { it.permissionEnabled && it.weeklyReportsEnabled }
            if (recipients.isEmpty()) return@runCatching Result.success()

            val nowMs = System.currentTimeMillis()
            val summary = SafeDriveWeeklyAnalytics.summarize(SafeDriveStore.reports(applicationContext), nowMs)
            if (summary.trips < 1) return@runCatching Result.success()

            val weekKey = SafeDriveWeeklyCirclePolicy.weekKey(nowMs)
            val text = SafeDriveWeeklyCirclePolicy.automaticSummary(summary)
            var attempted = 0
            var accepted = 0
            recipients.forEach { preference ->
                attempted++
                if (
                    RawafidCircleApi.sendDriveWeeklyReportToConnection(
                        context = applicationContext,
                        connectionId = preference.connectionId,
                        weekKey = weekKey,
                        summary = text,
                        tripCount = summary.trips,
                        distanceKm = summary.distanceKm,
                        durationSeconds = (summary.durationMs / 1000L).coerceAtMost(Int.MAX_VALUE.toLong()).toInt(),
                        averageScore = summary.averageScore,
                        harshRatePer100Km = summary.harshEventsPer100Km
                    )
                ) accepted++
            }

            if (attempted > 0 && accepted == 0) Result.success() else Result.success()
        }.getOrElse {
            if (runAttemptCount < 4) Result.retry() else Result.success()
        }
    }
}
