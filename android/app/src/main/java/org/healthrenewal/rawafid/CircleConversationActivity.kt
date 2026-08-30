package org.healthrenewal.rawafid

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

private data class QuickQuestionTemplate(val key: String, val text: String)
private val quickQuestionTemplates = listOf(
    QuickQuestionTemplate("are_you_ok", "هل أنت بخير؟"),
    QuickQuestionTemplate("medication_taken", "هل أخذت دواءك؟"),
    QuickQuestionTemplate("ate_food", "هل تناولت طعامك؟"),
    QuickQuestionTemplate("drank_water", "هل شربت الماء؟"),
    QuickQuestionTemplate("need_help", "هل تحتاج مساعدة؟"),
    QuickQuestionTemplate("arrived", "هل وصلت؟"),
    QuickQuestionTemplate("call_you", "هل تريد أن أتصل بك؟")
)

class CircleConversationActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) {
                        CircleConversationScreen(
                            connectionId = intent.getStringExtra("connection_id").orEmpty(),
                            counterpartName = intent.getStringExtra("counterpart_name").orEmpty().ifBlank { "شخص من دائرتي" },
                            myLabel = intent.getStringExtra("my_label").orEmpty(),
                            canMessage = intent.getBooleanExtra("can_message", true),
                            canQuickQuestion = intent.getBooleanExtra("can_quick_question", true),
                            canRequestLocation = intent.getBooleanExtra("can_request_location", true)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CircleConversationScreen(connectionId: String, counterpartName: String, myLabel: String, canMessage: Boolean, canQuickQuestion: Boolean, canRequestLocation: Boolean) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var messages by remember { mutableStateOf<List<CircleCloudMessage>>(emptyList()) }
    var draft by rememberSaveable { mutableStateOf("") }
    var customQuestion by rememberSaveable { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("") }
    var pendingLocationReplyTo by remember { mutableStateOf<String?>(null) }

    fun refresh() {
        if (connectionId.isBlank()) return
        scope.launch {
            runCatching { withContext(Dispatchers.IO) { RawafidCircleApi.messages(context, connectionId) } }
                .onSuccess { messages = it; loading = false }
                .onFailure { error = it.message ?: "تعذر تحميل المحادثة."; loading = false }
        }
    }

    fun runAction(action: () -> Unit, successMessage: String = "") {
        if (busy) return
        scope.launch {
            busy = true; error = ""; status = ""
            runCatching { withContext(Dispatchers.IO) { action() } }
                .onSuccess {
                    if (successMessage.isNotBlank()) status = successMessage
                    runCatching { withContext(Dispatchers.IO) { RawafidCircleApi.messages(context, connectionId) } }.onSuccess { messages = it }
                }
                .onFailure { error = it.message ?: "تعذر إكمال العملية." }
            busy = false
        }
    }

    fun shareCurrentLocation(replyToId: String?) {
        error = ""; status = "جارٍ تحديد موقعك الحالي..."
        SingleLocationCapture.capture(context) { result ->
            result.onSuccess { location ->
                runAction({
                    RawafidCircleApi.shareLocation(context, connectionId, location.latitude, location.longitude, location.accuracy.takeIf { location.hasAccuracy() }?.toDouble(), replyToId)
                }, "تم إرسال موقعك الحالي مرة واحدة.")
            }.onFailure { error = it.message ?: "تعذر تحديد الموقع."; status = "" }
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { grants: Map<String, Boolean> ->
        val granted = grants[Manifest.permission.ACCESS_FINE_LOCATION] == true || grants[Manifest.permission.ACCESS_COARSE_LOCATION] == true ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (granted) {
            val reply = pendingLocationReplyTo; pendingLocationReplyTo = null; shareCurrentLocation(reply)
        } else { error = "إذن الموقع مطلوب فقط عند اختيارك مشاركة موقعك."; pendingLocationReplyTo = null }
    }

    fun requestExplicitLocationShare(replyToId: String?) {
        val granted = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (granted) shareCurrentLocation(replyToId) else {
            pendingLocationReplyTo = replyToId
            permissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
        }
    }

    LaunchedEffect(connectionId) {
        if (connectionId.isBlank()) { error = "تعذر فتح هذا الارتباط."; loading = false; return@LaunchedEffect }
        while (true) {
            runCatching { withContext(Dispatchers.IO) { RawafidCircleApi.messages(context, connectionId) } }
                .onSuccess { messages = it; loading = false }
                .onFailure { if (messages.isEmpty()) error = it.message ?: "تعذر تحديث المحادثة."; loading = false }
            delay(5_000L)
        }
    }

    LazyColumn(contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text(counterpartName, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                if (myLabel.isNotBlank()) Text(myLabel)
                Text("محادثة رعاية بسيطة وخاصة. مشاركة الموقع لا تتم إلا عند ضغطك عليها أو وفق مراقبة أمان فعّلتها أنت مسبقًا.", style = MaterialTheme.typography.bodySmall)
            }
        }
        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("رسالة اختيارية", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    OutlinedTextField(value = draft, onValueChange = { draft = it.take(4000) }, label = { Text("اكتب رسالتك") }, modifier = Modifier.fillMaxWidth(), minLines = 2, maxLines = 5)
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Button(enabled = !busy && canMessage && draft.isNotBlank(), onClick = { val text = draft; runAction({ RawafidCircleApi.sendText(context, connectionId, text); draft = "" }) }) { Text("إرسال") }
                        OutlinedButton(enabled = !busy, onClick = { requestExplicitLocationShare(null) }) { Text("أرسل موقعي") }
                        OutlinedButton(enabled = !busy && canRequestLocation, onClick = { runAction({ RawafidCircleApi.requestLocation(context, connectionId) }) }) { Text("أرسل لي موقعك") }
                    }
                    if (!canMessage) Text("الطرف الآخر أوقف استقبال الرسائل النصية حاليًا.", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("سؤال سريع", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text("يصل كسؤال يمكن الرد عليه بنعم أو لا. الإجابة تعرض كلمة ورمزًا إلى جانب اللون.", style = MaterialTheme.typography.bodySmall)
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        quickQuestionTemplates.forEach { template -> OutlinedButton(enabled = !busy && canQuickQuestion, onClick = { runAction({ RawafidCircleApi.sendYesNoQuestion(context, connectionId, template.text, template.key) }) }) { Text(template.text) } }
                    }
                    OutlinedTextField(value = customQuestion, onValueChange = { customQuestion = it.take(500) }, modifier = Modifier.fillMaxWidth(), label = { Text("أو اكتب سؤال نعم/لا") }, singleLine = true)
                    Button(enabled = !busy && canQuickQuestion && customQuestion.isNotBlank(), onClick = { val q = customQuestion; runAction({ RawafidCircleApi.sendYesNoQuestion(context, connectionId, q, null); customQuestion = "" }) }) { Text("إرسال السؤال") }
                }
            }
        }
        if (status.isNotBlank()) item { Text(status, color = MaterialTheme.colorScheme.primary) }
        if (error.isNotBlank()) item { Text(error, color = MaterialTheme.colorScheme.error) }
        item { Text("المحادثة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
        if (loading && messages.isEmpty()) item { Text("جارٍ التحميل...") }
        if (!loading && messages.isEmpty()) item { Text("لا توجد رسائل بعد.") }
        items(messages, key = { it.messageId }) { message ->
            CircleMessageCard(message, busy,
                onAnswer = { answer -> runAction({ RawafidCircleApi.answerMessage(context, message.messageId, answer) }) },
                onShareRequestedLocation = { requestExplicitLocationShare(message.messageId) },
                onOpenMap = { lat, lon -> runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/search/?api=1&query=$lat,$lon"))) } }
            )
        }
        item { OutlinedButton(onClick = { refresh() }, enabled = !busy) { Text("تحديث الآن") } }
    }
}

@Composable
private fun CircleMessageCard(message: CircleCloudMessage, busy: Boolean, onAnswer: (String) -> Unit, onShareRequestedLocation: () -> Unit, onOpenMap: (Double, Double) -> Unit) {
    Card {
        Column(Modifier.fillMaxWidth().padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
            Text(if (message.senderIsMe) "أنت" else "من الطرف الآخر", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
            if (message.body.isNotBlank()) Text(message.body)
            when (message.kind) {
                "yes_no_question" -> {
                    val answer = message.answerCode
                    if (!message.senderIsMe && answer == null) {
                        Row(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                            Button(enabled = !busy, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16834B), contentColor = Color.White), onClick = { onAnswer("yes") }) { Text("نعم ✓") }
                            Button(enabled = !busy, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFB3261E), contentColor = Color.White), onClick = { onAnswer("no") }) { Text("لا ✕") }
                        }
                    } else if (answer != null) Text(if (answer == "yes") "الإجابة: نعم ✓" else "الإجابة: لا ✕", fontWeight = FontWeight.SemiBold)
                }
                "location_request" -> {
                    if (!message.senderIsMe && message.answerCode == null) {
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                            Button(enabled = !busy, onClick = onShareRequestedLocation) { Text("إرسال موقعي الآن") }
                            OutlinedButton(enabled = !busy, onClick = { onAnswer("decline") }) { Text("رفض") }
                        }
                    } else if (message.answerCode == "decline") Text("تم رفض طلب الموقع.")
                }
                "location_share" -> {
                    val lat = message.latitude; val lon = message.longitude
                    if (lat != null && lon != null) { Text("موقع تمت مشاركته صراحةً من صاحب الحساب."); OutlinedButton(onClick = { onOpenMap(lat, lon) }) { Text("فتح الموقع على الخريطة") } }
                }
            }
            Text(message.createdAt.replace('T', ' ').take(16), style = MaterialTheme.typography.bodySmall)
        }
    }
}

private object SingleLocationCapture {
    fun capture(context: Context, callback: (Result<Location>) -> Unit) {
        val manager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val hasFine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (!hasFine && !hasCoarse) { callback(Result.failure(IllegalStateException("إذن الموقع غير متاح."))); return }
        val provider = when { hasFine && manager.isProviderEnabled(LocationManager.GPS_PROVIDER) -> LocationManager.GPS_PROVIDER; manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) -> LocationManager.NETWORK_PROVIDER; else -> null }
        if (provider == null) { callback(Result.failure(IllegalStateException("فعّل خدمات الموقع ثم حاول مرة أخرى."))); return }
        val handler = Handler(Looper.getMainLooper()); var finished = false; lateinit var listener: LocationListener
        fun finish(result: Result<Location>) { if (finished) return; finished = true; handler.removeCallbacksAndMessages(null); runCatching { manager.removeUpdates(listener) }; callback(result) }
        listener = object : LocationListener {
            override fun onLocationChanged(location: Location) = finish(Result.success(location))
            override fun onProviderDisabled(provider: String) = Unit
            override fun onProviderEnabled(provider: String) = Unit
            @Deprecated("Deprecated in Android") override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) = Unit
        }
        @Suppress("MissingPermission") manager.requestLocationUpdates(provider, 0L, 0f, listener, Looper.getMainLooper())
        handler.postDelayed({
            if (!finished) {
                @Suppress("MissingPermission") val cached = runCatching { manager.getLastKnownLocation(provider) }.getOrNull()
                if (cached != null && System.currentTimeMillis() - cached.time < 10 * 60_000L) finish(Result.success(cached)) else finish(Result.failure(IllegalStateException("لم يتمكن الهاتف من تحديد موقع حديث.")))
            }
        }, 20_000L)
    }
}
