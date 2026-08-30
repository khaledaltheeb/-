package org.healthrenewal.rawafid

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
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
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

private data class CareProfile(
    val id: Long,
    val name: String,
    val kind: String,
    val communication: String,
    val routine: String,
    val attention: String
)

private object CareModeStore {
    private const val PREFS = "rawafid_care_mode_v1"
    private fun prefs(context: android.content.Context) = context.getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)

    fun load(context: android.content.Context): List<CareProfile> {
        val raw = prefs(context).getString("profiles", "[]") ?: "[]"
        return runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    add(CareProfile(
                        id = o.optLong("id"),
                        name = o.optString("name"),
                        kind = o.optString("kind"),
                        communication = o.optString("communication"),
                        routine = o.optString("routine"),
                        attention = o.optString("attention")
                    ))
                }
            }
        }.getOrDefault(emptyList())
    }

    fun save(context: android.content.Context, values: List<CareProfile>) {
        val a = JSONArray()
        values.take(30).forEach { p ->
            a.put(JSONObject()
                .put("id", p.id)
                .put("name", p.name)
                .put("kind", p.kind)
                .put("communication", p.communication)
                .put("routine", p.routine)
                .put("attention", p.attention))
        }
        prefs(context).edit().putString("profiles", a.toString()).apply()
    }
}

class CareModeActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { CareModeScreen() }
                }
            }
        }
    }
}

@Composable
private fun CareModeScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var name by rememberSaveable { mutableStateOf("") }
    var kind by rememberSaveable { mutableStateOf("عام") }
    var communication by rememberSaveable { mutableStateOf("") }
    var routine by rememberSaveable { mutableStateOf("") }
    var attention by rememberSaveable { mutableStateOf("") }
    val profiles = remember(version) { CareModeStore.load(context) }

    LazyColumn(
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Care Mode · أنا أهتم بك", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("ملف رعاية محلي للطفل أو كبير السن أو شخص يحتاج متابعة. لا يشارك أو يرسل أي بيانات تلقائيًا.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    Text("إضافة ملف رعاية", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(name, { name = it.take(80) }, label = { Text("الاسم") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(kind, { kind = it.take(40) }, label = { Text("نوع الرعاية: طفل / كبير سن / مرافق / عام") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(communication, { communication = it.take(300) }, label = { Text("كيف أفضل أن أتواصل معه؟") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(routine, { routine = it.take(500) }, label = { Text("روتين مهم: دواء، ماء، طعام، نوم، مدرسة، موعد...") }, minLines = 3, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(attention, { attention = it.take(500) }, label = { Text("أشياء تحتاج الانتباه أو ماذا أفعل عند التغير") }, minLines = 3, modifier = Modifier.fillMaxWidth())
                    Button(onClick = {
                        if (name.isNotBlank()) {
                            val next = profiles + CareProfile(
                                id = System.currentTimeMillis(),
                                name = name.trim(),
                                kind = kind.trim().ifBlank { "عام" },
                                communication = communication.trim(),
                                routine = routine.trim(),
                                attention = attention.trim()
                            )
                            CareModeStore.save(context, next)
                            name = ""; communication = ""; routine = ""; attention = ""; version++
                        }
                    }) { Text("حفظ الملف") }
                }
            }
        }
        if (profiles.isEmpty()) item { Text("لا توجد ملفات رعاية بعد.") }
        profiles.forEach { profile ->
            item(key = profile.id) {
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(profile.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(profile.kind, color = MaterialTheme.colorScheme.primary)
                        if (profile.communication.isNotBlank()) Text("التواصل: ${profile.communication}")
                        if (profile.routine.isNotBlank()) Text("الروتين: ${profile.routine}")
                        if (profile.attention.isNotBlank()) Text("انتبه إلى: ${profile.attention}")
                        Button(onClick = {
                            CareModeStore.save(context, profiles.filterNot { it.id == profile.id })
                            version++
                        }) { Text("حذف") }
                    }
                }
            }
        }
    }
}
