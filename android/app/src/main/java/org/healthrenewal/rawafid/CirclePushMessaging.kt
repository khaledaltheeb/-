package org.healthrenewal.rawafid

import android.content.Context
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.util.UUID

/**
 * Owns the Android side of the Rawafid Circle push-device lifecycle.
 *
 * FCM tokens are device routing identifiers, not application authorization.
 * They are stored locally in the encrypted store and registered with Supabase
 * only while a Circle account session exists. Supabase remains authoritative
 * for which signed-in user owns each registered device.
 */
object CirclePushRegistration {
    private const val DEVICE_ID_KEY = "rawafid_circle_push_device_id_v1"
    private const val TOKEN_KEY = "rawafid_circle_fcm_token_v1"
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    fun existingDeviceId(context: Context): String? =
        EncryptedLocalStore.get(context.applicationContext, DEVICE_ID_KEY)?.takeIf { it.isNotBlank() }

    private fun deviceId(context: Context): String {
        val app = context.applicationContext
        existingDeviceId(app)?.let { return it }
        return UUID.randomUUID().toString().also { EncryptedLocalStore.put(app, DEVICE_ID_KEY, it) }
    }

    @Suppress("DEPRECATION")
    private fun appVersion(context: Context): String = runCatching {
        context.packageManager.getPackageInfo(context.packageName, 0).versionName.orEmpty()
    }.getOrDefault("")

    fun registerCurrentToken(context: Context) {
        val app = context.applicationContext
        if (!RawafidCircleApi.hasSession(app)) return

        EncryptedLocalStore.get(app, TOKEN_KEY)
            ?.takeIf { it.isNotBlank() }
            ?.let { registerToken(app, it) }

        FirebaseMessaging.getInstance().token
            .addOnSuccessListener { token -> onTokenRefresh(app, token) }
    }

    fun onTokenRefresh(context: Context, token: String) {
        val app = context.applicationContext
        val cleanToken = token.trim()
        if (cleanToken.isBlank()) return
        EncryptedLocalStore.put(app, TOKEN_KEY, cleanToken)
        if (RawafidCircleApi.hasSession(app)) registerToken(app, cleanToken)
    }

    private fun registerToken(context: Context, token: String) {
        val app = context.applicationContext
        scope.launch {
            if (!RawafidCircleApi.hasSession(app)) return@launch
            runCatching {
                RawafidCircleApi.registerPushDevice(
                    context = app,
                    deviceId = deviceId(app),
                    pushToken = token,
                    appVersion = appVersion(app)
                )
            }
        }
    }

    /**
     * Called before Supabase sign-out while the access token is still valid.
     * The stable local device id is retained so a later login can safely reuse
     * the same logical device registration instead of accumulating duplicates.
     */
    fun unregisterBlocking(context: Context): Boolean {
        val app = context.applicationContext
        val id = existingDeviceId(app) ?: return false
        if (!RawafidCircleApi.hasSession(app)) return false
        return RawafidCircleApi.unregisterPushDevice(app, id)
    }
}

/**
 * Data-only FCM messages are intentionally wake signals. Notification content
 * remains authoritative in Supabase and is fetched through the same Circle
 * RPC path used by the WorkManager fallback. This avoids trusting duplicated
 * mutable notification content in the push transport.
 */
class RawafidFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        CirclePushRegistration.onTokenRefresh(applicationContext, token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        if (message.data["scope"] != "circle" || message.data["type"] != "circle_wake") return
        if (!RawafidCircleApi.hasSession(applicationContext)) return
        CircleNotificationScheduler.checkNow(applicationContext, expedited = true)
    }

    override fun onDeletedMessages() {
        if (RawafidCircleApi.hasSession(applicationContext)) {
            CircleNotificationScheduler.checkNow(applicationContext, expedited = true)
        }
    }
}
