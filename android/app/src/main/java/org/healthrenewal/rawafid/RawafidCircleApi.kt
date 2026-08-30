package org.healthrenewal.rawafid

import android.content.Context
import android.util.Base64
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

class CircleApiException(message: String) : Exception(message)

data class CircleSession(val accessToken: String, val refreshToken: String, val expiresAtSeconds: Long, val email: String)
data class CircleMfaFactor(val id: String, val friendlyName: String, val factorType: String, val status: String)
data class CirclePendingRequest(val requestId: String, val requesterRawafidId: String, val requesterName: String, val requestedAt: String)
data class CircleConnection(val connectionId: String, val counterpartRawafidId: String, val counterpartName: String, val myLabel: String, val connectedAt: String, val canMessage: Boolean, val canQuickQuestion: Boolean, val canRequestLocation: Boolean, val allowMessagesFromThem: Boolean, val allowQuickQuestionsFromThem: Boolean, val allowLocationRequestsFromThem: Boolean)
data class CirclePermissionSnapshot(val permission: String, val mine: Boolean, val theirs: Boolean)
data class CircleDriveAgreement(
    val connectionId: String,
    val permissionEnabled: Boolean,
    val incidentsEnabled: Boolean,
    val riskAlertsEnabled: Boolean,
    val tripReportsEnabled: Boolean,
    val speedThresholdKmh: Int,
    val persistentSpeedSeconds: Int
)
data class CircleDriveWeeklyPreference(
    val connectionId: String,
    val permissionEnabled: Boolean,
    val weeklyReportsEnabled: Boolean
)
data class CircleCloudMessage(val messageId: String, val senderIsMe: Boolean, val kind: String, val body: String, val templateKey: String?, val latitude: Double?, val longitude: Double?, val accuracyM: Double?, val replyToId: String?, val createdAt: String, val answerCode: String?, val answeredAt: String?)
data class CircleCloudNotification(val notificationId: String, val kind: String, val title: String, val body: String, val data: JSONObject, val readAt: String?, val createdAt: String)

object CircleRules {
    private val idRegex = Regex("^RFD-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$")
    fun normalizeRawafidId(value: String): String = value.trim().uppercase()
    fun isValidRawafidId(value: String): Boolean = idRegex.matches(normalizeRawafidId(value))
    fun safeLabel(value: String): String = value.trim().take(80)
    fun safeMessage(value: String): String = value.trim().take(4000)
}

object RawafidCircleApi {
    private const val BASE_URL = "https://ghljwfwqsyfnthvlzxjy.supabase.co"
    private const val PUBLISHABLE_KEY = "sb_publishable__GMG8aQnofuk_6RLm3UfUg_fIzuSzSs"
    private const val SESSION_KEY = "rawafid_circle_session_v1"

    fun hasSession(context: Context): Boolean = loadSession(context) != null
    fun sessionEmail(context: Context): String = loadSession(context)?.email.orEmpty()
    fun clearSession(context: Context) = EncryptedLocalStore.remove(context, SESSION_KEY)

    @Synchronized
    fun signIn(context: Context, email: String, password: String): CircleSession {
        val response = JSONObject(request("POST", "/auth/v1/token?grant_type=password", JSONObject().put("email", email.trim()).put("password", password), null))
        val session = saveSessionFromAuthResponse(context, response, email.trim())
        CirclePushRegistration.registerCurrentToken(context)
        SafeDriveWeeklyCircleScheduler.ensure(context)
        return session
    }

    @Synchronized
    fun signUp(context: Context, name: String, email: String, password: String): Boolean {
        val body = JSONObject().put("email", email.trim()).put("password", password).put("data", JSONObject().put("full_name", name.trim().take(120)))
        val response = JSONObject(request("POST", "/auth/v1/signup", body, null))
        val token = response.optString("access_token")
        if (token.isNotBlank()) {
            saveSessionFromAuthResponse(context, response, email.trim())
            CirclePushRegistration.registerCurrentToken(context)
            SafeDriveWeeklyCircleScheduler.ensure(context)
        }
        return response.has("user")
    }

    fun sendPasswordRecovery(email: String) { request("POST", "/auth/v1/recover", JSONObject().put("email", email.trim()), null) }

    @Synchronized
    fun signOut(context: Context) {
        SafeDriveWeeklyCircleScheduler.cancel(context)
        runCatching { CirclePushRegistration.unregisterBlocking(context) }
        val token = runCatching { validAccessToken(context) }.getOrNull()
        if (token != null) runCatching { request("POST", "/auth/v1/logout", JSONObject(), token) }
        clearSession(context)
    }

    fun currentUserFactors(context: Context): List<CircleMfaFactor> {
        val user = JSONObject(request("GET", "/auth/v1/user", null, validAccessToken(context)))
        val factors = user.optJSONArray("factors") ?: JSONArray()
        return buildList {
            for (i in 0 until factors.length()) {
                val factor = factors.optJSONObject(i) ?: continue
                add(CircleMfaFactor(factor.optString("id"), factor.optString("friendly_name", "رمز التحقق"), factor.optString("factor_type", "totp"), factor.optString("status")))
            }
        }
    }

    fun needsMfa(context: Context): Boolean = currentUserFactors(context).any { it.status == "verified" } && currentAal(context) != "aal2"

    fun startMfaChallenge(context: Context, factorId: String): String {
        val response = JSONObject(request("POST", "/auth/v1/factors/$factorId/challenge", JSONObject(), validAccessToken(context)))
        return response.optString("id").ifBlank { throw CircleApiException("تعذر بدء التحقق بخطوتين.") }
    }

    @Synchronized
    fun verifyMfa(context: Context, factorId: String, challengeId: String, code: String) {
        val response = JSONObject(request("POST", "/auth/v1/factors/$factorId/verify", JSONObject().put("challenge_id", challengeId).put("code", code.trim()), validAccessToken(context)))
        val current = loadSession(context) ?: throw CircleApiException("انتهت جلسة الحساب.")
        saveSessionFromAuthResponse(context, response, current.email)
        CirclePushRegistration.registerCurrentToken(context)
        SafeDriveWeeklyCircleScheduler.ensure(context)
    }

    fun myIdentity(context: Context): String = scalarString(rpc(context, "circle_my_identity", JSONObject()))
    fun sendConnectionRequest(context: Context, rawafidId: String, label: String): String = scalarString(rpc(context, "circle_send_request", JSONObject().put("p_rawafid_id", CircleRules.normalizeRawafidId(rawafidId)).put("p_label", CircleRules.safeLabel(label))))

    fun pendingRequests(context: Context): List<CirclePendingRequest> {
        val a = JSONArray(rpc(context, "circle_pending_requests", JSONObject()))
        return buildList { for (i in 0 until a.length()) { val o = a.optJSONObject(i) ?: continue; add(CirclePendingRequest(o.optString("request_id"), o.optString("requester_rawafid_id"), o.optString("requester_name", "مستخدم روافد"), o.optString("requested_at"))) } }
    }

    fun respondToRequest(context: Context, requestId: String, accept: Boolean, myLabel: String): Boolean = scalarBoolean(rpc(context, "circle_respond_request", JSONObject().put("p_request_id", requestId).put("p_accept", accept).put("p_my_label", if (accept) CircleRules.safeLabel(myLabel) else JSONObject.NULL)))

    fun connections(context: Context): List<CircleConnection> {
        val a = JSONArray(rpc(context, "circle_my_connections", JSONObject()))
        return buildList {
            for (i in 0 until a.length()) {
                val o = a.optJSONObject(i) ?: continue
                add(CircleConnection(o.optString("connection_id"), o.optString("counterpart_rawafid_id"), o.optString("counterpart_name", "مستخدم روافد"), o.optString("my_label"), o.optString("connected_at"), o.optBoolean("can_message"), o.optBoolean("can_quick_question"), o.optBoolean("can_request_location"), o.optBoolean("allow_messages_from_them"), o.optBoolean("allow_quick_questions_from_them"), o.optBoolean("allow_location_requests_from_them")))
            }
        }
    }

    fun permissionSnapshot(context: Context, connectionId: String): List<CirclePermissionSnapshot> {
        val a = JSONArray(rpc(context, "circle_get_permissions", JSONObject().put("p_connection_id", connectionId)))
        return buildList { for (i in 0 until a.length()) { val o = a.optJSONObject(i) ?: continue; add(CirclePermissionSnapshot(o.optString("permission"), o.optBoolean("mine"), o.optBoolean("theirs"))) } }
    }

    fun setPermission(context: Context, connectionId: String, permission: String, enabled: Boolean): Boolean = scalarBoolean(rpc(context, "circle_set_permission", JSONObject().put("p_connection_id", connectionId).put("p_permission", permission).put("p_enabled", enabled)))
    fun removeConnection(context: Context, connectionId: String): Boolean = scalarBoolean(rpc(context, "circle_remove_connection", JSONObject().put("p_connection_id", connectionId)))

    fun driveAgreements(context: Context): List<CircleDriveAgreement> = parseDriveAgreements(
        rpc(context, "circle_get_drive_agreements", JSONObject())
    )

    fun customDriveAgreements(context: Context): List<CircleDriveAgreement> = parseDriveAgreements(
        rpc(context, "circle_get_custom_drive_agreements", JSONObject())
    )

    fun setDriveAgreement(context: Context, agreement: CircleDriveAgreement): Boolean = scalarBoolean(
        rpc(
            context,
            "circle_set_drive_agreement",
            JSONObject()
                .put("p_connection_id", agreement.connectionId)
                .put("p_incidents_enabled", agreement.incidentsEnabled)
                .put("p_risk_alerts_enabled", agreement.riskAlertsEnabled)
                .put("p_trip_reports_enabled", agreement.tripReportsEnabled)
                .put("p_speed_threshold_kmh", agreement.speedThresholdKmh.coerceIn(50, 180))
                .put("p_persistent_speed_seconds", agreement.persistentSpeedSeconds.coerceIn(30, 900))
        )
    )

    fun driveWeeklyPreferences(context: Context): List<CircleDriveWeeklyPreference> {
        val a = JSONArray(rpc(context, "circle_get_drive_weekly_preferences", JSONObject()))
        return buildList {
            for (i in 0 until a.length()) {
                val o = a.optJSONObject(i) ?: continue
                add(
                    CircleDriveWeeklyPreference(
                        connectionId = o.optString("connection_id"),
                        permissionEnabled = o.optBoolean("permission_enabled"),
                        weeklyReportsEnabled = o.optBoolean("weekly_reports_enabled")
                    )
                )
            }
        }
    }

    fun setDriveWeeklyReportEnabled(context: Context, connectionId: String, enabled: Boolean): Boolean {
        val result = scalarBoolean(
            rpc(
                context,
                "circle_set_drive_weekly_report_enabled",
                JSONObject().put("p_connection_id", connectionId).put("p_enabled", enabled)
            )
        )
        SafeDriveWeeklyCircleScheduler.ensure(context)
        return result
    }

    fun sendDriveWeeklyReportToConnection(
        context: Context,
        connectionId: String,
        weekKey: String,
        summary: String,
        tripCount: Int,
        distanceKm: Double,
        durationSeconds: Int,
        averageScore: Int?,
        harshRatePer100Km: Double?
    ): Boolean = scalarBoolean(
        rpc(
            context,
            "circle_send_drive_weekly_report_to_connection",
            JSONObject()
                .put("p_connection_id", connectionId)
                .put("p_week_key", weekKey.trim().uppercase().take(8))
                .put("p_summary", summary.trim().take(1500))
                .put("p_trip_count", tripCount.coerceIn(1, 500))
                .put("p_distance_km", distanceKm.coerceIn(0.0, 10000.0))
                .put("p_duration_seconds", durationSeconds.coerceIn(0, 1_209_600))
                .put("p_average_score", averageScore?.coerceIn(0, 100) ?: JSONObject.NULL)
                .put("p_harsh_rate_per_100km", harshRatePer100Km?.coerceIn(0.0, 10000.0) ?: JSONObject.NULL)
        )
    )

    fun sendDriveRiskToConnection(
        context: Context,
        connectionId: String,
        speedKmh: Double,
        continuousSeconds: Int,
        summary: String
    ): Boolean = scalarBoolean(
        rpc(
            context,
            "circle_send_drive_risk_to_connection",
            JSONObject()
                .put("p_connection_id", connectionId)
                .put("p_speed_kmh", speedKmh.coerceIn(0.0, 350.0))
                .put("p_continuous_seconds", continuousSeconds.coerceIn(0, 7200))
                .put("p_summary", summary.trim().take(900))
        )
    )

    fun sendDriveAlertToConnection(
        context: Context,
        connectionId: String,
        event: String,
        speedKmh: Double,
        continuousSeconds: Int,
        summary: String
    ): Boolean = scalarBoolean(
        rpc(
            context,
            "circle_send_drive_alert_to_connection",
            JSONObject()
                .put("p_connection_id", connectionId)
                .put("p_event", event.trim().lowercase().take(40))
                .put("p_speed_kmh", speedKmh.coerceIn(0.0, 350.0))
                .put("p_continuous_seconds", continuousSeconds.coerceIn(0, 7200))
                .put("p_summary", summary.trim().take(900))
        )
    )

    fun messages(context: Context, connectionId: String, limit: Int = 80): List<CircleCloudMessage> {
        val a = JSONArray(rpc(context, "circle_get_messages", JSONObject().put("p_connection_id", connectionId).put("p_limit", limit.coerceIn(1, 100)).put("p_before", JSONObject.NULL)))
        return buildList {
            for (i in 0 until a.length()) {
                val o = a.optJSONObject(i) ?: continue
                add(CircleCloudMessage(o.optString("message_id"), o.optBoolean("sender_is_me"), o.optString("kind"), o.optString("body"), o.optNullableString("template_key"), o.optNullableDouble("latitude"), o.optNullableDouble("longitude"), o.optNullableDouble("accuracy_m"), o.optNullableString("reply_to_id"), o.optString("created_at"), o.optNullableString("answer_code"), o.optNullableString("answered_at")))
            }
        }.reversed()
    }

    fun sendText(context: Context, connectionId: String, text: String): String = sendMessage(context, connectionId, "text", CircleRules.safeMessage(text), null)
    fun sendYesNoQuestion(context: Context, connectionId: String, question: String, templateKey: String?): String = sendMessage(context, connectionId, "yes_no_question", CircleRules.safeMessage(question), templateKey)
    fun requestLocation(context: Context, connectionId: String): String = sendMessage(context, connectionId, "location_request", "أرسل لي موقعك", "location_request")
    fun shareLocation(context: Context, connectionId: String, latitude: Double, longitude: Double, accuracyM: Double?, replyToId: String? = null): String = sendMessage(context, connectionId, "location_share", "تم إرسال موقعي الحالي", "location_share", replyToId, latitude, longitude, accuracyM)
    fun answerMessage(context: Context, messageId: String, answerCode: String): Boolean = scalarBoolean(rpc(context, "circle_answer_message", JSONObject().put("p_message_id", messageId).put("p_answer_code", answerCode)))

    fun broadcastSafetyLocation(context: Context, latitude: Double, longitude: Double, accuracyM: Double?, label: String): Int = scalarInt(
        rpc(
            context,
            "circle_broadcast_safety_location",
            JSONObject()
                .put("p_latitude", latitude)
                .put("p_longitude", longitude)
                .put("p_accuracy_m", accuracyM ?: JSONObject.NULL)
                .put("p_label", label.trim().take(120).ifBlank { JSONObject.NULL })
        )
    )

    fun broadcastDriveAlert(
        context: Context,
        latitude: Double?,
        longitude: Double?,
        accuracyM: Double?,
        event: String,
        summary: String
    ): Int = scalarInt(
        rpc(
            context,
            "circle_broadcast_drive_alert",
            JSONObject()
                .put("p_latitude", latitude ?: JSONObject.NULL)
                .put("p_longitude", longitude ?: JSONObject.NULL)
                .put("p_accuracy_m", accuracyM ?: JSONObject.NULL)
                .put("p_event", event.trim().lowercase().take(40))
                .put("p_summary", summary.trim().take(900))
        )
    )

    fun broadcastDriveReport(context: Context, report: SafeDriveTripReport): Int = scalarInt(
        rpc(
            context,
            "circle_broadcast_drive_report",
            JSONObject()
                .put("p_summary", SafeDriveScoring.reportSummary(report))
                .put("p_score", report.score)
                .put("p_max_speed_kmh", report.maxSpeedKmh)
                .put("p_duration_seconds", (report.durationMs / 1000L).coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
                .put("p_distance_km", report.distanceKm)
                .put("p_high_speed_seconds", (report.highSpeedDurationMs / 1000L).coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
                .put("p_event_count", report.events.size)
        )
    )

    fun notifications(context: Context, limit: Int = 50): List<CircleCloudNotification> {
        val a = JSONArray(rpc(context, "get_my_notifications", JSONObject().put("p_limit", limit.coerceIn(1, 100)).put("p_offset", 0)))
        return buildList { for (i in 0 until a.length()) { val o = a.optJSONObject(i) ?: continue; add(CircleCloudNotification(o.optString("notification_id"), o.optString("kind"), o.optString("title"), o.optString("body"), o.optJSONObject("data") ?: JSONObject(), o.optNullableString("read_at"), o.optString("created_at"))) } }
    }

    fun markNotificationRead(context: Context, notificationId: String) { rpc(context, "mark_notification_read", JSONObject().put("p_notification_id", notificationId).put("p_all", false)) }

    fun registerPushDevice(context: Context, deviceId: String, pushToken: String, appVersion: String): String = scalarString(
        rpc(
            context,
            "circle_register_push_device",
            JSONObject()
                .put("p_device_id", deviceId)
                .put("p_push_token", pushToken)
                .put("p_app_version", appVersion)
        )
    )

    fun unregisterPushDevice(context: Context, deviceId: String): Boolean = scalarBoolean(
        rpc(context, "circle_unregister_push_device", JSONObject().put("p_device_id", deviceId))
    )

    private fun parseDriveAgreements(raw: String): List<CircleDriveAgreement> {
        val a = JSONArray(raw)
        return buildList {
            for (i in 0 until a.length()) {
                val o = a.optJSONObject(i) ?: continue
                add(
                    CircleDriveAgreement(
                        connectionId = o.optString("connection_id"),
                        permissionEnabled = o.optBoolean("permission_enabled"),
                        incidentsEnabled = o.optBoolean("incidents_enabled", true),
                        riskAlertsEnabled = o.optBoolean("risk_alerts_enabled", true),
                        tripReportsEnabled = o.optBoolean("trip_reports_enabled", true),
                        speedThresholdKmh = o.optInt("speed_threshold_kmh", 120).coerceIn(50, 180),
                        persistentSpeedSeconds = o.optInt("persistent_speed_seconds", 120).coerceIn(30, 900)
                    )
                )
            }
        }
    }

    private fun sendMessage(context: Context, connectionId: String, kind: String, body: String?, templateKey: String?, replyToId: String? = null, latitude: Double? = null, longitude: Double? = null, accuracyM: Double? = null): String {
        val args = JSONObject().put("p_connection_id", connectionId).put("p_kind", kind).put("p_body", body ?: JSONObject.NULL).put("p_template_key", templateKey ?: JSONObject.NULL).put("p_reply_to_id", replyToId ?: JSONObject.NULL).put("p_latitude", latitude ?: JSONObject.NULL).put("p_longitude", longitude ?: JSONObject.NULL).put("p_accuracy_m", accuracyM ?: JSONObject.NULL).put("p_client_token", UUID.randomUUID().toString())
        return scalarString(rpc(context, "circle_send_message", args))
    }

    @Synchronized
    private fun validAccessToken(context: Context): String {
        val session = loadSession(context) ?: throw CircleApiException("سجّل الدخول لاستخدام دائرتي.")
        if (session.expiresAtSeconds > System.currentTimeMillis() / 1000L + 60L) return session.accessToken
        val response = JSONObject(request("POST", "/auth/v1/token?grant_type=refresh_token", JSONObject().put("refresh_token", session.refreshToken), null))
        return saveSessionFromAuthResponse(context, response, session.email).accessToken
    }

    private fun rpc(context: Context, name: String, args: JSONObject): String = request("POST", "/rest/v1/rpc/$name", args, validAccessToken(context))

    private fun request(method: String, path: String, body: JSONObject?, accessToken: String?): String {
        val connection = URL(BASE_URL + path).openConnection() as HttpURLConnection
        connection.requestMethod = method; connection.connectTimeout = 15000; connection.readTimeout = 20000
        connection.setRequestProperty("apikey", PUBLISHABLE_KEY); connection.setRequestProperty("Accept", "application/json"); connection.setRequestProperty("Content-Type", "application/json")
        if (!accessToken.isNullOrBlank()) connection.setRequestProperty("Authorization", "Bearer $accessToken")
        if (body != null && method != "GET") { connection.doOutput = true; connection.outputStream.bufferedWriter(Charsets.UTF_8).use { it.write(body.toString()) } }
        val code = connection.responseCode
        val text = (if (code in 200..299) connection.inputStream else connection.errorStream)?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
        connection.disconnect()
        if (code !in 200..299) throw CircleApiException(readableError(text, code))
        return if (text.isBlank()) "null" else text
    }

    private fun readableError(raw: String, code: Int): String {
        val message = runCatching { val o = JSONObject(raw); o.optString("msg").ifBlank { o.optString("message") }.ifBlank { o.optString("error_description") }.ifBlank { o.optString("error") } }.getOrNull().orEmpty()
        return when {
            message.contains("Invalid login credentials", true) -> "البريد الإلكتروني أو كلمة المرور غير صحيحة."
            message.contains("Email not confirmed", true) -> "أكد بريدك الإلكتروني أولًا ثم حاول تسجيل الدخول."
            message.contains("User already registered", true) -> "هذا البريد مسجل مسبقًا."
            message.contains("Password should be", true) -> "كلمة المرور لا تحقق متطلبات الأمان."
            message.contains("mfa required", true) -> "أكمل التحقق بخطوتين لحماية حسابك."
            message.contains("already connected", true) -> "هذا الشخص موجود بالفعل في دائرتك."
            message.contains("incoming request already exists", true) -> "لديك طلب ارتباط وارد من هذا الشخص؛ راجعه بدل إرسال طلب جديد."
            message.contains("unable to create request", true) -> "تعذر العثور على هذا المعرّف أو لا يمكن إرسال الطلب إليه."
            message.contains("recipient permission disabled", true) -> "الطرف الآخر لم يمنح هذه الصلاحية."
            message.contains("messaging blocked", true) -> "التواصل غير متاح بين هذين الحسابين."
            message.contains("rate limit", true) -> "تم الوصول إلى حد الحماية المؤقت. حاول لاحقًا."
            message.isNotBlank() -> message
            else -> "تعذر الاتصال بخدمة روافد (رمز $code)."
        }
    }

    private fun saveSessionFromAuthResponse(context: Context, response: JSONObject, email: String): CircleSession {
        val access = response.optString("access_token").ifBlank { throw CircleApiException("لم يتم إنشاء جلسة صالحة.") }
        val refresh = response.optString("refresh_token").ifBlank { loadSession(context)?.refreshToken.orEmpty() }
        if (refresh.isBlank()) throw CircleApiException("لم يتم إنشاء جلسة قابلة للتجديد.")
        val expiresAt = response.optLong("expires_at", 0L).takeIf { it > 0L } ?: (System.currentTimeMillis() / 1000L + response.optLong("expires_in", 3600L))
        val session = CircleSession(access, refresh, expiresAt, email)
        EncryptedLocalStore.put(context, SESSION_KEY, JSONObject().put("access_token", access).put("refresh_token", refresh).put("expires_at", expiresAt).put("email", email).toString())
        return session
    }

    private fun loadSession(context: Context): CircleSession? {
        val raw = EncryptedLocalStore.get(context, SESSION_KEY) ?: return null
        return runCatching { val o = JSONObject(raw); CircleSession(o.getString("access_token"), o.getString("refresh_token"), o.getLong("expires_at"), o.optString("email")) }.getOrNull()
    }

    private fun currentAal(context: Context): String {
        val token = loadSession(context)?.accessToken ?: return ""
        return runCatching { val parts = token.split('.'); if (parts.size < 2) return@runCatching ""; val payload = Base64.decode(parts[1], Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING); JSONObject(payload.toString(Charsets.UTF_8)).optString("aal") }.getOrDefault("")
    }

    private fun scalarString(raw: String): String = when (val value = JSONTokener(raw).nextValue()) { is String -> value; JSONObject.NULL, null -> ""; else -> value.toString() }
    private fun scalarBoolean(raw: String): Boolean { val value = JSONTokener(raw).nextValue(); return value as? Boolean ?: value.toString().toBooleanStrictOrNull() ?: false }
    private fun scalarInt(raw: String): Int { val value = JSONTokener(raw).nextValue(); return (value as? Number)?.toInt() ?: value.toString().toIntOrNull() ?: 0 }
    private fun JSONObject.optNullableString(key: String): String? = if (isNull(key)) null else optString(key).takeIf { it.isNotBlank() }
    private fun JSONObject.optNullableDouble(key: String): Double? = if (isNull(key) || !has(key)) null else optDouble(key).takeIf { !it.isNaN() }
}
