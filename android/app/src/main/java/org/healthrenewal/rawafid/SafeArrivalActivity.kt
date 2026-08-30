package org.healthrenewal.rawafid

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
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
import androidx.compose.material3.Button
import androidx.compose.material3.Card
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
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

data class SafeArrivalCheck(
    val dueAt: Long = 0L,
    val reason: String = "",
    val message: String = "",
    val active: Boolean = false
)

object SafeArrivalStore {
    private const val PREFS = "rawafid_safe_arrival_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun load(context: Context) = SafeArrivalCheck(
        dueAt = prefs(context).getLong("due_at", 0L),
        reason = prefs(context).getString("reason", "") ?: "",
        message = prefs(context).getString("message", "") ?: "",
        active = prefs(context).getBoolean("active", false)
    )

    fun save(context: Context, check: SafeArrivalCheck) = prefs(context).edit()
        .putLong("due_at", check.dueAt)
        .putString("reason", check.reason)
        .putString("message", check.message)
        .putBoolean("active", check.active)
        .apply()

    fun clear(context: Context) = prefs(context).edit().clear().apply()
}

object SafeArrivalScheduler {
    private const val REQUEST = 8301

    fun schedule(context: Context, check: SafeArrivalCheck) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pending = pendingIntent(context)
        alarm.cancel(pending)
        if (!check.active || check.dueAt <= System.currentTimeMillis()) return
        alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, check.dueAt, pending)
    }

    fun cancel(context: Context) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarm.cancel(pendingIntent(context))
    }

    private fun pendingIntent(context: Context) = PendingIntent.getBroadcast(
        context,
        REQUEST,
        Intent(context, SafeArrivalReceiver::class.java),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
}

class SafeArrivalReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val check = SafeArrivalStore.load(context)
        if (!check.active) return
        val open = Intent(context, SafeArrivalActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        val pending = PendingIntent.getActivity(context, 8302, open, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
        NotificationChannels.create(context)
        val notification = androidx.core.app.NotificationCompat.Builder(context, NotificationChannels.DAILY)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("وصلت بالسلامة؟")
            .setContentText("حان وقت التأكيد الذي حددته. افتح روافد واختر «أنا بخير» أو شارك رسالة المساعدة بنفسك.")
            .setStyle(androidx.core.app.NotificationCompat.BigTextStyle().bigText("حان وقت التأكيد الذي حددته. عدم الرد لا يعني تلقائيًا وجود طارئ في هذه النسخة؛ افتح روافد لتأكيد أنك بخير أو لاختيار مشاركة رسالة مع شخص موثوق."))
            .setContentIntent(pending)
            .setAutoCancel(true)
            .build()
        manager.notify(8303, notification)
    }
}

class SafeArrivalActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { SafeArrivalScreen() }
                }
            }
        }
    }
}

@Composable
private fun SafeArrivalScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    val existing = remember(version) { SafeArrivalStore.load(context) }
    var minutes by rememberSaveable { mutableStateOf("60") }
    var reason by rememberSaveable { mutableStateOf(existing.reason) }
    var message by rememberSaveable { mutableStateOf(existing.message.ifBlank { "لم أؤكد وصولي في الوقت الذي حددته. أرجو التواصل معي للاطمئنان." }) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("وصلت بالسلامة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("تحدد أنت وقت التحقق. روافد يذكّرك، ولا يفترض الطوارئ أو يرسل شيئًا تلقائيًا في هذه النسخة.")
            }
        }
        if (existing.active) {
            item {
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                        val due = Instant.ofEpochMilli(existing.dueAt).atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                        Text("فحص أمان نشط", fontWeight = FontWeight.Bold)
                        Text("وقت التأكيد: $due")
                        if (existing.reason.isNotBlank()) Text("السبب: ${existing.reason}")
                        Button(onClick = { SafeArrivalScheduler.cancel(context); SafeArrivalStore.clear(context); version++ }) { Text("أنا بخير — إنهاء الفحص") }
                        OutlinedButton(onClick = {
                            val intent = Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, existing.message) }
                            context.startActivity(Intent.createChooser(intent, "اختر شخصًا أو تطبيقًا"))
                        }) { Text("مشاركة رسالة المساعدة") }
                    }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("ابدأ فحصًا جديدًا", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(minutes, { minutes = it.filter(Char::isDigit).take(4) }, label = { Text("بعد كم دقيقة؟") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(reason, { reason = it.take(140) }, label = { Text("السبب — مثال: مشي، سفر، طريق") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(message, { message = it.take(500) }, label = { Text("رسالة جاهزة إذا احتجت مشاركتها") }, minLines = 3, modifier = Modifier.fillMaxWidth())
                    Button(onClick = {
                        val mins = minutes.toLongOrNull()?.coerceIn(1, 24 * 60) ?: 60L
                        val check = SafeArrivalCheck(System.currentTimeMillis() + mins * 60_000L, reason.trim(), message.trim(), true)
                        SafeArrivalStore.save(context, check)
                        SafeArrivalScheduler.schedule(context, check)
                        version++
                    }) { Text("بدء فحص الأمان") }
                }
            }
        }
    }
}
