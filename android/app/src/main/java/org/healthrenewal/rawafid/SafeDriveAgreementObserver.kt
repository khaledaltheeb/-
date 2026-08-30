package org.healthrenewal.rawafid

import android.content.Context
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.roundToInt

/**
 * Evaluates only explicitly customized Safe Drive agreements. Legacy recipients
 * without a customized agreement continue to be handled by the existing
 * broadcast path. No location is transmitted by this observer.
 *
 * Mutable trip bookkeeping is owned by the state-flow collector. The only
 * structure changed by an IO callback is the concurrent sent-alert set.
 */
object SafeDriveAgreementObserver {
    private val started = AtomicBoolean(false)
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val episodeStartedAtMs = mutableMapOf<String, Long>()
    private val persistentAlertSent = ConcurrentHashMap.newKeySet<String>()
    private val lastAttemptAtMs = mutableMapOf<String, Long>()

    @Volatile private var agreements: List<CircleDriveAgreement> = emptyList()
    @Volatile private var tripActive = false
    @Volatile private var lastAgreementRefreshAtMs = 0L
    private var previousSevereCount = 0
    private var previousRiskClusterCount = 0

    fun start(context: Context) {
        if (!started.compareAndSet(false, true)) return
        val app = context.applicationContext
        scope.launch {
            SafeDriveRuntime.state.collectLatest { state ->
                if (!state.active) {
                    resetTrip()
                    return@collectLatest
                }
                if (!tripActive) {
                    tripActive = true
                    previousSevereCount = state.severeSpeedCount
                    previousRiskClusterCount = state.riskClusterCount
                    refreshAgreements(app, force = true)
                } else {
                    refreshAgreements(app, force = false)
                }
                pruneRemovedAgreements()
                evaluatePersistentSpeed(app, state)
                evaluateHighRiskCounters(app, state)
            }
        }
    }

    private fun resetTrip() {
        tripActive = false
        agreements = emptyList()
        episodeStartedAtMs.clear()
        persistentAlertSent.clear()
        lastAttemptAtMs.clear()
        previousSevereCount = 0
        previousRiskClusterCount = 0
        lastAgreementRefreshAtMs = 0L
    }

    private fun refreshAgreements(context: Context, force: Boolean) {
        val now = System.currentTimeMillis()
        if (!force && now - lastAgreementRefreshAtMs < 60_000L) return
        lastAgreementRefreshAtMs = now
        if (!RawafidCircleApi.hasSession(context)) {
            agreements = emptyList()
            return
        }
        scope.launch(Dispatchers.IO) {
            runCatching { RawafidCircleApi.customDriveAgreements(context) }
                .onSuccess { fresh ->
                    agreements = fresh.filter { it.permissionEnabled && it.riskAlertsEnabled }
                }
        }
    }

    private fun pruneRemovedAgreements() {
        val validIds = agreements.mapTo(mutableSetOf()) { it.connectionId }
        episodeStartedAtMs.keys.retainAll(validIds)
        persistentAlertSent.retainAll(validIds)
        lastAttemptAtMs.keys.retainAll(validIds)
    }

    private fun evaluatePersistentSpeed(context: Context, state: SafeDriveLiveState) {
        val elapsed = state.elapsedMs.coerceAtLeast(0L)
        agreements.forEach { agreement ->
            val id = agreement.connectionId
            val threshold = agreement.speedThresholdKmh.toDouble()
            if (state.currentSpeedKmh >= threshold) {
                val startedAt = episodeStartedAtMs.getOrPut(id) { elapsed }
                val continuousSeconds = ((elapsed - startedAt).coerceAtLeast(0L) / 1000L).toInt()
                if (continuousSeconds >= agreement.persistentSpeedSeconds && id !in persistentAlertSent) {
                    val now = System.currentTimeMillis()
                    val lastAttempt = lastAttemptAtMs[id] ?: 0L
                    if (now - lastAttempt >= 30_000L) {
                        lastAttemptAtMs[id] = now
                        sendTargeted(
                            context = context,
                            agreement = agreement,
                            event = "persistent_speed",
                            speedKmh = state.currentSpeedKmh,
                            continuousSeconds = continuousSeconds,
                            summary = "تنبيه قيادة آمنة: استمرت السرعة المقدرة ${state.currentSpeedKmh.roundToInt()} كم/س لمدة ${formatSeconds(continuousSeconds)}، فوق حد اتفاق القيادة الشخصي ${agreement.speedThresholdKmh} كم/س. هذا الحد شخصي وليس حد الطريق القانوني."
                        ) { accepted -> if (accepted) persistentAlertSent += id }
                    }
                }
            } else if (state.currentSpeedKmh <= threshold - 4.0) {
                episodeStartedAtMs.remove(id)
                persistentAlertSent.remove(id)
                lastAttemptAtMs.remove(id)
            }
        }
    }

    private fun evaluateHighRiskCounters(context: Context, state: SafeDriveLiveState) {
        if (state.severeSpeedCount > previousSevereCount) {
            sendHighRiskToAll(
                context,
                "severe_speed",
                state,
                "تنبيه قيادة آمنة: رُصدت سرعة مرتفعة جدًا مقارنة بحد التنبيه الشخصي. السرعة المقدرة ${state.currentSpeedKmh.roundToInt()} كم/س."
            )
        }
        if (state.riskClusterCount > previousRiskClusterCount) {
            sendHighRiskToAll(
                context,
                "risk_cluster",
                state,
                "تنبيه قيادة آمنة: تكررت مؤشرات قيادة حادة خلال وقت قصير. التقييم المؤقت ${state.provisionalScore}/100."
            )
        }
        previousSevereCount = state.severeSpeedCount
        previousRiskClusterCount = state.riskClusterCount
    }

    private fun sendHighRiskToAll(context: Context, event: String, state: SafeDriveLiveState, summary: String) {
        agreements.forEach { agreement ->
            sendTargeted(
                context = context,
                agreement = agreement,
                event = event,
                speedKmh = state.currentSpeedKmh,
                continuousSeconds = 0,
                summary = summary
            )
        }
    }

    private fun sendTargeted(
        context: Context,
        agreement: CircleDriveAgreement,
        event: String,
        speedKmh: Double,
        continuousSeconds: Int,
        summary: String,
        onResult: (Boolean) -> Unit = {}
    ) {
        if (!agreement.permissionEnabled || !agreement.riskAlertsEnabled) return
        scope.launch(Dispatchers.IO) {
            val accepted = runCatching {
                RawafidCircleApi.sendDriveAlertToConnection(
                    context = context,
                    connectionId = agreement.connectionId,
                    event = event,
                    speedKmh = speedKmh,
                    continuousSeconds = continuousSeconds,
                    summary = summary
                )
            }.getOrDefault(false)
            onResult(accepted)
        }
    }

    private fun formatSeconds(seconds: Int): String {
        val minutes = seconds / 60
        val rest = seconds % 60
        return if (minutes > 0 && rest > 0) "${minutes}د ${rest}ث" else if (minutes > 0) "${minutes}د" else "${rest}ث"
    }
}
