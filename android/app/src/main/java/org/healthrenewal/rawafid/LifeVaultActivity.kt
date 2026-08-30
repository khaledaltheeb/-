package org.healthrenewal.rawafid

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
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
    val createdAt: Long,
    val attachmentName: String = "",
    val attachmentMime: String = "",
    val attachmentSize: Long = 0L
) {
    val hasAttachment: Boolean get() = attachmentName.isNotBlank()
}

object LifeVaultStore {
    private const val KEY = "life_vault_items"

    fun items(context: android.content.Context): List<LifeVaultItem> {
        val raw = EncryptedLocalStore.get(context, KEY) ?: return emptyList()
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val o = array.optJSONObject(i) ?: continue
                    add(
                        LifeVaultItem(
                            id = o.optLong("id"),
                            type = o.optString("type"),
                            title = o.optString("title"),
                            note = o.optString("note"),
                            createdAt = o.optLong("created_at"),
                            attachmentName = o.optString("attachment_name"),
                            attachmentMime = o.optString("attachment_mime"),
                            attachmentSize = o.optLong("attachment_size", 0L)
                        )
                    )
                }
            }.sortedByDescending { it.createdAt }
        }.getOrDefault(emptyList())
    }

    fun save(context: android.content.Context, values: List<LifeVaultItem>) {
        val array = JSONArray()
        values.take(500).forEach { item ->
            array.put(
                JSONObject()
                    .put("id", item.id)
                    .put("type", item.type)
                    .put("title", item.title)
                    .put("note", item.note)
                    .put("created_at", item.createdAt)
                    .put("attachment_name", item.attachmentName)
                    .put("attachment_mime", item.attachmentMime)
                    .put("attachment_size", item.attachmentSize)
            )
        }
        EncryptedLocalStore.put(context, KEY, array.toString())
    }

    fun clear(context: android.content.Context) {
        items(context).forEach { LifeVaultFileStore.delete(context, it.id) }
        EncryptedLocalStore.remove(context, KEY)
    }
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
    var pendingUri by remember { mutableStateOf<Uri?>(null) }
    var pendingAttachment by remember { mutableStateOf<LifeVaultAttachment?>(null) }
    var exportItem by remember { mutableStateOf<LifeVaultItem?>(null) }
    var statusMessage by remember { mutableStateOf("") }
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

    val pickAttachment = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            runCatching { LifeVaultFileStore.describe(context, uri) }
                .onSuccess { info ->
                    if (info.sizeBytes > LifeVaultFileStore.MAX_FILE_BYTES && info.sizeBytes > 0L) {
                        pendingUri = null
                        pendingAttachment = null
                        statusMessage = "الملف أكبر من الحد المسموح (${formatBytes(LifeVaultFileStore.MAX_FILE_BYTES)})."
                    } else {
                        pendingUri = uri
                        pendingAttachment = info
                        statusMessage = "تم اختيار ${info.name}. سيُشفّر عند الحفظ."
                    }
                }
                .onFailure {
                    pendingUri = null
                    pendingAttachment = null
                    statusMessage = "تعذر قراءة معلومات الملف المحدد."
                }
        }
    }

    val exportAttachment = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("*/*")) { destination ->
        val selected = exportItem
        if (destination != null && selected != null) {
            runCatching { LifeVaultFileStore.exportDecrypted(context, selected.id, destination) }
                .onSuccess { statusMessage = "تم تصدير نسخة من ${selected.attachmentName} إلى المكان الذي اخترته." }
                .onFailure { statusMessage = "تعذر تصدير الملف. بقيت النسخة المشفرة داخل روافد دون تغيير." }
        }
        exportItem = null
    }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("خزانة الحياة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("ملاحظاتك وملفاتك تُحفظ محليًا. المرفقات تُشفّر بـ AES-GCM ومفتاح Android Keystore داخل مساحة روافد الخاصة، ولا تُرسل إلى خادم.")
                Text(
                    "تصدير ملف يفك تشفير نسخة إلى المكان الذي تختاره أنت فقط.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        if (statusMessage.isNotBlank()) {
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Text(statusMessage, Modifier.padding(14.dp))
                }
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

                    OutlinedButton(
                        onClick = { pickAttachment.launch(arrayOf("*/*")) },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(if (pendingAttachment == null) "إضافة ملف مشفر — اختياري" else "تغيير الملف المحدد")
                    }

                    pendingAttachment?.let { attachment ->
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(attachment.name, fontWeight = FontWeight.Bold)
                                Text(
                                    listOfNotNull(
                                        attachment.mimeType.takeIf { it.isNotBlank() },
                                        attachment.sizeBytes.takeIf { it > 0L }?.let(::formatBytes)
                                    ).joinToString(" · "),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                TextButton(onClick = { pendingUri = null; pendingAttachment = null }) { Text("إزالة المرفق") }
                            }
                        }
                    }

                    Button(
                        onClick = {
                            if (title.isBlank()) {
                                statusMessage = "اكتب عنوانًا قبل الحفظ."
                            } else {
                                val id = System.currentTimeMillis()
                                val source = pendingUri
                                var fileImported = false
                                runCatching {
                                    val attachment = source?.let {
                                        LifeVaultFileStore.importEncrypted(context, it, id).also { fileImported = true }
                                    }
                                    val entry = LifeVaultItem(
                                        id = id,
                                        type = type,
                                        title = title.trim(),
                                        note = note.trim(),
                                        createdAt = id,
                                        attachmentName = attachment?.name.orEmpty(),
                                        attachmentMime = attachment?.mimeType.orEmpty(),
                                        attachmentSize = attachment?.sizeBytes ?: 0L
                                    )
                                    LifeVaultStore.save(context, listOf(entry) + items)
                                    entry
                                }.onSuccess { entry ->
                                    title = ""
                                    note = ""
                                    pendingUri = null
                                    pendingAttachment = null
                                    statusMessage = if (entry.hasAttachment) "تم حفظ السجل والملف مشفرين على هذا الهاتف." else "تم حفظ السجل مشفرًا على هذا الهاتف."
                                    version++
                                }.onFailure {
                                    if (fileImported || LifeVaultFileStore.exists(context, id)) LifeVaultFileStore.delete(context, id)
                                    statusMessage = "تعذر حفظ هذا السجل بأمان. لم تُحتفظ بنسخة جزئية من المرفق."
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("حفظ مشفر على هذا الهاتف") }
                }
            }
        }
        if (items.isEmpty()) item { Text("الخزانة فارغة.") }
        items(items, key = { it.id }) { item ->
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text(item.title, fontWeight = FontWeight.Bold)
                    Text(item.type, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    if (item.note.isNotBlank()) Text(item.note)
                    if (item.hasAttachment) {
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("مرفق مشفر", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                                Text(item.attachmentName)
                                Text(
                                    listOfNotNull(
                                        item.attachmentMime.takeIf { it.isNotBlank() },
                                        item.attachmentSize.takeIf { it > 0L }?.let(::formatBytes)
                                    ).joinToString(" · "),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                if (LifeVaultFileStore.exists(context, item.id)) {
                                    OutlinedButton(
                                        onClick = {
                                            exportItem = item
                                            exportAttachment.launch(item.attachmentName.ifBlank { "rawafid-file" })
                                        }
                                    ) { Text("تصدير نسخة") }
                                } else {
                                    Text("المرفق غير موجود على هذا الجهاز.", color = MaterialTheme.colorScheme.error)
                                }
                            }
                        }
                    }
                    TextButton(
                        onClick = {
                            runCatching {
                                LifeVaultStore.save(context, items.filterNot { it.id == item.id })
                                LifeVaultFileStore.delete(context, item.id)
                            }.onSuccess {
                                statusMessage = "تم حذف السجل ومرفقه المحلي."
                                version++
                            }.onFailure {
                                statusMessage = "تعذر إكمال الحذف."
                            }
                        }
                    ) { Text("حذف") }
                }
            }
        }
    }
}

private fun formatBytes(bytes: Long): String = when {
    bytes <= 0L -> "حجم غير معروف"
    bytes < 1024L -> "$bytes بايت"
    bytes < 1024L * 1024L -> "${(bytes + 1023L) / 1024L} كيلوبايت"
    else -> {
        val unit = 1024L * 1024L
        val tenths = (bytes * 10L + unit / 2L) / unit
        "${tenths / 10L}.${tenths % 10L} م.ب."
    }
}
