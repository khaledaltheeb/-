package org.healthrenewal.rawafid

import android.content.Context

/**
 * Stable migration seam between UI/features and local persistence.
 *
 * Phase 1 deliberately delegates to the existing LocalStore so current user data and
 * encrypted payload migrations remain untouched. Future DataStore/Room-backed data
 * sources can replace individual methods behind this contract without changing callers.
 */
interface RawafidLocalRepository {
    fun reminderEnabled(type: ReminderType): Boolean
    fun setReminderEnabled(type: ReminderType, enabled: Boolean)
    fun reminderMinutes(type: ReminderType): Long
    fun setReminderMinutes(type: ReminderType, minutes: Long)
    fun quietStart(): Int
    fun quietEnd(): Int
    fun setQuietStart(value: Int)
    fun setQuietEnd(value: Int)
    fun isQuietHour(hour: Int): Boolean
    fun motivationMaxPerDay(): Int
    fun setMotivationMaxPerDay(value: Int)
    fun claimMotivationSlot(): Boolean
    fun waterCountToday(): Int
    fun recordWater(): Int
    fun treatments(): List<TreatmentReminder>
    fun saveTreatment(reminder: TreatmentReminder)
    fun removeTreatment(id: Int)
    fun emergencyName(): String
    fun emergencyContact(): String
    fun emergencyNote(): String
    fun saveEmergencyCard(name: String, contact: String, note: String)
}

class LegacyLocalStoreRepository(context: Context) : RawafidLocalRepository {
    private val appContext = context.applicationContext

    override fun reminderEnabled(type: ReminderType) = LocalStore.reminderEnabled(appContext, type)
    override fun setReminderEnabled(type: ReminderType, enabled: Boolean) = LocalStore.setReminderEnabled(appContext, type, enabled)
    override fun reminderMinutes(type: ReminderType) = LocalStore.reminderMinutes(appContext, type)
    override fun setReminderMinutes(type: ReminderType, minutes: Long) = LocalStore.setReminderMinutes(appContext, type, minutes)
    override fun quietStart() = LocalStore.quietStart(appContext)
    override fun quietEnd() = LocalStore.quietEnd(appContext)
    override fun setQuietStart(value: Int) = LocalStore.setQuietStart(appContext, value)
    override fun setQuietEnd(value: Int) = LocalStore.setQuietEnd(appContext, value)
    override fun isQuietHour(hour: Int) = LocalStore.isQuietHour(appContext, hour)
    override fun motivationMaxPerDay() = LocalStore.motivationMaxPerDay(appContext)
    override fun setMotivationMaxPerDay(value: Int) = LocalStore.setMotivationMaxPerDay(appContext, value)
    override fun claimMotivationSlot() = LocalStore.claimMotivationSlot(appContext)
    override fun waterCountToday() = LocalStore.waterCountToday(appContext)
    override fun recordWater() = LocalStore.recordWater(appContext)
    override fun treatments() = LocalStore.treatments(appContext)
    override fun saveTreatment(reminder: TreatmentReminder) = LocalStore.saveTreatment(appContext, reminder)
    override fun removeTreatment(id: Int) = LocalStore.removeTreatment(appContext, id)
    override fun emergencyName() = LocalStore.emergencyName(appContext)
    override fun emergencyContact() = LocalStore.emergencyContact(appContext)
    override fun emergencyNote() = LocalStore.emergencyNote(appContext)
    override fun saveEmergencyCard(name: String, contact: String, note: String) =
        LocalStore.saveEmergencyCard(appContext, name, contact, note)
}

object RawafidRepositories {
    @Volatile
    private var localRepository: RawafidLocalRepository? = null

    fun local(context: Context): RawafidLocalRepository {
        localRepository?.let { return it }
        return synchronized(this) {
            localRepository ?: LegacyLocalStoreRepository(context).also { localRepository = it }
        }
    }

    internal fun replaceLocalForTests(repository: RawafidLocalRepository?) {
        localRepository = repository
    }
}
