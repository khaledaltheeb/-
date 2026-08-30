package org.healthrenewal.rawafid

import android.content.Context
import android.content.Intent
import android.net.Uri
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
import org.json.JSONArray
import org.json.JSONObject

enum class CirclePermission(val id: String, val label: String) {
    EMERGENCY("emergency", "جهة موثوقة للطوارئ"),
    SAFE_ARRIVAL("safe_arrival", "وصلت بالسلامة / Check-in"),
    LOCATION_SAFETY("location_safety", "استلام موقع مراقبة الأمان"),
    CARE("care", "مهام الرعاية"),
    HEALTH_SUMMARY("health_summary", "ملخص صحي أختار مشاركته"),
    SUPPORT("support", "أحتاجك / دعم وتواصل")
}

data class CirclePerson(
    val id: Long,
    val name: String,
    val relation: String,
    val phone: String,
    val permissions: Set<CirclePermission>
)

object MyCircleStore {
    private const val PREFS = "rawafid_my_circle_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun people(context: Context): List<CirclePerson> {
        val raw = prefs(context).getString("people", "[]") ?: "[]"
        return runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    val ids = buildSet {
                        val p = o.optJSONArray("permissions") ?: JSONArray()
                        for (j in 0 until p.length()) add(p.optString(j))
                    }
                    add(
                        CirclePerson(
                            id = o.optLong("id"),
                            name = o.optString("name"),
                            relation = o.optString("relation"),
                            phone = o.optString("phone"),
                            permissions = CirclePermission.entries.filterTo(mutableSetOf()) { it.id in ids }
                        )
                    )
                }
            }.take(20)
        }.getOrDefault(emptyList())
    }

    fun save(context: Context, people: List<CirclePerson>) {
        val a = JSONArray()
        people.take(20).forEach { person ->
            val permissions = JSONArray(); person.permissions.forEach { permissions.put(it.id) }
            a.put(JSONObject().put("id", person.id).put("name", person.name).put("relation", person.relation).put("phone", person.phone).put("permissions", permissions))
        }
        prefs(context).edit().putString("people", a.toString()).apply()
    }

    fun forPermission(context: Context, permission: CirclePermission): List<CirclePerson> = people(context).filter { permission in it.permissions }
}

class MyCircleActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { MyCircleScreen() }
                }
            }
        }
    }
}

@Composable
private fun MyCircleScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var name by rememberSaveable { mutableStateOf("") }
    var relation by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var permissions by remember { mutableStateOf(setOf(CirclePermission.SUPPORT)) }
    val people = remember(version) { MyCircleStore.people(context) }

    LazyColumn(contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("دائرتي", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("حدد لكل شخص ما الذي تسمح لروافد باستخدامه معه. إذن «استلام موقع مراقبة الأمان» منفصل عن الاتصال والطوارئ وبقية الصلاحيات.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("إضافة شخص موثوق", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(name, { name = it.take(80) }, label = { Text("الاسم") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(relation, { relation = it.take(80) }, label = { Text("العلاقة — أب، أم، شريك، صديق، مقدم رعاية...") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(phone, { phone = it.take(40) }, label = { Text("الهاتف — اختياري") }, modifier = Modifier.fillMaxWidth())
                    CirclePermission.entries.forEach { permission ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(permission.label, Modifier.weight(1f))
                            Checkbox(
                                checked = permission in permissions,
                                onCheckedChange = { yes -> permissions = if (yes) permissions + permission else permissions - permission }
                            )
                        }
                    }
                    Button(onClick = {
                        if (name.isNotBlank()) {
                            val person = CirclePerson(System.currentTimeMillis(), name.trim(), relation.trim(), phone.trim(), permissions)
                            MyCircleStore.save(context, people + person)
                            name = ""; relation = ""; phone = ""; permissions = setOf(CirclePermission.SUPPORT); version++
                        }
                    }) { Text("إضافة إلى دائرتي") }
                }
            }
        }
        if (people.isEmpty()) item { Text("لم تضف أشخاصًا بعد.") }
        items(people, key = { it.id }) { person ->
            Card {
                Column(Modifier.padding(RawafidSpacing.Md), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                    Text(person.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    if (person.relation.isNotBlank()) Text(person.relation)
                    person.permissions.forEach { Text("• ${it.label}", style = MaterialTheme.typography.bodySmall) }
                    if (person.phone.isNotBlank()) {
                        Row(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                            OutlinedButton(onClick = { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${Uri.encode(person.phone)}"))) }) { Text("اتصال") }
                            OutlinedButton(onClick = { context.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:${Uri.encode(person.phone)}")).putExtra("sms_body", "أحتاج أن أتواصل معك عبر روافد.")) }) { Text("رسالة") }
                        }
                    }
                    OutlinedButton(onClick = {
                        val invite = buildString {
                            append("أنا أهتم بك — روافد\n")
                            append("أضفتك كشخص أثق به في دائرتي. الصلاحيات التي اخترتها لك:\n")
                            person.permissions.forEach { append("• ${it.label}\n") }
                            append("هذه دعوة للمراجعة والقبول، وليست مشاركة تلقائية لبياناتي الصحية.")
                        }
                        context.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, invite) }, "مشاركة دعوة دائرتي"))
                    }) { Text("أنا أهتم بك — مشاركة الدعوة") }
                    TextButton(onClick = { MyCircleStore.save(context, people.filterNot { it.id == person.id }); version++ }) { Text("إزالة") }
                }
            }
        }
    }
}
