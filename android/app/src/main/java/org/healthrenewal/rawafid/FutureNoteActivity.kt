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
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

data class FutureNote(val id: Long, val revealAt: Long, val text: String, val revealed: Boolean)

object FutureNoteStore {
    private const val KEY = "future_notes_v1"
    fun notes(context: Context): List<FutureNote> {
        val raw = EncryptedLocalStore.get(context, KEY) ?: return emptyList()
        return runCatching {
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.optJSONObject(i) ?: continue
                    add(FutureNote(o.optLong("id"), o.optLong("reveal_at"), o.optString("text"), o.optBoolean("revealed")))
                }
            }.sortedBy { it.revealAt }
        }.getOrDefault(emptyList())
    }
    fun save(context: Context, values: List<FutureNote>) {
        val a = JSONArray()
        values.take(100).forEach { n -> a.put(JSONObject().put("id", n.id).put("reveal_at", n.revealAt).put("text", n.text).put("revealed", n.revealed)) }
        EncryptedLocalStore.put(context, KEY, a.toString())
    }
}

object FutureNoteScheduler {
    fun schedule(context: Context, note: FutureNote) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, note.revealAt, pending(context, note.id))
    }
    fun restore(context: Context) = FutureNoteStore.notes(context).filter { !it.revealed && it.revealAt > System.currentTimeMillis() }.forEach { schedule(context, it) }
    private fun pending(context: Context, id: Long) = PendingIntent.getBroadcast(context, id.toInt(), Intent(context, FutureNoteReceiver::class.java).putExtra("id", id), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
}

class FutureNoteReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        NotificationChannels.create(context)
        val id = intent?.getLongExtra("id", -1L) ?: -1L
        val open = PendingIntent.getActivity(context, id.toInt(), Intent(context, FutureNoteActivity::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
        manager.notify(id.toInt(), androidx.core.app.NotificationCompat.Builder(context, NotificationChannels.DAILY)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("رسالة من نفسك")
            .setContentText("هناك رسالة كتبتها لنفسك في وقت سابق. افتح روافد لقراءتها.")
            .setContentIntent(open)
            .setAutoCancel(true)
            .build())
    }
}

class FutureNoteActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { RawafidTheme { CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) { Surface(Modifier.fillMaxSize()) { FutureNoteScreen() } } } }
    }
}

@Composable
private fun FutureNoteScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var text by rememberSaveable { mutableStateOf("") }
    var delayDays by rememberSaveable { mutableIntStateOf(1) }
    val notes = remember(version) { FutureNoteStore.notes(context) }
    val now = System.currentTimeMillis()

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("رسالة لنفسي لاحقًا", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("النص مشفر محليًا. الإشعار لا يعرض محتوى الرسالة على شاشة القفل؛ يطلب منك فتح التطبيق فقط.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    OutlinedTextField(text, { text = it.take(1500) }, label = { Text("ماذا تريد أن تقول لنفسك؟") }, minLines = 5, modifier = Modifier.fillMaxWidth())
                    androidx.compose.foundation.layout.Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(1, 7, 30).forEach { days -> FilterChip(selected = delayDays == days, onClick = { delayDays = days }, label = { Text(if (days == 1) "غدًا" else "بعد $days يوم") }) }
                    }
                    Button(onClick = {
                        if (text.isNotBlank()) {
                            val id = System.currentTimeMillis()
                            val note = FutureNote(id, id + delayDays * 86_400_000L, text.trim(), false)
                            FutureNoteStore.save(context, notes + note)
                            FutureNoteScheduler.schedule(context, note)
                            text = ""; version++
                        }
                    }) { Text("احفظها للمستقبل") }
                }
            }
        }
        notes.forEach { note ->
            item(key = note.id) {
                val due = note.revealAt <= now
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        val date = Instant.ofEpochMilli(note.revealAt).atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                        Text("موعدها: $date", fontWeight = FontWeight.Bold)
                        Text(if (due) note.text else "ستبقى الرسالة مخفية حتى موعدها.")
                        TextButton(onClick = { FutureNoteStore.save(context, notes.filterNot { it.id == note.id }); version++ }) { Text("حذف") }
                    }
                }
            }
        }
    }
}
