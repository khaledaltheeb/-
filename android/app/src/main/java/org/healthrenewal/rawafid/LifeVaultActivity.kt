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

data class LifeVaultItem(
    val id: Long,
    val type: String,
    val title: String,
    val note: String,
    val createdAt: Long
)

object LifeVaultStore {
    private const val KEY = "life_vault_items"

    fun items(context: android.content.Context): List<LifeVaultItem> {
        val raw = EncryptedLocalStore.get(context, KEY) ?: return emptyList()
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val o = array.optJSONObject(i) ?: continue
                    add(LifeVaultItem(o.optLong("id"), o.optString("type"), o.optString("title"), o.optString("note"), o.optLong("created_at")))
                }
            }.sortedByDescending { it.createdAt }
        }.getOrDefault(emptyList())
    }

    fun save(context: android.content.Context, values: List<LifeVaultItem>) {
        val array = JSONArray()
        values.take(500).forEach { item ->
            array.put(JSONObject().put("id", item.id).put("type", item.type).put("title", item.title).put("note", item.note).put("created_at", item.createdAt))
        }
        EncryptedLocalStore.put(context, KEY, array.toString())
    }

    fun clear(context: android.content.Context) = EncryptedLocalStore.remove(context, KEY)
}

class LifeVaultActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { LifeVaultScreen() }
                }
            }
        }
    }
}

@Composable
private fun LifeVaultScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var type by rememberSaveable { mutableStateOf("report") }
    var title by rememberSaveable { mutableStateOf("") }
    var note by rememberSaveable { mutableStateOf("") }
    val items = remember(version) { LifeVaultStore.items(context) }
    val types = listOf(
        "report" to "تقرير",
        "lab" to "تحليل",
        "prescription" to "وصفة",
        "allergy" to "حساسية",
        "insurance" to "تأمين",
        "travel" to "سفر",
        "other" to "آخر"
    )

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("خزانة الحياة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("هذه النسخة تحفظ الملاحظات والبيانات الوصفية مشفرة محليًا باستخدام مفتاح Android Keystore. رفع الملفات نفسها سيُضاف فوق نفس طبقة التشفير لاحقًا.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("إضافة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    types.chunked(4).forEach { row ->
                        androidx.compose.foundation.layout.Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            row.forEach { (id, label) -> FilterChip(selected = type == id, onClick = { type = id }, label = { Text(label) }) }
                        }
                    }
                    OutlinedTextField(title, { title = it.take(120) }, label = { Text("العنوان") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(note, { note = it.take(1600) }, label = { Text("ملاحظة أو معلومات مهمة") }, minLines = 4, modifier = Modifier.fillMaxWidth())
                    Button(onClick = {
                        if (title.isNotBlank()) {
                            val id = System.currentTimeMillis()
                            LifeVaultStore.save(context, listOf(LifeVaultItem(id, type, title.trim(), note.trim(), id)) + items)
                            title = ""; note = ""; version++
                        }
                    }) { Text("حفظ مشفر على هذا الهاتف") }
                }
            }
        }
        if (items.isEmpty()) item { Text("الخزانة فارغة.") }
        items(items, key = { it.id }) { item ->
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                    Text(item.title, fontWeight = FontWeight.Bold)
                    Text(item.type, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    if (item.note.isNotBlank()) Text(item.note)
                    TextButton(onClick = { LifeVaultStore.save(context, items.filterNot { it.id == item.id }); version++ }) { Text("حذف") }
                }
            }
        }
    }
}
