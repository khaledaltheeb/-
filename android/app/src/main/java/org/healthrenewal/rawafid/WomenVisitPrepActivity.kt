package org.healthrenewal.rawafid

import android.content.Context
import android.content.Intent
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
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
import java.time.LocalDate
import java.time.temporal.ChronoUnit

private data class VisitCalendarRow(
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

private object WomenVisitPrepData {
    private const val LEGACY_CALENDAR_PREFS = "rawafid_women_calendar_native_v1"
    private const val LEGACY_ENTRIES = "entries"
    private const val ENCRYPTED_ENTRIES = "rawafid_women_calendar_entries_v2"

    fun recentCalendar(context: Context): List<VisitCalendarRow> {
        val raw = SensitiveLocalPayload.read(
            context = context,
            encryptedKey = ENCRYPTED_ENTRIES,
            legacyPrefsName = LEGACY_CALENDAR_PREFS,
            legacyKey = LEGACY_ENTRIES,
            defaultValue = "[]",
            validator = { runCatching { JSONArray(it) }.isSuccess }
        )
        val today = LocalDate.now()
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val item = array.getJSONObject(i)
                    val date = LocalDate.parse(item.getString("date"))
                    if (ChronoUnit.DAYS.between(date, today) in 0..29) {
                        add(
                            VisitCalendarRow(
                                date,
                                item.optInt("mood", 3),
                                item.optInt("energy", 3),
                                item.optInt("sleep", 3),
                                item.optInt("pain", 0),
                                item.optInt("headache", 0),
                                item.optInt("pelvicPain", 0),
                                item.optString("bleeding", "none"),
                                item.optString("note", "")
                            )
                        )
                    }
                }
            }.sortedByDescending { it.date }
        }.getOrDefault(emptyList())
    }

    fun buildSummary(context: Context, questions: String, medicines: String, changes: String): String {
        val rows = recentCalendar(context)
        val profile = WomenProfileStore.load(context)
        val nextCare = WomenCarePlannerStore.items(context).firstOrNull { it.atMillis > System.currentTimeMillis() }
        val notes = rows.map { it.note.trim() }.filter { it.isNotBlank() }.take(8)

        return buildString {
            appendLine("ملخص روافد للتحضير للزيارة")
            appendLine("تم إنشاؤه من بيانات محفوظة محليًا ومشفرة على الهاتف.")
            appendLine()
            appendLine("المرحلة التي اختارتها المستخدمة: ${profile.stage.label}")
            appendLine("دورات غير منتظمة (حسب اختيار المستخدمة): ${if (profile.irregularCycles) "نعم" else "لا"}")
            appendLine()
            appendLine("آخر 30 يومًا:")
            if (rows.isEmpty()) {
                appendLine("- لا توجد إدخالات كافية في تقويم المرأة.")
            } else {
                appendLine("- أيام مسجلة: ${rows.size}")
                appendLine("- متوسط المزاج الوصفي: ${one(rows.map { it.mood }.average())}/5")
                appendLine("- متوسط الطاقة الوصفي: ${one(rows.map { it.energy }.average())}/5")
                appendLine("- متوسط النوم الوصفي: ${one(rows.map { it.sleep }.average())}/5")
                appendLine("- أعلى ألم عام مسجل: ${rows.maxOf { it.pain }}/10")
                appendLine("- أيام الصداع: ${rows.count { it.headache > 0 }}")
                appendLine("- أيام ألم الحوض: ${rows.count { it.pelvicPain > 0 }}")
                appendLine("- أيام النزف: ${rows.count { it.bleeding != "none" }}")
                if (notes.isNotEmpty()) {
                    appendLine("- ملاحظات حديثة مختارة:")
                    notes.forEach { appendLine("  • $it") }
                }
            }
            appendLine()
            if (changes.isNotBlank()) {
                appendLine("ما تغير أو ما يقلقني:")
                appendLine(changes.trim())
                appendLine()
            }
            if (medicines.isNotBlank()) {
                appendLine("أدوية/مكملات أريد ذكرها:")
                appendLine(medicines.trim())
                appendLine()
            }
            if (questions.isNotBlank()) {
                appendLine("أسئلتي للزيارة:")
                appendLine(questions.trim())
                appendLine()
            }
            if (nextCare != null) {
                appendLine("أقرب عنصر في خطة العناية: ${nextCare.title}")
                if (nextCare.note.isNotBlank()) appendLine("ملاحظة الموعد: ${nextCare.note}")
                if (nextCare.preparation.isNotBlank()) appendLine("تعليمات التحضير المسجلة: ${nextCare.preparation}")
                appendLine()
            }
            appendLine("مهم: هذا ملخص وصفي وليس تشخيصًا أو تفسيرًا للسبب. يمكن للطبيبة استخدامه لفهم ما سجلته المستخدمة عبر الوقت.")
        }
    }

    private fun one(value: Double): String = if (value.isNaN()) "-" else String.format("%.1f", value)
}

class WomenVisitPrepActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (!WomenPrivacyGate.requireUnlocked(this, WomenPrivacyGate.TARGET_VISIT_PREP)) return
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { WomenVisitPrepScreen() }
                }
            }
        }
    }
}

@Composable
private fun WomenVisitPrepScreen() {
    val context = LocalContext.current
    var changes by rememberSaveable { mutableStateOf("") }
    var medicines by rememberSaveable { mutableStateOf("") }
    var questions by rememberSaveable { mutableStateOf("") }
    var summary by remember { mutableStateOf(WomenVisitPrepData.buildSummary(context, "", "", "")) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("جهزي زيارتي", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text("اجمعي ما سجلته خلال الفترة الأخيرة مع أسئلتك وتغيراتك في صفحة واحدة. لا تُرفع هذه البيانات إلى خادم عند إنشاء الملخص.")
                }
            }
        }
        item {
            OutlinedTextField(changes, { changes = it.take(1200) }, modifier = Modifier.fillMaxWidth(), minLines = 3, label = { Text("ما الذي تغير أو يقلقني؟") })
        }
        item {
            OutlinedTextField(medicines, { medicines = it.take(1200) }, modifier = Modifier.fillMaxWidth(), minLines = 3, label = { Text("الأدوية والمكملات التي أريد ذكرها") })
        }
        item {
            OutlinedTextField(questions, { questions = it.take(1600) }, modifier = Modifier.fillMaxWidth(), minLines = 4, label = { Text("أسئلتي للطبيبة") })
        }
        item {
            Button(onClick = { summary = WomenVisitPrepData.buildSummary(context, questions, medicines, changes) }, modifier = Modifier.fillMaxWidth()) {
                Text("تحديث الملخص")
            }
        }
        item {
            Card {
                Text(summary, modifier = Modifier.padding(18.dp))
            }
        }
        item {
            Button(onClick = {
                val refreshed = WomenVisitPrepData.buildSummary(context, questions, medicines, changes)
                summary = refreshed
                context.startActivity(
                    Intent.createChooser(
                        Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, refreshed)
                        },
                        "مشاركة ملخص الزيارة"
                    )
                )
            }, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Default.Share, contentDescription = null)
                Text(" مشاركة الملخص")
            }
        }
        item {
            Text("المشاركة تتم فقط عندما تضغطين الزر وتختارين تطبيقًا خارجيًا. تحققي من محتوى الملخص قبل إرساله لأنه قد يحتوي معلومات صحية خاصة.", style = MaterialTheme.typography.bodySmall)
        }
    }
}
