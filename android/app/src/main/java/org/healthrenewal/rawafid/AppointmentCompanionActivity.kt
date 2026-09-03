package org.healthrenewal.rawafid

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
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
import org.json.JSONArray
import org.json.JSONObject
import java.text.DateFormat
import java.util.Calendar
import java.util.Date

data class AppointmentNotes(
    val appointmentId: Int,
    val questions: String = "",
    val symptoms: String = "",
    val medicines: String = "",
    val filesToTake: String = "",
    val clinicianPlan: String = "",
    val followUp: String = ""
)

object AppointmentCompanionStore {
    private const val PREFS = "rawafid_appointment_companion_v1"
    private const val LEGACY_KEY = "notes"
    private const val ENCRYPTED_KEY = "rawafid_appointment_companion_notes_v2"

    fun all(context: Context): List<AppointmentNotes> {
        val raw = SensitiveLocalPayload.read(
            context = context,
            encryptedKey = ENCRYPTED_KEY,
            legacyPrefsName = PREFS,
            legacyKey = LEGACY_KEY,
            defaultValue = "[]",
            validator = { runCatching { JSONArray(it) }.isSuccess }
        )
        return runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    add(AppointmentNotes(o.optInt("id"), o.optString("questions"), o.optString("symptoms"), o.optString("medicines"), o.optString("files"), o.optString("plan"), o.optString("follow_up")))
                }
            }
        }.getOrDefault(emptyList())
    }

    fun get(context: Context, id: Int) = all(context).firstOrNull { it.appointmentId == id } ?: AppointmentNotes(id)

    fun save(context: Context, notes: AppointmentNotes) {
        write(context, listOf(notes) + all(context).filterNot { it.appointmentId == notes.appointmentId })
    }

    fun remove(context: Context, id: Int) {
        write(context, all(context).filterNot { it.appointmentId == id })
    }

    private fun write(context: Context, values: List<AppointmentNotes>) {
        val a = JSONArray()
        values.take(200).forEach { n ->
            a.put(JSONObject().put("id", n.appointmentId).put("questions", n.questions).put("symptoms", n.symptoms).put("medicines", n.medicines).put("files", n.filesToTake).put("plan", n.clinicianPlan).put("follow_up", n.followUp))
        }
        SensitiveLocalPayload.write(context, ENCRYPTED_KEY, a.toString(), PREFS, LEGACY_KEY)
    }
}

class AppointmentCompanionActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { AppointmentCompanionScreen() }
                }
            }
        }
    }
}

@Composable
private fun AppointmentCompanionScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var title by rememberSaveable { mutableStateOf("موعد طبي") }
    var reminderNote by rememberSaveable { mutableStateOf("") }
    var selectedId by remember { mutableStateOf<Int?>(null) }
    val appointments = remember(version) { LocalStore.treatments(context).sortedBy { it.timeMillis } }

    fun addAppointment() {
        val now = Calendar.getInstance()
        DatePickerDialog(context, { _, year, month, day ->
            TimePickerDialog(context, { _, hour, minute ->
                val at = Calendar.getInstance().apply {
                    set(year, month, day, hour, minute, 0)
                    set(Calendar.MILLISECOND, 0)
                }.timeInMillis
                if (at > System.currentTimeMillis()) {
                    val id = (((at / 60000L) xor title.hashCode().toLong()).toInt() and Int.MAX_VALUE).coerceAtLeast(1)
                    val reminder = TreatmentReminder(id, at, title.trim().ifBlank { "موعد طبي" }, reminderNote.trim())
                    LocalStore.saveTreatment(context, reminder)
                    TreatmentReminderScheduler.schedule(context, reminder)
                    selectedId = id
                    version++
                }
            }, now.get(Calendar.HOUR_OF_DAY), now.get(Calendar.MINUTE), false).show()
        }, now.get(Calendar.YEAR), now.get(Calendar.MONTH), now.get(Calendar.DAY_OF_MONTH)).show()
    }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("رفيق الموعد", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("قبل الموعد: أسئلتك وأعراضك وأدويتك وملفاتك. بعده: ما قاله المختص والخطوة التالية. تحفظ هذه البيانات محليًا بشكل مشفر، ولا يفسر روافد الخطة الطبية نيابة عن المختص.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    Text("موعد جديد", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(title, { title = it.take(100) }, label = { Text("اسم الموعد") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(reminderNote, { reminderNote = it.take(300) }, label = { Text("ملاحظة التذكير") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = ::addAppointment) { Text("اختيار التاريخ والوقت") }
                }
            }
        }
        if (appointments.isEmpty()) item { Text("لا توجد مواعيد قادمة محفوظة.") }
        items(appointments, key = { it.id }) { appointment ->
            Card(onClick = { selectedId = appointment.id }) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                    Text(appointment.title, fontWeight = FontWeight.Bold)
                    Text(DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(appointment.timeMillis)))
                    if (appointment.note.isNotBlank()) Text(appointment.note)
                    Text(if (selectedId == appointment.id) "مفتوح للتحضير أدناه" else "اضغط لتحضير الزيارة", color = MaterialTheme.colorScheme.primary)
                }
            }
        }
        selectedId?.let { id ->
            val appointment = appointments.firstOrNull { it.id == id }
            if (appointment != null) {
                item(key = "prep_$id") {
                    AppointmentPrepCard(
                        appointment = appointment,
                        initial = AppointmentCompanionStore.get(context, id),
                        onSaved = { AppointmentCompanionStore.save(context, it) },
                        onDelete = {
                            TreatmentReminderScheduler.cancel(context, appointment)
                            LocalStore.removeTreatment(context, appointment.id)
                            AppointmentCompanionStore.remove(context, appointment.id)
                            selectedId = null
                            version++
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun AppointmentPrepCard(
    appointment: TreatmentReminder,
    initial: AppointmentNotes,
    onSaved: (AppointmentNotes) -> Unit,
    onDelete: () -> Unit
) {
    var questions by rememberSaveable(appointment.id) { mutableStateOf(initial.questions) }
    var symptoms by rememberSaveable(appointment.id) { mutableStateOf(initial.symptoms) }
    var medicines by rememberSaveable(appointment.id) { mutableStateOf(initial.medicines) }
    var files by rememberSaveable(appointment.id) { mutableStateOf(initial.filesToTake) }
    var plan by rememberSaveable(appointment.id) { mutableStateOf(initial.clinicianPlan) }
    var followUp by rememberSaveable(appointment.id) { mutableStateOf(initial.followUp) }

    Card {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
            Text("جهز هذا الموعد", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            OutlinedTextField(questions, { questions = it.take(1200) }, label = { Text("أسئلتي") }, minLines = 3, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(symptoms, { symptoms = it.take(1200) }, label = { Text("الأعراض/التغيرات التي أريد ذكرها") }, minLines = 3, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(medicines, { medicines = it.take(1200) }, label = { Text("الأدوية/المكملات التي أريد إبلاغ المختص بها") }, minLines = 2, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(files, { files = it.take(800) }, label = { Text("ملفات أو تقارير أريد أخذها") }, minLines = 2, modifier = Modifier.fillMaxWidth())
            Text("بعد الموعد", fontWeight = FontWeight.Bold)
            OutlinedTextField(plan, { plan = it.take(1600) }, label = { Text("ما قاله المختص / الخطة كما فهمتها") }, minLines = 3, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(followUp, { followUp = it.take(800) }, label = { Text("المتابعة أو الخطوة القادمة") }, minLines = 2, modifier = Modifier.fillMaxWidth())
            Button(onClick = { onSaved(AppointmentNotes(appointment.id, questions, symptoms, medicines, files, plan, followUp)) }) { Text("حفظ محلي مشفر") }
            TextButton(onClick = onDelete) { Text("حذف الموعد وبيانات التحضير") }
        }
    }
}
