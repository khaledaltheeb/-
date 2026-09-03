package org.healthrenewal.rawafid

import android.content.Context
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.SocketTimeoutException
import java.net.URL

object RawafidAccountDeletionApi {
    private const val BASE_URL = "https://ghljwfwqsyfnthvlzxjy.supabase.co"
    private const val PUBLISHABLE_KEY = "sb_publishable__GMG8aQnofuk_6RLm3UfUg_fIzuSzSs"
    private const val SESSION_KEY = "rawafid_circle_session_v1"
    private const val CONFIRMATION = "DELETE_MY_RAWAFID_ACCOUNT"

    fun deleteCurrentAccount(context: Context, expectedEmail: String) {
        val session = freshSession(context)
        val email = session.optString("email").trim()
        if (email.isBlank() || !email.equals(expectedEmail.trim(), ignoreCase = true)) {
            throw CircleApiException("تعذر تأكيد بريد الحساب قبل الحذف.")
        }

        val connection = URL("$BASE_URL/functions/v1/rawafid-delete-account").openConnection() as HttpURLConnection
        try {
            connection.requestMethod = "POST"
            connection.connectTimeout = 15_000
            connection.readTimeout = 30_000
            connection.useCaches = false
            connection.doOutput = true
            connection.setRequestProperty("apikey", PUBLISHABLE_KEY)
            connection.setRequestProperty("Authorization", "Bearer ${session.getString("access_token")}")
            connection.setRequestProperty("Accept", "application/json")
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Cache-Control", "no-store")
            connection.outputStream.bufferedWriter(Charsets.UTF_8).use { writer ->
                writer.write(
                    JSONObject()
                        .put("confirmation", CONFIRMATION)
                        .put("email", email)
                        .toString()
                )
            }

            val code = connection.responseCode
            val raw = (if (code in 200..299) connection.inputStream else connection.errorStream)
                ?.bufferedReader(Charsets.UTF_8)
                ?.use { it.readText() }
                .orEmpty()
            if (code !in 200..299) throw CircleApiException(readableDeleteError(raw, code))

            val result = runCatching { JSONObject(raw) }.getOrNull()
            if (result?.optBoolean("ok") != true) throw CircleApiException("لم تؤكد خدمة روافد اكتمال حذف الحساب.")

            SafeDriveWeeklyCircleScheduler.cancel(context)
            RawafidCircleApi.clearSession(context)
        } catch (error: CircleApiException) {
            throw error
        } catch (_: SocketTimeoutException) {
            throw CircleApiException("استغرق حذف الحساب وقتًا أطول من المتوقع. تحقق من حالة الحساب قبل إعادة المحاولة.")
        } catch (_: IOException) {
            throw CircleApiException("تعذر الاتصال بخدمة حذف الحساب. تحقق من الشبكة وحاول مرة أخرى.")
        } finally {
            connection.disconnect()
        }
    }

    private fun freshSession(context: Context): JSONObject {
        val raw = EncryptedLocalStore.get(context, SESSION_KEY)
            ?: throw CircleApiException("سجّل الدخول من جديد قبل حذف الحساب.")
        val session = runCatching { JSONObject(raw) }.getOrNull()
            ?: throw CircleApiException("جلسة الحساب غير صالحة. سجّل الدخول من جديد.")
        val expiresAt = session.optLong("expires_at", 0L)
        if (expiresAt <= System.currentTimeMillis() / 1000L + 30L) {
            throw CircleApiException("أعد تسجيل الدخول قبل حذف الحساب.")
        }
        return session
    }

    private fun readableDeleteError(raw: String, httpCode: Int): String {
        val payload = runCatching { JSONObject(raw) }.getOrNull()
        return when (payload?.optString("code")) {
            "reauth_required" -> "لأمان حسابك، سجّل الدخول من جديد ثم أعد طلب الحذف."
            "mfa_required" -> "أكمل التحقق بخطوتين أولًا ثم أعد طلب حذف الحساب."
            "email_mismatch" -> "بريد التأكيد لا يطابق الحساب المسجّل."
            "managed_account" -> "هذا حساب إداري مُدار. يجب نقل الصلاحيات الإدارية قبل حذفه."
            "mfa_check_failed", "profile_check_failed", "verification_inventory_failed", "media_inventory_failed" ->
                "تعذر التحقق من جاهزية حذف الحساب بأمان. حاول لاحقًا."
            "delete_failed" -> "لم يكتمل حذف الحساب. لم تُسجّل العملية كناجحة ويمكن إعادة المحاولة."
            else -> if (httpCode == 401) {
                "انتهت جلسة الحساب. سجّل الدخول من جديد."
            } else {
                "تعذر حذف الحساب بأمان (رمز $httpCode)."
            }
        }
    }
}
