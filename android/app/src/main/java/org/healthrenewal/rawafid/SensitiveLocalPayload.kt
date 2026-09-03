package org.healthrenewal.rawafid

import android.content.Context

/**
 * Migration bridge for sensitive payloads that were previously stored as
 * plaintext SharedPreferences strings.
 *
 * The encrypted copy is written first. The legacy value is removed only after
 * encryption succeeds, so upgrades never intentionally discard the only
 * readable copy. New writes always use Android Keystore backed encryption.
 */
object SensitiveLocalPayload {
    fun read(
        context: Context,
        encryptedKey: String,
        legacyPrefsName: String,
        legacyKey: String,
        defaultValue: String,
        validator: (String) -> Boolean = { true }
    ): String {
        EncryptedLocalStore.get(context, encryptedKey)?.let { return it }

        val legacyPrefs = context.getSharedPreferences(legacyPrefsName, Context.MODE_PRIVATE)
        val legacy = legacyPrefs.getString(legacyKey, null) ?: return defaultValue
        if (!validator(legacy)) return defaultValue

        EncryptedLocalStore.put(context, encryptedKey, legacy)
        legacyPrefs.edit().remove(legacyKey).apply()
        return legacy
    }

    fun write(
        context: Context,
        encryptedKey: String,
        value: String,
        legacyPrefsName: String? = null,
        legacyKey: String? = null
    ) {
        EncryptedLocalStore.put(context, encryptedKey, value)
        if (!legacyPrefsName.isNullOrBlank() && !legacyKey.isNullOrBlank()) {
            context.getSharedPreferences(legacyPrefsName, Context.MODE_PRIVATE)
                .edit()
                .remove(legacyKey)
                .apply()
        }
    }

    fun remove(
        context: Context,
        encryptedKey: String,
        legacyPrefsName: String? = null,
        legacyKey: String? = null
    ) {
        EncryptedLocalStore.remove(context, encryptedKey)
        if (!legacyPrefsName.isNullOrBlank() && !legacyKey.isNullOrBlank()) {
            context.getSharedPreferences(legacyPrefsName, Context.MODE_PRIVATE)
                .edit()
                .remove(legacyKey)
                .apply()
        }
    }
}
