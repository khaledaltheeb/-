package org.healthrenewal.rawafid

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
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
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
import java.time.LocalDate

data class RoutineDefinition(val id: Long, val name: String, val category: String, val steps: List<String>)

object RoutineStore {
    private const val PREFS = "rawafid_routines_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun routines(context: Context): List<RoutineDefinition> {
        val raw = prefs(context).getString("routines", "[]") ?: "[]"
        val saved = runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    val s = o.optJSONArray("steps") ?: JSONArray()
                    add(RoutineDefinition(o.optLong("id"), o.optString("name"), o.optString("category"), buildList { for (j in 0 until s.length()) add(s.optString(j)) }))
                }
            }
        }.getOrDefault(emptyList())
        return if (saved.isNotEmpty()) saved else defaults()
    }

    fun save(context: Context, routines: List<RoutineDefinition>) {
        val a = JSONArray()
        routines.take(50).forEach { r ->
            val s = JSONArray(); r.steps.take(30).forEach(s::put)
            a.put(JSONObject().put("id", r.id).put("name", r.name).put("category", r.category).put("steps", s))
        }
        prefs(context).edit().putString("routines", a.toString()).apply()
    }

    fun completed(context: Context, routineId: Long): Set<Int> {
        val today = LocalDate.now().toString()
        val key = "done_${routineId}_$today"
        return prefs(context).getStringSet(key, emptySet())?.mapNotNull { it.toIntOrNull() }?.toSet() ?: emptySet()
    }

    fun setCompleted(context: Context, routineId: Long, values: Set<Int>) {
        val today = LocalDate.now().toString()
        prefs(context).edit().putStringSet("done_${routineId}_$today", values.map(Int::toString).toSet()).apply()
    }

    private fun defaults() = listOf(
        RoutineDefinition(1, "صباح هادئ", "صباح", listOf("ماء", "افتح الستارة أو الضوء", "دواؤك إن كان في هذا الوقت حسب خطتك", "حدد أهم شيء واحد لليوم")),
        RoutineDefinition(2, "قبل النوم", "نوم", listOf("راجع ما يحتاج للغد", "خفف الإضاءة", "جهّز ماءك واحتياجاتك", "ضع الهاتف جانبًا عندما تكون مستعدًا")),
        RoutineDefinition(3, "بداية الدراسة", "دراسة", listOf("حدد المهمة", "أزل مشتتًا واحدًا", "ابدأ جلسة تركيز قصيرة", "خذ فاصل عين وحركة")),
        RoutineDefinition(4, "رعاية شخص", "رعاية", listOf("راجع الموعد أو المهمة القادمة", "تأكد من ما يلزم حمله", "سجل ملاحظة مهمة", "اترك مساحة لراحة مقدم الرعاية"))
    )
}

class RoutinesActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { RawafidTheme { CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) { Surface(Modifier.fillMaxSize()) { RoutinesScreen() } } } }
    }
}

@Composable
private fun RoutinesScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var name by rememberSaveable { mutableStateOf("") }
    var category by rememberSaveable { mutableStateOf("شخصي") }
    var stepsText by rememberSaveable { mutableStateOf("") }
    val routines = remember(version) { RoutineStore.routines(context) }
    val categories = listOf("شخصي", "صباح", "نوم", "دراسة", "عمل", "دواء", "طفل", "كبير سن", "سفر")

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("روتيناتي", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("قوالب قابلة للتعديل؛ لا توجد قائمة واحدة تناسب الجميع.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    Text("روتين جديد", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(name, { name = it.take(80) }, label = { Text("اسم الروتين") }, modifier = Modifier.fillMaxWidth())
                    categories.chunked(3).forEach { row -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { row.forEach { c -> FilterChip(selected = category == c, onClick = { category = c }, label = { Text(c) }) } } }
                    OutlinedTextField(stepsText, { stepsText = it.take(1200) }, label = { Text("الخطوات — كل خطوة في سطر") }, minLines = 4, modifier = Modifier.fillMaxWidth())
                    Button(onClick = {
                        val steps = stepsText.lines().map(String::trim).filter(String::isNotBlank).take(30)
                        if (name.isNotBlank() && steps.isNotEmpty()) {
                            RoutineStore.save(context, routines + RoutineDefinition(System.currentTimeMillis(), name.trim(), category, steps))
                            name = ""; stepsText = ""; version++
                        }
                    }) { Text("إضافة الروتين") }
                }
            }
        }
        items(routines, key = { it.id }) { routine ->
            val done = remember(version, routine.id) { RoutineStore.completed(context, routine.id) }
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text(routine.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(routine.category, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    routine.steps.forEachIndexed { index, step ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(step, Modifier.weight(1f))
                            Checkbox(checked = index in done, onCheckedChange = { yes ->
                                val next = if (yes) done + index else done - index
                                RoutineStore.setCompleted(context, routine.id, next); version++
                            })
                        }
                    }
                    TextButton(onClick = { RoutineStore.save(context, routines.filterNot { it.id == routine.id }); version++ }) { Text("حذف الروتين") }
                }
            }
        }
    }
}
