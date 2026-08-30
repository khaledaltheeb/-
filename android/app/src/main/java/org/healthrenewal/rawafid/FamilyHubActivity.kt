package org.healthrenewal.rawafid

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

data class FamilyMember(
    val id: Long,
    val name: String,
    val role: String,
    val note: String
)

data class CareTask(
    val id: Long,
    val memberId: Long,
    val title: String,
    val note: String,
    val done: Boolean
)

object FamilyHubStore {
    private const val PREFS = "rawafid_family_hub_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun members(context: Context): List<FamilyMember> {
        val raw = prefs(context).getString("members", "[]") ?: "[]"
        return runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    add(FamilyMember(o.optLong("id"), o.optString("name"), o.optString("role"), o.optString("note")))
                }
            }
        }.getOrDefault(emptyList())
    }

    fun saveMembers(context: Context, values: List<FamilyMember>) {
        val a = JSONArray()
        values.take(20).forEach { m -> a.put(JSONObject().put("id", m.id).put("name", m.name).put("role", m.role).put("note", m.note)) }
        prefs(context).edit().putString("members", a.toString()).apply()
    }

    fun tasks(context: Context): List<CareTask> {
        val raw = prefs(context).getString("tasks", "[]") ?: "[]"
        return runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    add(CareTask(o.optLong("id"), o.optLong("member_id"), o.optString("title"), o.optString("note"), o.optBoolean("done")))
                }
            }.sortedWith(compareBy<CareTask> { it.done }.thenByDescending { it.id })
        }.getOrDefault(emptyList())
    }

    fun saveTasks(context: Context, values: List<CareTask>) {
        val a = JSONArray()
        values.take(200).forEach { t ->
            a.put(JSONObject().put("id", t.id).put("member_id", t.memberId).put("title", t.title).put("note", t.note).put("done", t.done))
        }
        prefs(context).edit().putString("tasks", a.toString()).apply()
    }
}

class FamilyHubActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { FamilyHubScreen() }
                }
            }
        }
    }
}

@Composable
private fun FamilyHubScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var name by rememberSaveable { mutableStateOf("") }
    var role by rememberSaveable { mutableStateOf("طفل") }
    var memberNote by rememberSaveable { mutableStateOf("") }
    var taskTitle by rememberSaveable { mutableStateOf("") }
    var taskNote by rememberSaveable { mutableStateOf("") }
    val members = remember(version) { FamilyHubStore.members(context) }
    val tasks = remember(version) { FamilyHubStore.tasks(context) }
    var selectedMember by remember(version) { mutableStateOf(members.firstOrNull()?.id ?: 0L) }
    val roles = listOf("طفل", "والد/والدة", "زوج/زوجة", "كبير سن", "شخص أرعاه", "آخر")

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("مركز الأسرة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("ملفات رعاية محلية على هذا الهاتف. لا تتم مشاركة بيانات أي فرد تلقائيًا.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("إضافة شخص", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(name, { name = it.take(80) }, label = { Text("الاسم") }, modifier = Modifier.fillMaxWidth())
                    roles.chunked(3).forEach { row ->
                        androidx.compose.foundation.layout.Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            row.forEach { value -> FilterChip(selected = role == value, onClick = { role = value }, label = { Text(value) }) }
                        }
                    }
                    OutlinedTextField(memberNote, { memberNote = it.take(500) }, label = { Text("ملاحظة رعاية اختيارية") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    Button(onClick = {
                        if (name.isNotBlank()) {
                            val id = System.currentTimeMillis()
                            FamilyHubStore.saveMembers(context, members + FamilyMember(id, name.trim(), role, memberNote.trim()))
                            name = ""; memberNote = ""; version++
                        }
                    }) { Text("إضافة") }
                }
            }
        }
        if (members.isNotEmpty()) {
            item {
                Text("من أرعاهم", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            }
            items(members, key = { it.id }) { member ->
                Card(onClick = { selectedMember = member.id }) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                        Text(member.name, fontWeight = FontWeight.Bold)
                        Text(member.role, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        if (member.note.isNotBlank()) Text(member.note)
                        if (selectedMember == member.id) Text("محدد لإضافة مهمة", color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("مهمة رعاية", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(if (selectedMember == 0L) "أضف شخصًا أولًا." else "سترتبط المهمة بالشخص المحدد أعلاه.")
                    OutlinedTextField(taskTitle, { taskTitle = it.take(120) }, label = { Text("المهمة — موعد، دواء، متابعة، مدرسة...") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(taskNote, { taskNote = it.take(500) }, label = { Text("تفاصيل") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    Button(enabled = selectedMember != 0L && taskTitle.isNotBlank(), onClick = {
                        val id = System.currentTimeMillis()
                        FamilyHubStore.saveTasks(context, listOf(CareTask(id, selectedMember, taskTitle.trim(), taskNote.trim(), false)) + tasks)
                        taskTitle = ""; taskNote = ""; version++
                    }) { Text("إضافة مهمة") }
                }
            }
        }
        if (tasks.isNotEmpty()) {
            item { Text("لوحة الرعاية", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
            items(tasks, key = { it.id }) { task ->
                val member = members.firstOrNull { it.id == task.memberId }
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                        Text(task.title, fontWeight = FontWeight.Bold)
                        Text(member?.name ?: "شخص غير موجود", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        if (task.note.isNotBlank()) Text(task.note)
                        TextButton(onClick = {
                            FamilyHubStore.saveTasks(context, tasks.map { if (it.id == task.id) it.copy(done = !it.done) else it })
                            version++
                        }) { Text(if (task.done) "إعادة فتح" else "تم") }
                    }
                }
            }
        }
    }
}
