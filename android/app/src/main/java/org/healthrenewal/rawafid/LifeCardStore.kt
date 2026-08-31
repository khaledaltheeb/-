package org.healthrenewal.rawafid

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.time.temporal.ChronoUnit

enum class LifeCardField(val id: String) {
    DISPLAY_NAME("display_name"),
    BIRTH_YEAR("birth_year"),
    BLOOD_TYPE("blood_type"),
    ALLERGIES("allergies"),
    CONDITIONS("conditions"),
    MEDICATIONS("medications"),
    COMMUNICATION_NEEDS("communication_needs"),
    ACCESSIBILITY_NEEDS("accessibility_needs"),
    EMERGENCY_NOTES("emergency_notes"),
    EMERGENCY_CONTACTS("emergency_contacts")
}

enum class LifeCardPreset(val labelAr: String, val fields: Set<LifeCardField>) {
    MINIMAL(
        "الحد الأدنى",
        setOf(
            LifeCardField.DISPLAY_NAME,
            LifeCardField.ALLERGIES,
            LifeCardField.EMERGENCY_CONTACTS
        )
    ),
    EMERGENCY(
        "طوارئ",
        setOf(
            LifeCardField.DISPLAY_NAME,
            LifeCardField.BLOOD_TYPE,
            LifeCardField.ALLERGIES,
            LifeCardField.CONDITIONS,
            LifeCardField.MEDICATIONS,
            LifeCardField.COMMUNICATION_NEEDS,
            LifeCardField.ACCESSIBILITY_NEEDS,
            LifeCardField.EMERGENCY_NOTES,
            LifeCardField.EMERGENCY_CONTACTS
        )
    ),
    CARE(
        "رعاية",
        LifeCardField.entries.toSet()
    )
}

data class LifeCardContact(
    val id: String,
    val name: String,
    val relation: String,
    val phone: String
)

data class LifeCardProfile(
    val displayName: String = "",
    val birthYear: String = "",
    val bloodType: String = "",
    val allergies: String = "",
    val conditions: String = "",
    val medications: String = "",
    val communicationNeeds: String = "",
    val accessibilityNeeds: String = "",
    val emergencyNotes: String = "",
    val contacts: List<LifeCardContact> = emptyList(),
    val updatedAtEpochMs: Long = System.currentTimeMillis()
)

data class LifeCardShareConfig(
    val preset: LifeCardPreset = LifeCardPreset.MINIMAL,
    val includedFields: Set<LifeCardField> = preset.fields,
    val expiresInHours: Int = 24
)

/**
 * Local-first storage for Rawafid Life Card.
 *
 * The profile is encrypted at rest with Android Keystore in this implementation.
 * QR/share payloads contain only fields explicitly selected by the user and
 * include an expiry timestamp so a displayed card can state its intended
 * validity window. No server token or remote lookup is required.
 */
object LifeCardStore {
    private const val PREFS = "rawafid_life_card_v1"
    private const val PROFILE_JSON = "profile_json"
    private const val ENCRYPTED_PROFILE = "rawafid_life_card_profile_v2"

    fun load(context: Context): LifeCardProfile {
        val raw = SensitiveLocalPayload.read(
            context = context,
            encryptedKey = ENCRYPTED_PROFILE,
            legacyPrefsName = PREFS,
            legacyKey = PROFILE_JSON,
            defaultValue = "",
            validator = { runCatching { JSONObject(it) }.isSuccess }
        )
        if (raw.isBlank()) return LifeCardProfile()
        return runCatching { decodeProfile(JSONObject(raw)) }.getOrElse { LifeCardProfile() }
    }

    fun save(context: Context, profile: LifeCardProfile) {
        val normalized = profile.copy(updatedAtEpochMs = System.currentTimeMillis())
        SensitiveLocalPayload.write(context, ENCRYPTED_PROFILE, encodeProfile(normalized).toString(), PREFS, PROFILE_JSON)
    }

    fun clear(context: Context) {
        SensitiveLocalPayload.remove(context, ENCRYPTED_PROFILE, PREFS, PROFILE_JSON)
    }

    fun buildSharePayload(
        profile: LifeCardProfile,
        config: LifeCardShareConfig,
        now: Instant = Instant.now()
    ): String {
        val fields = config.includedFields.intersect(LifeCardField.entries.toSet())
        val expiresAt = now.plus(config.expiresInHours.coerceIn(1, 168).toLong(), ChronoUnit.HOURS)
        val data = JSONObject()

        if (LifeCardField.DISPLAY_NAME in fields) putIfNotBlank(data, "display_name", profile.displayName)
        if (LifeCardField.BIRTH_YEAR in fields) putIfNotBlank(data, "birth_year", profile.birthYear)
        if (LifeCardField.BLOOD_TYPE in fields) putIfNotBlank(data, "blood_type", profile.bloodType)
        if (LifeCardField.ALLERGIES in fields) putIfNotBlank(data, "allergies", profile.allergies)
        if (LifeCardField.CONDITIONS in fields) putIfNotBlank(data, "conditions", profile.conditions)
        if (LifeCardField.MEDICATIONS in fields) putIfNotBlank(data, "medications", profile.medications)
        if (LifeCardField.COMMUNICATION_NEEDS in fields) putIfNotBlank(data, "communication_needs", profile.communicationNeeds)
        if (LifeCardField.ACCESSIBILITY_NEEDS in fields) putIfNotBlank(data, "accessibility_needs", profile.accessibilityNeeds)
        if (LifeCardField.EMERGENCY_NOTES in fields) putIfNotBlank(data, "emergency_notes", profile.emergencyNotes)
        if (LifeCardField.EMERGENCY_CONTACTS in fields && profile.contacts.isNotEmpty()) {
            val contacts = JSONArray()
            profile.contacts.take(3).forEach { contact ->
                contacts.put(
                    JSONObject()
                        .put("name", contact.name.trim())
                        .put("relation", contact.relation.trim())
                        .put("phone", contact.phone.trim())
                )
            }
            data.put("emergency_contacts", contacts)
        }

        return JSONObject()
            .put("schema", "rawafid.life_card")
            .put("version", 1)
            .put("generated_at", now.toString())
            .put("expires_at", expiresAt.toString())
            .put("preset", config.preset.name.lowercase())
            .put("data", data)
            .toString()
    }

    private fun encodeProfile(profile: LifeCardProfile): JSONObject {
        val contacts = JSONArray()
        profile.contacts.take(5).forEach { contact ->
            contacts.put(
                JSONObject()
                    .put("id", contact.id)
                    .put("name", contact.name)
                    .put("relation", contact.relation)
                    .put("phone", contact.phone)
            )
        }
        return JSONObject()
            .put("display_name", profile.displayName)
            .put("birth_year", profile.birthYear)
            .put("blood_type", profile.bloodType)
            .put("allergies", profile.allergies)
            .put("conditions", profile.conditions)
            .put("medications", profile.medications)
            .put("communication_needs", profile.communicationNeeds)
            .put("accessibility_needs", profile.accessibilityNeeds)
            .put("emergency_notes", profile.emergencyNotes)
            .put("contacts", contacts)
            .put("updated_at", profile.updatedAtEpochMs)
    }

    private fun decodeProfile(json: JSONObject): LifeCardProfile {
        val contacts = mutableListOf<LifeCardContact>()
        val array = json.optJSONArray("contacts") ?: JSONArray()
        for (index in 0 until minOf(array.length(), 5)) {
            val item = array.optJSONObject(index) ?: continue
            contacts += LifeCardContact(
                id = item.optString("id"),
                name = item.optString("name"),
                relation = item.optString("relation"),
                phone = item.optString("phone")
            )
        }
        return LifeCardProfile(
            displayName = json.optString("display_name"),
            birthYear = json.optString("birth_year"),
            bloodType = json.optString("blood_type"),
            allergies = json.optString("allergies"),
            conditions = json.optString("conditions"),
            medications = json.optString("medications"),
            communicationNeeds = json.optString("communication_needs"),
            accessibilityNeeds = json.optString("accessibility_needs"),
            emergencyNotes = json.optString("emergency_notes"),
            contacts = contacts,
            updatedAtEpochMs = json.optLong("updated_at", 0L)
        )
    }

    private fun putIfNotBlank(target: JSONObject, key: String, value: String) {
        val normalized = value.trim()
        if (normalized.isNotEmpty()) target.put(key, normalized)
    }
}
