package org.healthrenewal.rawafid

import android.app.DatePickerDialog
import android.content.Context
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
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
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
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

private data class CycleSettings(
    val lastPeriodStart: LocalDate?,
    val cycleLength: Int,
    val bleedLength: Int,
    val variability: Int
)

private data class CalendarEntry(
    val date: LocalDate,
    val mood: Int,
    val energy: Int,
    val sleep: Int,
    val pain: Int,
    val headache: Int,
    val pelvicPain: Int,
    val bleeding: String,
    val note: String
)

private object WomenCalendarStore {
    private const val PREFS = "rawafid_women_calendar_native_v1"
    private const val ENTRIES = "entries"
    private const val ENCRYPTED_ENTRIES = "rawafid_women_calendar_entries_v2"
    private const val ENCRYPTED_SETTINGS = "rawafid_women_calendar_settings_v2"
    private val legacySettingsKeys = arrayOf("last_period_start", "cycle_length", "bleed_length", "variability")
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun settings(context: Context): CycleSettings {
        val raw = EncryptedLocalStore.get(context, ENCRYPTED_SETTINGS) ?: migrateLegacySettings(context)
        if (raw.isNullOrBlank()) return CycleSettings(null, 28, 5, 2)
        return runCatching {
            val value = JSONObject(raw)
            CycleSettings(
                lastPeriodStart = value.optString("last_period_start").takeIf { it.isNotBlank() }?.let { LocalDate.parse(it) },
                cycleLength = value.optInt("cycle_length", 28).coerceIn(15, 90),
                bleedLength = value.optInt("bleed_length", 5).coerceIn(1, 14),
                variability = value.optInt("variability", 2).coerceIn(0, 14)
            )
        }.getOrDefault(CycleSettings(null, 28, 5, 2))
    }

    fun saveSettings(context: Context, settings: CycleSettings) {
        val value = JSONObject()
            .put("last_period_start", settings.lastPeriodStart?.toString() ?: "")
            .put("cycle_length", settings.cycleLength.coerceIn(15, 90))
            .put("bleed_length", settings.bleedLength.coerceIn(1, 14))
            .put("variability", settings.variability.coerceIn(0, 14))
        EncryptedLocalStore.put(context, ENCRYPTED_SETTINGS, value.toString())
        clearLegacySettings(context)
    }

    fun entries(context: Context): List<CalendarEntry> {
        val raw = SensitiveLocalPayload.read(
            context = context,
            encryptedKey = ENCRYPTED_ENTRIES,
            legacyPrefsName = PREFS,
            legacyKey = ENTRIES,
            defaultValue = "[]",
            validator = { runCatching { JSONArray(it) }.isSuccess }
        )
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val item = array.getJSONObject(i)
                    add(
                        CalendarEntry(
                            date = LocalDate.parse(item.getString("date")),
                            mood = item.optInt("mood", 3),
                            energy = item.optInt("energy", 3),
                            sleep = item.optInt("sleep", 3),
                            pain = item.optInt("pain", 0),
                            headache = item.optInt("headache", 0),
                            pelvicPain = item.optInt("pelvicPain", 0),
                            bleeding = item.optString("bleeding", "none"),
                            note = item.optString("note", "")
                        )
                    )
                }
            }.sortedByDescending { it.date }.take(365)
        }.getOrDefault(emptyList())
    }

    fun saveEntry(context: Context, entry: CalendarEntry) {
        val all = (listOf(entry) + entries(context).filterNot { it.date == entry.date }).take(365)
        val array = JSONArray()
        all.forEach { value ->
            array.put(JSONObject().apply {
                put("date", value.date.toString())
                put("mood", value.mood)
                put("energy", value.energy)
                put("sleep", value.sleep)
                put("pain", value.pain)
                put("headache", value.headache)
                put("pelvicPain", value.pelvicPain)
                put("bleeding", value.bleeding)
                put("note", value.note)
            })
        }
        SensitiveLocalPayload.write(context, ENCRYPTED_ENTRIES, array.toString(), PREFS, ENTRIES)
    }

    private fun migrateLegacySettings(context: Context): String? {
        val p = prefs(context)
        if (legacySettingsKeys.none { p.contains(it) }) return null
        val value = JSONObject()
            .put("last_period_start", p.getString("last_period_start", "") ?: "")
            .put("cycle_length", p.getInt("cycle_length", 28).coerceIn(15, 90))
            .put("bleed_length", p.getInt("bleed_length", 5).coerceIn(1, 14))
            .put("variability", p.getInt("variability", 2).coerceIn(0, 14))
            .toString()
        EncryptedLocalStore.put(context, ENCRYPTED_SETTINGS, value)
        clearLegacySettings(context)
        return value
    }

    private fun clearLegacySettings(context: Context) {
        val edit = prefs(context).edit()
        legacySettingsKeys.forEach(edit::remove)
        edit.apply()
    }
}

class WomenCalendarActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (!WomenPrivacyGate.requireUnlocked(this, WomenPrivacyGate.TARGET_CALENDAR)) return
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { WomenCalendarScreen() }
                }
            }
        }
    }
}

@Composable
private fun WomenCalendarScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var settings by remember(version) { mutableStateOf(WomenCalendarStore.settings(context)) }
    val today = LocalDate.now()
    val todayEntry = remember(version) { WomenCalendarStore.entries(context).firstOrNull { it.date == today } }

    var mood by rememberSaveable(todayEntry?.date) { mutableIntStateOf(todayEntry?.mood ?: 3) }
    var energy by rememberSaveable(todayEntry?.date) { mutableIntStateOf(todayEntry?.energy ?: 3) }
    var sleep by rememberSaveable(todayEntry?.date) { mutableIntStateOf(todayEntry?.sleep ?: 3) }
    var pain by rememberSaveable(todayEntry?.date) { mutableIntStateOf(todayEntry?.pain ?: 0) }
    var headache by rememberSaveable(todayEntry?.date) { mutableIntStateOf(todayEntry?.headache ?: 0) }
    var pelvicPain by rememberSaveable(todayEntry?.date) { mutableIntStateOf(todayEntry?.pelvicPain ?: 0) }
    var bleeding by rememberSaveable(todayEntry?.date) { mutableStateOf(todayEntry?.bleeding ?: "none") }
    var note by rememberSaveable(todayEntry?.date) { mutableStateOf(todayEntry?.note ?: "") }
    var saved by remember { mutableStateOf("") }

    val cycle = remember(settings, today) { calculateCycle(settings, today) }
    val recent = remember(version) { WomenCalendarStore.entries(context).filter { !it.date.isBefore(today.minusDays(29)) } }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("تقويم المرأة المتقدم", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text("تتبّع محلي ومشفر للنمط عبر الأيام: الدورة، المزاج، الطاقة، النوم، الألم، الصداع وألم الحوض. لا يرسل هذه البيانات إلى الخادم.")
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("إعداد نمط الدورة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("استخدمي أرقامك المعتادة إن كنت تعرفينها. هذه الإعدادات تصف النمط ولا تؤكد الإباضة أو الحمل.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    OutlinedButton(onClick = {
                        val base = settings.lastPeriodStart ?: today
                        DatePickerDialog(
                            context,
                            { _, year, month, day ->
                                val selected = LocalDate.of(year, month + 1, day)
                                settings = settings.copy(lastPeriodStart = selected)
                                WomenCalendarStore.saveSettings(context, settings)
                                version++
                            },
                            base.year,
                            base.monthValue - 1,
                            base.dayOfMonth
                        ).show()
                    }) {
                        Text("آخر بداية دورة: ${settings.lastPeriodStart?.format(DateTimeFormatter.ISO_LOCAL_DATE) ?: "غير محددة"}")
                    }
                    NumberControl("طول الدورة المعتاد", settings.cycleLength, 15, 90, "يوم") {
                        settings = settings.copy(cycleLength = it); WomenCalendarStore.saveSettings(context, settings); version++
                    }
                    NumberControl("مدة النزف المعتادة", settings.bleedLength, 1, 14, "يوم") {
                        settings = settings.copy(bleedLength = it); WomenCalendarStore.saveSettings(context, settings); version++
                    }
                    NumberControl("هامش التفاوت", settings.variability, 0, 14, "يوم") {
                        settings = settings.copy(variability = it); WomenCalendarStore.saveSettings(context, settings); version++
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("صورة اليوم", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    if (cycle == null) {
                        Text("حددي تاريخ آخر بداية دورة لعرض يوم الدورة والنافذة التقديرية للدورة التالية.")
                    } else {
                        Text("يوم الدورة التقريبي: ${cycle.cycleDay}")
                        Text("بداية الدورة التالية المقدرة: ${cycle.nextStart}")
                        Text("نافذة متوقعة مع هامش التفاوت: ${cycle.windowStart} — ${cycle.windowEnd}")
                        Text("هذه نافذة تقديرية للدورة فقط وليست نافذة خصوبة، ولا يجب استخدامها لمنع الحمل.", color = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("متابعة اليوم", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    MetricSliderCalendar("المزاج", mood, 1, 5) { mood = it }
                    MetricSliderCalendar("الطاقة", energy, 1, 5) { energy = it }
                    MetricSliderCalendar("جودة النوم", sleep, 1, 5) { sleep = it }
                    MetricSliderCalendar("الألم العام", pain, 0, 10) { pain = it }
                    MetricSliderCalendar("الصداع", headache, 0, 10) { headache = it }
                    MetricSliderCalendar("ألم الحوض", pelvicPain, 0, 10) { pelvicPain = it }
                    Text("النزف", fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("none" to "لا يوجد", "light" to "خفيف", "moderate" to "متوسط", "heavy" to "غزير").forEach { (value, label) ->
                            FilterChip(selected = bleeding == value, onClick = { bleeding = value }, label = { Text(label) })
                        }
                    }
                    OutlinedTextField(
                        value = note,
                        onValueChange = { note = it.take(800) },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3,
                        label = { Text("ملاحظة: أعراض، أدوية، ضغوط، نشاط أو شيء مختلف اليوم") }
                    )
                    Button(onClick = {
                        WomenCalendarStore.saveEntry(context, CalendarEntry(today, mood, energy, sleep, pain, headache, pelvicPain, bleeding, note.trim()))
                        saved = "تم حفظ يومك محليًا بشكل مشفر."
                        version++
                    }) { Text("حفظ اليوم") }
                    if (saved.isNotBlank()) Text(saved, color = MaterialTheme.colorScheme.primary)
                    if (pain >= 8 || headache >= 8 || pelvicPain >= 8 || bleeding == "heavy") {
                        Text("إذا كان العرض شديدًا جدًا، مفاجئًا، مختلفًا بوضوح عن المعتاد، أو ترافق مع إغماء/دوخة شديدة/حمى أو شعور بأنك لست بخير، فلا تعتمدي على التقويم وحده واطلبي تقييمًا طبيًا مناسبًا.", color = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("اتجاهات آخر 30 يومًا", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    if (recent.isEmpty()) {
                        Text("لا توجد بيانات كافية بعد. سجلي أيامًا متفرقة؛ لا نحتاج سجلًا مثاليًا.")
                    } else {
                        Text("أيام مسجلة: ${recent.size}/30")
                        Text("متوسط المزاج: ${formatOne(recent.map { it.mood }.average())}/5")
                        Text("متوسط الطاقة: ${formatOne(recent.map { it.energy }.average())}/5")
                        Text("متوسط النوم: ${formatOne(recent.map { it.sleep }.average())}/5")
                        Text("أيام الصداع: ${recent.count { it.headache > 0 }}")
                        Text("أيام ألم الحوض: ${recent.count { it.pelvicPain > 0 }}")
                        Text("أيام النزف: ${recent.count { it.bleeding != "none" }}")
                        Text("هذه إحصاءات وصفية فقط. وجود ارتباط زمني لا يعني أن الدورة هي سبب العرض.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }

        if (recent.isNotEmpty()) {
            item { Text("آخر الإدخالات", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
            items(recent.take(10), key = { it.date.toString() }) { entry ->
                Card {
                    Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(entry.date.toString(), fontWeight = FontWeight.Bold)
                        Text("مزاج ${entry.mood}/5 · طاقة ${entry.energy}/5 · نوم ${entry.sleep}/5")
                        Text("ألم ${entry.pain}/10 · صداع ${entry.headache}/10 · حوض ${entry.pelvicPain}/10")
                        if (entry.bleeding != "none") Text("النزف: ${bleedingLabel(entry.bleeding)}")
                        if (entry.note.isNotBlank()) Text(entry.note, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}

private data class CycleSnapshot(val cycleDay: Long, val nextStart: LocalDate, val windowStart: LocalDate, val windowEnd: LocalDate)

private fun calculateCycle(settings: CycleSettings, today: LocalDate): CycleSnapshot? {
    val original = settings.lastPeriodStart ?: return null
    var start = original
    if (start.isAfter(today)) return null
    while (!start.plusDays(settings.cycleLength.toLong()).isAfter(today)) {
        start = start.plusDays(settings.cycleLength.toLong())
    }
    val cycleDay = ChronoUnit.DAYS.between(start, today) + 1
    val next = start.plusDays(settings.cycleLength.toLong())
    return CycleSnapshot(
        cycleDay = cycleDay,
        nextStart = next,
        windowStart = next.minusDays(settings.variability.toLong()),
        windowEnd = next.plusDays(settings.variability.toLong())
    )
}

@Composable
private fun MetricSliderCalendar(label: String, value: Int, min: Int, max: Int, onChange: (Int) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text("$label: $value/$max", fontWeight = FontWeight.Bold)
        Slider(
            value = value.toFloat(),
            onValueChange = { onChange(it.toInt().coerceIn(min, max)) },
            valueRange = min.toFloat()..max.toFloat(),
            steps = (max - min - 1).coerceAtLeast(0)
        )
    }
}

@Composable
private fun NumberControl(label: String, value: Int, min: Int, max: Int, unit: String, onChange: (Int) -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text("$label: $value $unit", modifier = Modifier.padding(top = 12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            OutlinedButton(onClick = { onChange((value - 1).coerceAtLeast(min)) }, enabled = value > min) { Text("−") }
            OutlinedButton(onClick = { onChange((value + 1).coerceAtMost(max)) }, enabled = value < max) { Text("+") }
        }
    }
}

private fun formatOne(value: Double) = if (value.isNaN()) "—" else String.format("%.1f", value)
private fun bleedingLabel(value: String) = when (value) {
    "light" -> "خفيف"
    "moderate" -> "متوسط"
    "heavy" -> "غزير"
    else -> "لا يوجد"
}
