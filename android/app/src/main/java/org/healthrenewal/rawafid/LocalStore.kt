package org.healthrenewal.rawafid

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate


enum class ReminderType(val key: String, val defaultMinutes: Long) {
    BLINK("blink", 20),
    MOVE("move", 60),
    WATER("water", 120),
    MOTIVATION("motivation", 180)
}

data class TreatmentReminder(
    val id: Int,
    val timeMillis: Long,
    val title: String,
    val note: String
)

object LocalStore {
    private const val PREFS = "rawafid_life_os_v1"
    private const val TREATMENTS = "treatments"
    private const val ENCRYPTED_TREATMENTS = "rawafid_local_treatments_v2"
    private const val ENCRYPTED_EMERGENCY_CARD = "rawafid_local_emergency_card_v2"
    private val emergencyLegacyKeys = arrayOf("emergency_name", "emergency_contact", "emergency_note")
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun reminderEnabled(context: Context, type: ReminderType): Boolean =
        prefs(context).getBoolean("reminder_${type.key}_enabled", false)

    fun setReminderEnabled(context: Context, type: ReminderType, enabled: Boolean) {
        prefs(context).edit().putBoolean("reminder_${type.key}_enabled", enabled).apply()
    }

    fun reminderMinutes(context: Context, type: ReminderType): Long =
        prefs(context).getLong("reminder_${type.key}_minutes", type.defaultMinutes)

    fun setReminderMinutes(context: Context, type: ReminderType, minutes: Long) {
        prefs(context).edit().putLong("reminder_${type.key}_minutes", minutes.coerceAtLeast(15)).apply()
    }

    fun quietStart(context: Context): Int = prefs(context).getInt("quiet_start", 22)
    fun quietEnd(context: Context): Int = prefs(context).getInt("quiet_end", 7)
    fun setQuietStart(context: Context, value: Int) = prefs(context).edit().putInt("quiet_start", value.coerceIn(0, 23)).apply()
    fun setQuietEnd(context: Context, value: Int) = prefs(context).edit().putInt("quiet_end", value.coerceIn(0, 23)).apply()

    fun isQuietHour(context: Context, hour: Int): Boolean {
        val start = quietStart(context)
        val end = quietEnd(context)
        if (start == end) return false
        return if (start < end) hour in start until end else hour >= start || hour < end
    }

    fun motivationMaxPerDay(context: Context): Int = prefs(context).getInt("motivation_max", 4)
    fun setMotivationMaxPerDay(context: Context, value: Int) = prefs(context).edit().putInt("motivation_max", value.coerceIn(1, 12)).apply()

    fun claimMotivationSlot(context: Context): Boolean {
        val p = prefs(context)
        val today = LocalDate.now().toString()
        val savedDay = p.getString("motivation_day", "")
        var count = p.getInt("motivation_count", 0)
        if (savedDay != today) count = 0
        if (count >= motivationMaxPerDay(context)) return false
        p.edit().putString("motivation_day", today).putInt("motivation_count", count + 1).apply()
        return true
    }

    fun waterCountToday(context: Context): Int {
        val p = prefs(context)
        val today = LocalDate.now().toString()
        return if (p.getString("water_day", "") == today) p.getInt("water_count", 0) else 0
    }

    fun recordWater(context: Context): Int {
        val p = prefs(context)
        val today = LocalDate.now().toString()
        val next = if (p.getString("water_day", "") == today) p.getInt("water_count", 0) + 1 else 1
        p.edit().putString("water_day", today).putInt("water_count", next).apply()
        return next
    }

    fun treatments(context: Context): List<TreatmentReminder> {
        val raw = SensitiveLocalPayload.read(
            context = context,
            encryptedKey = ENCRYPTED_TREATMENTS,
            legacyPrefsName = PREFS,
            legacyKey = TREATMENTS,
            defaultValue = "[]",
            validator = { runCatching { JSONArray(it) }.isSuccess }
        )
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val item = array.getJSONObject(i)
                    add(TreatmentReminder(
                        id = item.getInt("id"),
                        timeMillis = item.getLong("time"),
                        title = item.optString("title", "موعد علاج"),
                        note = item.optString("note", "")
                    ))
                }
            }.sortedBy { it.timeMillis }
        }.getOrDefault(emptyList())
    }

    fun saveTreatment(context: Context, reminder: TreatmentReminder) {
        val items = treatments(context).filterNot { it.id == reminder.id } + reminder
        writeTreatments(context, items)
    }

    fun removeTreatment(context: Context, id: Int) {
        writeTreatments(context, treatments(context).filterNot { it.id == id })
    }

    fun emergencyName(context: Context): String = emergencyCard(context).optString("name")
    fun emergencyContact(context: Context): String = emergencyCard(context).optString("contact")
    fun emergencyNote(context: Context): String = emergencyCard(context).optString("note")

    fun saveEmergencyCard(context: Context, name: String, contact: String, note: String) {
        val value = JSONObject()
            .put("name", name.trim())
            .put("contact", contact.trim())
            .put("note", note.trim())
        EncryptedLocalStore.put(context, ENCRYPTED_EMERGENCY_CARD, value.toString())
        clearLegacyEmergency(context)
    }

    private fun writeTreatments(context: Context, values: List<TreatmentReminder>) {
        val array = JSONArray()
        values.sortedBy { it.timeMillis }.forEach { item ->
            array.put(JSONObject().apply {
                put("id", item.id)
                put("time", item.timeMillis)
                put("title", item.title)
                put("note", item.note)
            })
        }
        SensitiveLocalPayload.write(context, ENCRYPTED_TREATMENTS, array.toString(), PREFS, TREATMENTS)
    }

    private fun emergencyCard(context: Context): JSONObject {
        EncryptedLocalStore.get(context, ENCRYPTED_EMERGENCY_CARD)?.let { raw ->
            return runCatching { JSONObject(raw) }.getOrDefault(JSONObject())
        }
        val p = prefs(context)
        if (emergencyLegacyKeys.none { p.contains(it) }) return JSONObject()
        val value = JSONObject()
            .put("name", p.getString("emergency_name", "") ?: "")
            .put("contact", p.getString("emergency_contact", "") ?: "")
            .put("note", p.getString("emergency_note", "") ?: "")
        EncryptedLocalStore.put(context, ENCRYPTED_EMERGENCY_CARD, value.toString())
        clearLegacyEmergency(context)
        return value
    }

    private fun clearLegacyEmergency(context: Context) {
        val edit = prefs(context).edit()
        emergencyLegacyKeys.forEach(edit::remove)
        edit.apply()
    }
}
