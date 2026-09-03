package org.healthrenewal.rawafid

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Reusable local encrypted string store.
 *
 * Key material is generated and retained by AndroidKeyStore and never written
 * into SharedPreferences. Payloads are encrypted with AES/GCM and stored as
 * IV + ciphertext. This is intentionally local-only; cloud sync requires a
 * separate key-management design and must not reuse this device-only key.
 *
 * Sensitive writes/removals use commit() intentionally: callers must never be
 * told that a token, health record, or privacy migration was persisted or
 * removed until the encrypted preference update is durable on disk.
 */
object EncryptedLocalStore {
    private const val KEYSTORE = "AndroidKeyStore"
    private const val ALIAS = "rawafid_life_os_local_aes_v1"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val PREFS = "rawafid_encrypted_payloads_v1"

    fun put(context: Context, key: String, plaintext: String) {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey())
        val ciphertext = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8))
        val encodedIv = Base64.encodeToString(cipher.iv, Base64.NO_WRAP)
        val encodedCiphertext = Base64.encodeToString(ciphertext, Base64.NO_WRAP)
        val persisted = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(key, "$encodedIv:$encodedCiphertext")
            .commit()
        check(persisted) { "Unable to persist encrypted local data" }
    }

    fun get(context: Context, key: String): String? {
        val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(key, null) ?: return null
        return runCatching {
            val split = raw.indexOf(':')
            require(split > 0 && split < raw.lastIndex)
            val iv = Base64.decode(raw.substring(0, split), Base64.NO_WRAP)
            val ciphertext = Base64.decode(raw.substring(split + 1), Base64.NO_WRAP)
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.DECRYPT_MODE, secretKey(), GCMParameterSpec(128, iv))
            cipher.doFinal(ciphertext).toString(Charsets.UTF_8)
        }.getOrNull()
    }

    fun remove(context: Context, key: String) {
        val removed = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .remove(key)
            .commit()
        check(removed) { "Unable to remove encrypted local data" }
    }

    @Synchronized
    private fun secretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(KEYSTORE).apply { load(null) }
        val existing = keyStore.getKey(ALIAS, null) as? SecretKey
        if (existing != null) return existing

        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE)
        generator.init(
            KeyGenParameterSpec.Builder(
                ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()
        )
        return generator.generateKey()
    }
}
