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
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
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
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

data class HealthTimelineEntry(
    val id: Long,
    val createdAt: Long,
    val type: String,
    val title: String,
    val severity: Int,
    val note: String
)

object HealthTimelineStore {
    private const val PREFS = "rawafid_health_timeline_v1"
    private const val KEY = "entries"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun entries(context: Context): List<HealthTimelineEntry> {
        val raw = prefs(context).getString(KEY, "[]") ?: "[]"
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val o = array.optJSONObject(i) ?: continue
                    add(
                        HealthTimelineEntry(
                            id = o.optLong("id"),
                            createdAt = o.optLong("created_at"),
                            type = o.optString("type", "note"),
                            title = o.optString("title"),
                            severity = o.optInt("severity", 0),
                            note = o.optString("note")
                        )
                    )
                }
            }.sortedByDescending { it.createdAt }.take(1000)
        }.getOrDefault(emptyList())
    }

    fun add(context: Context, entry: HealthTimelineEntry) {
        val all = (listOf(entry) + entries(context)).distinctBy { it.id }.take(1000)
        val array = JSONArray()
        all.forEach { item ->
            array.put(
                JSONObject()
                    .put("id", item.id)
                    .put("created_at", item.createdAt)
                    .put("type", item.type)
                    .put("title", item.title)
                    .put("severity", item.severity)
                    .put("note", item.note)
            )
        }
        prefs(context).edit().putString(KEY, array.toString()).apply()
    }

    fun remove(context: Context, id: Long) {
        val array = JSONArray()
        entries(context).filterNot { it.id == id }.forEach { item ->
            array.put(
                JSONObject()
                    .put("id", item.id)
                    .put("created_at", item.createdAt)
                    .put("type", item.type)
                    .put("title", item.title)
                    .put("severity", item.severity)
                    .put("note", item.note)
            )
        }
        prefs(context).edit().putString(KEY, array.toString()).apply()
    }

    fun visitSummary(context: Context, limit: Int = 30): String {
        val selected = entries(context).take(limit)
        val lines = mutableListOf("ملخص روافد قبل الزيارة")
        lines += "هذا ملخص وصفي أدخله المستخدم، وليس تشخيصًا أو تفسيرًا طبيًا."
        lines += ""
        if (selected.isEmpty()) lines += "لا توجد إدخالات محفوظة."
        selected.forEach { entry ->
            val time = Instant.ofEpochMilli(entry.createdAt).atZone(ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
            val severity = if (entry.severity > 0) " · شدة ${entry.severity}/10" else ""
            lines += "$time · ${labelFor(entry.type)} · ${entry.title}$severity"
            if (entry.note.isNotBlank()) lines += "  ${entry.note}"
        }
        lines += ""
        lines += "اختر ما تريد مشاركته مع مقدم الرعاية، ولا تعتمد على هذا الملخص في حالة طارئة."
        return lines.joinToString("\n")
    }

    private fun labelFor(type: String): String = when (type) {
        "symptom" -> "عرض"
        "medication" -> "دواء/تغيير علاجي"
        "sleep" -> "نوم"
        "mood" -> "مزاج"
        "appointment" -> "موعد/زيارة"
        "measurement" -> "قياس"
        else -> "ملاحظة"
    }
}

class HealthTimelineActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { HealthTimelineScreen() }
                }
            }
        }
    }
}

@Composable
private fun HealthTimelineScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var type by rememberSaveable { mutableStateOf("symptom") }
    var title by rememberSaveable { mutableStateOf("") }
    var note by rememberSaveable { mutableStateOf("") }
    var severity by rememberSaveable { mutableIntStateOf(0) }
    val entries = remember(version) { HealthTimelineStore.entries(context) }
    val types = listOf("symptom" to "عرض", "medication" to "دواء", "sleep" to "نوم", "mood" to "مزاج", "appointment" to "موعد", "measurement" to "قياس", "note" to "ملاحظة")

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("دفتر الصحة الزمني", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("سجّل ما حدث ومتى. روافد يعرض التسلسل ولا يستنتج سببًا أو تشخيصًا.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("إضافة حدث", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    types.chunked(4).forEach { row ->
                        androidx.compose.foundation.layout.Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            row.forEach { (id, label) ->
                                FilterChip(selected = type == id, onClick = { type = id }, label = { Text(label) })
                            }
                        }
                    }
                    OutlinedTextField(title, { title = it.take(120) }, label = { Text("العنوان") }, modifier = Modifier.fillMaxWidth())
                    if (type == "symptom" || type == "mood" || type == "measurement") {
                        Text("الشدة/الأهمية: $severity من 10")
                        androidx.compose.material3.Slider(value = severity.toFloat(), onValueChange = { severity = it.toInt() }, valueRange = 0f..10f, steps = 9)
                    }
                    OutlinedTextField(note, { note = it.take(800) }, label = { Text("ملاحظة اختيارية") }, minLines = 3, modifier = Modifier.fillMaxWidth())
                    Button(onClick = {
                        if (title.isNotBlank()) {
                            val now = System.currentTimeMillis()
                            HealthTimelineStore.add(context, HealthTimelineEntry(now, now, type, title.trim(), severity, note.trim()))
                            title = ""; note = ""; severity = 0; version++
                        }
                    }) { Text("حفظ محلي") }
                }
            }
        }
        item {
            OutlinedButton(modifier = Modifier.fillMaxWidth(), onClick = {
                val summary = HealthTimelineStore.visitSummary(context)
                val intent = Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, summary) }
                context.startActivity(Intent.createChooser(intent, "مشاركة ملخص الزيارة"))
            }) { Text("جهّز زيارتي") }
        }
        if (entries.isEmpty()) item { Text("لا توجد أحداث محفوظة بعد.") }
        items(entries, key = { it.id }) { entry ->
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                    Text(entry.title, fontWeight = FontWeight.Bold)
                    Text("${entry.type}${if (entry.severity > 0) " · ${entry.severity}/10" else ""}", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    if (entry.note.isNotBlank()) Text(entry.note)
                    androidx.compose.material3.TextButton(onClick = { HealthTimelineStore.remove(context, entry.id); version++ }) { Text("حذف") }
                }
            }
        }
    }
}
