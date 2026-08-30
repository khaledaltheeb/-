package org.healthrenewal.rawafid

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

enum class CirclePermission(val id: String, val label: String) {
    EMERGENCY("emergency", "جهة موثوقة للطوارئ"),
    SAFE_ARRIVAL("safe_arrival", "وصلت بالسلامة / Check-in"),
    LOCATION_SAFETY("location_safety", "استلام موقع مراقبة الأمان عبر SMS"),
    DRIVING_SAFETY("driving_safety", "قيادة آمنة — تنبيه وموقع عند طلب المساعدة"),
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
                            o.optLong("id"),
                            o.optString("name"),
                            o.optString("relation"),
                            o.optString("phone"),
                            CirclePermission.entries.filterTo(mutableSetOf()) { it.id in ids }
                        )
                    )
                }
            }.take(20)
        }.getOrDefault(emptyList())
    }

    fun save(context: Context, people: List<CirclePerson>) {
        val a = JSONArray()
        people.take(20).forEach { person ->
            val permissions = JSONArray()
            person.permissions.forEach { permissions.put(it.id) }
            a.put(
                JSONObject()
                    .put("id", person.id)
                    .put("name", person.name)
                    .put("relation", person.relation)
                    .put("phone", person.phone)
                    .put("permissions", permissions)
            )
        }
        prefs(context).edit().putString("people", a.toString()).apply()
    }

    fun forPermission(context: Context, permission: CirclePermission): List<CirclePerson> =
        people(context).filter { permission in it.permissions }
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
    val scope = rememberCoroutineScope()
    var refresh by remember { mutableIntStateOf(0) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("") }
    var identity by remember { mutableStateOf("") }
    var pending by remember { mutableStateOf<List<CirclePendingRequest>>(emptyList()) }
    var connections by remember { mutableStateOf<List<CircleConnection>>(emptyList()) }
    var targetId by rememberSaveable { mutableStateOf("") }
    var targetLabel by rememberSaveable { mutableStateOf("") }
    val pendingLabels = remember { mutableStateMapOf<String, String>() }
    var permissionsTarget by remember { mutableStateOf<CircleConnection?>(null) }
    var permissionSnapshot by remember { mutableStateOf<List<CirclePermissionSnapshot>>(emptyList()) }
    var removeTarget by remember { mutableStateOf<CircleConnection?>(null) }
    val signedIn = RawafidCircleApi.hasSession(context)

    var localVersion by remember { mutableIntStateOf(0) }
    var showLocal by rememberSaveable { mutableStateOf(false) }
    var localName by rememberSaveable { mutableStateOf("") }
    var localRelation by rememberSaveable { mutableStateOf("") }
    var localPhone by rememberSaveable { mutableStateOf("") }
    var localPermissions by remember {
        mutableStateOf(setOf(CirclePermission.EMERGENCY, CirclePermission.LOCATION_SAFETY))
    }
    val localPeople = remember(localVersion) { MyCircleStore.people(context) }

    fun runTask(success: String = "", operation: () -> Unit, afterSuccess: () -> Unit = {}) {
        if (loading) return
        scope.launch {
            loading = true
            error = ""
            status = ""
            val result = withContext(Dispatchers.IO) { runCatching { operation() } }
            result.onSuccess {
                afterSuccess()
                if (success.isNotBlank()) status = success
            }.onFailure {
                error = it.message ?: "تعذر إكمال العملية."
            }
            loading = false
        }
    }

    LaunchedEffect(refresh, signedIn) {
        if (!signedIn) {
            identity = ""
            pending = emptyList()
            connections = emptyList()
            return@LaunchedEffect
        }
        loading = true
        error = ""
        val result = withContext(Dispatchers.IO) {
            runCatching {
                Triple(
                    RawafidCircleApi.myIdentity(context),
                    RawafidCircleApi.pendingRequests(context),
                    RawafidCircleApi.connections(context)
                )
            }
        }
        result.onSuccess {
            identity = it.first
            pending = it.second
            connections = it.third
        }.onFailure { error = it.message ?: "تعذر تحميل دائرتك." }
        loading = false
    }

    LaunchedEffect(permissionsTarget?.connectionId, refresh) {
        val target = permissionsTarget ?: return@LaunchedEffect
        val result = withContext(Dispatchers.IO) {
            runCatching { RawafidCircleApi.permissionSnapshot(context, target.connectionId) }
        }
        result.onSuccess { permissionSnapshot = it }
            .onFailure { error = it.message ?: "تعذر تحميل الصلاحيات." }
    }

    LazyColumn(
        contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("دائرتي — Rawafid Circle", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("تواصل خاص للرعاية والأمان. معرفة المعرّف وحدها لا تمنح أي وصول، ولا يبدأ التواصل قبل موافقة الطرفين.")
            }
        }

        if (!signedIn) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("اربط دائرتك بين الأجهزة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("سجّل الدخول أو أنشئ حسابًا للحصول على معرّف روافد ثابت وإضافة أفراد الأسرة أو مقدمي الرعاية بموافقتهم.")
                        Button(onClick = { context.startActivity(Intent(context, CircleAccountActivity::class.java)) }) { Text("حساب روافد") }
                        OutlinedButton(onClick = { refresh++ }) { Text("تحديث بعد تسجيل الدخول") }
                    }
                }
            }
        } else {
            item {
                Card {
                    Column(
                        Modifier.fillMaxWidth().padding(RawafidSpacing.CardContent),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
                    ) {
                        Text("معرّف روافد الخاص بي", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text(if (identity.isBlank()) "جارٍ إنشاء المعرّف..." else identity, style = MaterialTheme.typography.titleMedium)
                        if (identity.isNotBlank()) {
                            val qr = remember(identity) { rawafidQr(identity) }
                            Image(qr.asImageBitmap(), contentDescription = "QR لمعرّف روافد", modifier = Modifier.size(190.dp))
                            FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                                OutlinedButton(onClick = {
                                    (context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager)
                                        .setPrimaryClip(ClipData.newPlainText("Rawafid ID", identity))
                                    status = "تم نسخ المعرّف."
                                }) { Text("نسخ") }
                                OutlinedButton(onClick = {
                                    context.startActivity(
                                        Intent.createChooser(
                                            Intent(Intent.ACTION_SEND).apply {
                                                type = "text/plain"
                                                putExtra(Intent.EXTRA_TEXT, "أضفني إلى دائرتك في روافد: $identity")
                                            },
                                            "مشاركة المعرّف"
                                        )
                                    )
                                }) { Text("مشاركة") }
                                OutlinedButton(enabled = !loading, onClick = { refresh++ }) { Text("تحديث") }
                            }
                        }
                    }
                }
            }

            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("إضافة شخص", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        OutlinedTextField(
                            targetId,
                            { targetId = CircleRules.normalizeRawafidId(it).take(24) },
                            label = { Text("معرّف روافد — RFD-....") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        OutlinedTextField(
                            targetLabel,
                            { targetLabel = it.take(80) },
                            label = { Text("من هو بالنسبة لي؟ مثال: ابني، أبي، مقدم الرعاية") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                            Button(
                                enabled = !loading && CircleRules.isValidRawafidId(targetId) && targetLabel.isNotBlank(),
                                onClick = {
                                    val id = targetId
                                    val label = targetLabel
                                    runTask(
                                        success = "تم إرسال طلب الارتباط.",
                                        operation = { RawafidCircleApi.sendConnectionRequest(context, id, label) },
                                        afterSuccess = {
                                            targetId = ""
                                            targetLabel = ""
                                            refresh++
                                        }
                                    )
                                }
                            ) { Text("إرسال الطلب") }
                            OutlinedButton(onClick = {
                                val clip = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                targetId = CircleRules.normalizeRawafidId(
                                    clip.primaryClip?.getItemAt(0)?.coerceToText(context)?.toString().orEmpty()
                                ).take(24)
                            }) { Text("لصق المعرّف") }
                        }
                        Text("لن يبدأ التواصل قبل قبول الطرف الآخر واختياره الاسم الذي يسجلك به.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            if (pending.isNotEmpty()) {
                item { Text("طلبات واردة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
                items(pending, key = { it.requestId }) { request ->
                    Card {
                        Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                            Text(request.requesterName, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text(request.requesterRawafidId)
                            OutlinedTextField(
                                pendingLabels[request.requestId].orEmpty(),
                                { pendingLabels[request.requestId] = it.take(80) },
                                label = { Text("كيف تريد تسجيله عندك؟") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                                Button(
                                    enabled = !loading && pendingLabels[request.requestId].orEmpty().isNotBlank(),
                                    onClick = {
                                        val label = pendingLabels[request.requestId].orEmpty()
                                        runTask(
                                            success = "تم قبول الارتباط.",
                                            operation = { RawafidCircleApi.respondToRequest(context, request.requestId, true, label) },
                                            afterSuccess = {
                                                pendingLabels.remove(request.requestId)
                                                refresh++
                                            }
                                        )
                                    }
                                ) { Text("قبول") }
                                OutlinedButton(
                                    enabled = !loading,
                                    onClick = {
                                        runTask(
                                            success = "تم رفض الطلب.",
                                            operation = { RawafidCircleApi.respondToRequest(context, request.requestId, false, "") },
                                            afterSuccess = {
                                                pendingLabels.remove(request.requestId)
                                                refresh++
                                            }
                                        )
                                    }
                                ) { Text("رفض") }
                            }
                        }
                    }
                }
            }

            permissionsTarget?.let { person ->
                item {
                    CirclePermissionsCard(
                        connection = person,
                        snapshot = permissionSnapshot,
                        busy = loading,
                        onToggle = { permission, enabled ->
                            runTask(
                                operation = { RawafidCircleApi.setPermission(context, person.connectionId, permission, enabled) },
                                afterSuccess = { refresh++ }
                            )
                        },
                        onClose = {
                            permissionsTarget = null
                            permissionSnapshot = emptyList()
                        }
                    )
                }
            }

            item { Text("أشخاصي", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
            if (connections.isEmpty()) item { Text(if (loading) "جارٍ التحميل..." else "لا توجد ارتباطات مقبولة بعد.") }
            items(connections, key = { it.connectionId }) { connection ->
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text(connection.counterpartName, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        if (connection.myLabel.isNotBlank()) Text(connection.myLabel)
                        Text(connection.counterpartRawafidId, style = MaterialTheme.typography.bodySmall)
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                            Button(onClick = {
                                context.startActivity(
                                    Intent(context, CircleConversationActivity::class.java).apply {
                                        putExtra("connection_id", connection.connectionId)
                                        putExtra("counterpart_name", connection.counterpartName)
                                        putExtra("my_label", connection.myLabel)
                                        putExtra("can_message", connection.canMessage)
                                        putExtra("can_quick_question", connection.canQuickQuestion)
                                        putExtra("can_request_location", connection.canRequestLocation)
                                    }
                                )
                            }) { Text("المحادثة") }
                            OutlinedButton(onClick = {
                                permissionSnapshot = emptyList()
                                permissionsTarget = connection
                            }) { Text("الصلاحيات") }
                            TextButton(onClick = { removeTarget = connection }) { Text("إزالة") }
                        }
                    }
                }
            }
            item { OutlinedButton(onClick = { context.startActivity(Intent(context, CircleAccountActivity::class.java)) }) { Text("إدارة الحساب") } }
        }

        if (status.isNotBlank()) item { Text(status, color = MaterialTheme.colorScheme.primary) }
        if (error.isNotBlank()) item { Text(error, color = MaterialTheme.colorScheme.error) }
        item { HorizontalDivider() }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("جهات الأمان المحلية على هذا الهاتف", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("مسار مستقل يعمل للاتصال وSMS ومراقبة الأمان والقيادة الآمنة عند تعذر الإنترنت. أنت تختار لكل رقم الوظائف المسموح بها، ولا يُرفع دفتر الأرقام إلى دائرة روافد.")
                    OutlinedButton(onClick = { showLocal = !showLocal }) { Text(if (showLocal) "إخفاء" else "إدارة جهات الأمان المحلية") }
                }
            }
        }

        if (showLocal) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        OutlinedTextField(localName, { localName = it.take(80) }, label = { Text("الاسم") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(localRelation, { localRelation = it.take(80) }, label = { Text("العلاقة") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(localPhone, { localPhone = it.take(40) }, label = { Text("رقم الهاتف") }, modifier = Modifier.fillMaxWidth())
                        CirclePermission.entries.forEach { permission ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Text(permission.label, Modifier.weight(1f))
                                Checkbox(
                                    checked = permission in localPermissions,
                                    onCheckedChange = { yes ->
                                        localPermissions = if (yes) localPermissions + permission else localPermissions - permission
                                    }
                                )
                            }
                        }
                        Button(
                            enabled = localName.isNotBlank() && localPhone.isNotBlank(),
                            onClick = {
                                MyCircleStore.save(
                                    context,
                                    localPeople + CirclePerson(
                                        System.currentTimeMillis(),
                                        localName.trim(),
                                        localRelation.trim(),
                                        localPhone.trim(),
                                        localPermissions
                                    )
                                )
                                localName = ""
                                localRelation = ""
                                localPhone = ""
                                localPermissions = setOf(CirclePermission.EMERGENCY, CirclePermission.LOCATION_SAFETY)
                                localVersion++
                            }
                        ) { Text("حفظ الجهة") }
                    }
                }
            }

            items(localPeople, key = { it.id }) { person ->
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text(person.name, fontWeight = FontWeight.Bold)
                        if (person.relation.isNotBlank()) Text(person.relation)
                        Text(person.phone)
                        if (person.permissions.isNotEmpty()) {
                            Text(person.permissions.joinToString(" · ") { it.label }, style = MaterialTheme.typography.bodySmall)
                        }
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                            Button(onClick = { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${Uri.encode(person.phone)}"))) }) { Text("اتصال") }
                            OutlinedButton(onClick = { context.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:${Uri.encode(person.phone)}"))) }) { Text("SMS") }
                            TextButton(onClick = {
                                MyCircleStore.save(context, localPeople.filterNot { it.id == person.id })
                                localVersion++
                            }) { Text("إزالة") }
                        }
                    }
                }
            }
        }
    }

    removeTarget?.let { connection ->
        AlertDialog(
            onDismissRequest = { removeTarget = null },
            title = { Text("إزالة الارتباط؟") },
            text = { Text("سيتم إيقاف المحادثة والصلاحيات بينكما. يمكن الارتباط مجددًا لاحقًا.") },
            confirmButton = {
                Button(onClick = {
                    removeTarget = null
                    runTask(
                        success = "تمت إزالة الارتباط.",
                        operation = { RawafidCircleApi.removeConnection(context, connection.connectionId) },
                        afterSuccess = { refresh++ }
                    )
                }) { Text("إزالة") }
            },
            dismissButton = { TextButton(onClick = { removeTarget = null }) { Text("إلغاء") } }
        )
    }
}

@Composable
private fun CirclePermissionsCard(
    connection: CircleConnection,
    snapshot: List<CirclePermissionSnapshot>,
    busy: Boolean,
    onToggle: (String, Boolean) -> Unit,
    onClose: () -> Unit
) {
    val labels = mapOf(
        "chat" to "السماح له بإرسال رسائل اختيارية لي",
        "quick_questions" to "السماح له بإرسال أسئلة سريعة لي",
        "location_request" to "السماح له بطلب موقعي — لا يُرسل دون موافقتي",
        "emergency" to "السماح له باستلام تنبيهات طوارئي عند تفعيلها",
        "safe_arrival" to "السماح له باستلام تحديثات الوصول الآمن",
        "care" to "السماح له بمزايا الرعاية التي أفعّلها",
        "safety_location" to "إرسال موقع مراقبة الأمان الخاص بي إليه تلقائيًا عندما أشغّل المراقبة",
        "driving_safety" to "السماح له باستلام تنبيهات وتقارير القيادة الآمنة التي أفعّل مشاركتها، وموقعي فقط عند طلب المساعدة أو التصعيد المفعّل مسبقًا"
    )
    Card {
        Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
            Text("صلاحياتي مع ${connection.counterpartName}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text("كل صلاحية مستقلة ويمكن سحبها في أي وقت. موقع الأمان أو موقع حادث القيادة يخصك أنت ولا يمنح الطرف الآخر حق تتبعك المستمر.")
            if (snapshot.isEmpty()) Text("جارٍ تحميل الصلاحيات...")
            snapshot.forEach { permission ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(labels[permission.permission] ?: permission.permission)
                        Text(
                            if (permission.theirs) "الطرف الآخر يمنحك الصلاحية المقابلة" else "الطرف الآخر لم يمنحك الصلاحية المقابلة",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                    Switch(permission.mine, enabled = !busy, onCheckedChange = { onToggle(permission.permission, it) })
                }
            }
            OutlinedButton(onClick = onClose) { Text("إغلاق") }
        }
    }
}

private fun rawafidQr(text: String): Bitmap {
    val size = 720
    val matrix = QRCodeWriter().encode(text, BarcodeFormat.QR_CODE, size, size)
    val pixels = IntArray(size * size)
    for (y in 0 until size) {
        for (x in 0 until size) pixels[y * size + x] = if (matrix[x, y]) Color.BLACK else Color.WHITE
    }
    return Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888).also {
        it.setPixels(pixels, 0, size, 0, 0, size, size)
    }
}
