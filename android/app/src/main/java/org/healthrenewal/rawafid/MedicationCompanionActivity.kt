package org.healthrenewal.rawafid

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

data class MedicationItem(
    val id: Long,
    val name: String,
    val instruction: String,
    val hour: Int,
    val minute: Int,
    val reminderEnabled: Boolean,
    val remaining: Int?
)

data class MedicationLog(val medicationId: Long, val day: String, val status: String, val note: String)

object MedicationStore {
    private const val PREFS = "rawafid_medication_companion_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun medications(context: Context): List<MedicationItem> {
        val raw = prefs(context).getString("medications", "[]") ?: "[]"
        return runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    add(MedicationItem(o.optLong("id"), o.optString("name"), o.optString("instruction"), o.optInt("hour"), o.optInt("minute"), o.optBoolean("reminder"), if (o.has("remaining") && !o.isNull("remaining")) o.optInt("remaining") else null))
                }
            }.sortedWith(compareBy<MedicationItem> { it.hour }.thenBy { it.minute })
        }.getOrDefault(emptyList())
    }

    fun saveMedications(context: Context, values: List<MedicationItem>) {
        val a = JSONArray()
        values.take(100).forEach { m ->
            a.put(JSONObject().put("id", m.id).put("name", m.name).put("instruction", m.instruction).put("hour", m.hour).put("minute", m.minute).put("reminder", m.reminderEnabled).put("remaining", m.remaining ?: JSONObject.NULL))
        }
        prefs(context).edit().putString("medications", a.toString()).apply()
    }

    fun logs(context: Context): List<MedicationLog> {
        val raw = prefs(context).getString("logs", "[]") ?: "[]"
        return runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    add(MedicationLog(o.optLong("medication_id"), o.optString("day"), o.optString("status"), o.optString("note")))
                }
            }.take(1000)
        }.getOrDefault(emptyList())
    }

    fun logToday(context: Context, medicationId: Long, status: String, note: String = "") {
        val today = LocalDate.now().toString()
        val next = listOf(MedicationLog(medicationId, today, status, note)) + logs(context).filterNot { it.medicationId == medicationId && it.day == today }
        val a = JSONArray()
        next.take(1000).forEach { l -> a.put(JSONObject().put("medication_id", l.medicationId).put("day", l.day).put("status", l.status).put("note", l.note)) }
        prefs(context).edit().putString("logs", a.toString()).apply()
    }

    fun todayStatus(context: Context, medicationId: Long): String? = logs(context).firstOrNull { it.medicationId == medicationId && it.day == LocalDate.now().toString() }?.status
}

object MedicationReminderScheduler {
    fun sync(context: Context, medication: MedicationItem) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pending = pending(context, medication.id)
        alarm.cancel(pending)
        if (!medication.reminderEnabled) return
        alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextOccurrence(medication.hour, medication.minute), pending)
    }

    fun cancel(context: Context, id: Long) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarm.cancel(pending(context, id))
    }

    fun syncAll(context: Context) = MedicationStore.medications(context).forEach { sync(context, it) }

    private fun pending(context: Context, id: Long) = PendingIntent.getBroadcast(
        context,
        (id xor (id ushr 32)).toInt(),
        Intent(context, MedicationReminderReceiver::class.java).putExtra("medication_id", id),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    private fun nextOccurrence(hour: Int, minute: Int): Long {
        val now = LocalDateTime.now()
        var next = LocalDateTime.of(now.toLocalDate(), LocalTime.of(hour.coerceIn(0, 23), minute.coerceIn(0, 59)))
        if (!next.isAfter(now)) next = next.plusDays(1)
        return next.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
    }
}

class MedicationReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val id = intent?.getLongExtra("medication_id", -1L) ?: -1L
        val medication = MedicationStore.medications(context).firstOrNull { it.id == id } ?: return
        if (!medication.reminderEnabled) return

        MedicationReminderScheduler.sync(context, medication)

        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return

        NotificationChannels.create(context)
        val open = PendingIntent.getActivity(context, 9700 + id.toInt().and(0x0fff), Intent(context, MedicationCompanionActivity::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
        val body = if (medication.instruction.isBlank()) "تذكير بالعلاج الذي سجلته في روافد." else medication.instruction
        manager.notify(
            9800 + id.toInt().and(0x0fff),
            androidx.core.app.NotificationCompat.Builder(context, NotificationChannels.TREATMENT)
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentTitle(medication.name)
                .setContentText(body)
                .setStyle(androidx.core.app.NotificationCompat.BigTextStyle().bigText(body))
                .setContentIntent(open)
                .setAutoCancel(true)
                .build()
        )
    }
}

class MedicationCompanionActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { MedicationCompanionScreen() }
                }
            }
        }
    }
}

@Composable
private fun MedicationCompanionScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var name by rememberSaveable { mutableStateOf("") }
    var instruction by rememberSaveable { mutableStateOf("") }
    var time by rememberSaveable { mutableStateOf("08:00") }
    var remaining by rememberSaveable { mutableStateOf("") }
    val meds = remember(version) { MedicationStore.medications(context) }
    val requestNotifications = rememberNotificationPermissionRequester()

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("رفيق العلاج", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("يسجل ويذكّر بما أدخلته أنت أو وصفه مختصك. لا يغيّر جرعة ولا يقترح علاجًا.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    Text("إضافة علاج", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(name, { name = it.take(100) }, label = { Text("اسم الدواء/العلاج") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(instruction, { instruction = it.take(300) }, label = { Text("تعليماتك المسجلة — مثال: حسب وصف الطبيب") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(time, { time = it.take(5) }, label = { Text("الوقت HH:mm") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(remaining, { remaining = it.filter(Char::isDigit).take(5) }, label = { Text("المتبقي — اختياري") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = {
                        val parsed = runCatching { LocalTime.parse(time, DateTimeFormatter.ofPattern("HH:mm")) }.getOrNull()
                        if (name.isNotBlank() && parsed != null) {
                            val id = System.currentTimeMillis()
                            val item = MedicationItem(id, name.trim(), instruction.trim(), parsed.hour, parsed.minute, true, remaining.toIntOrNull())
                            MedicationStore.saveMedications(context, meds + item)
                            MedicationReminderScheduler.sync(context, item)
                            requestNotifications()
                            name = ""; instruction = ""; remaining = ""; version++
                        }
                    }) { Text("حفظ وتفعيل التذكير") }
                }
            }
        }
        if (meds.isEmpty()) item { Text("لا توجد علاجات محفوظة.") }
        items(meds, key = { it.id }) { med ->
            val status = MedicationStore.todayStatus(context, med.id)
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(med.name, fontWeight = FontWeight.Bold)
                    Text(String.format("%02d:%02d", med.hour, med.minute))
                    if (med.instruction.isNotBlank()) Text(med.instruction)
                    med.remaining?.let { Text("المتبقي المسجل: $it") }
                    Text("اليوم: ${status ?: "لم يُسجل"}")
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(onClick = { MedicationStore.logToday(context, med.id, "أخذته"); version++ }) { Text("أخذته") }
                        OutlinedButton(onClick = { MedicationStore.logToday(context, med.id, "تخطيته"); version++ }) { Text("تخطيته") }
                    }
                    TextButton(onClick = {
                        MedicationReminderScheduler.cancel(context, med.id)
                        MedicationStore.saveMedications(context, meds.filterNot { it.id == med.id })
                        version++
                    }) { Text("حذف") }
                }
            }
        }
    }
}
