package org.healthrenewal.rawafid

import android.Manifest
import android.app.AlarmManager
import android.app.DatePickerDialog
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.TimePickerDialog
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
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
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import org.json.JSONArray
import org.json.JSONObject
import java.text.DateFormat
import java.util.Calendar
import java.util.Date

private enum class WomenCareType(val key: String, val label: String, val defaultTitle: String) {
    CLINIC("clinic", "موعد متابعة", "موعد متابعة صحية"),
    SCREENING("screening", "فحص أو تصوير", "فحص أو تصوير موصى به"),
    BREAST("breast", "وعي بصحة الثدي", "وقت الوعي بصحة الثدي"),
    PELVIC("pelvic", "صحة الحوض", "متابعة صحة الحوض"),
    SELF_CARE("selfcare", "عناية شخصية", "وقت العناية الشخصية"),
    CUSTOM("custom", "أخرى", "موعد عناية")
}

private data class WomenCareItem(
    val id: Int,
    val type: WomenCareType,
    val atMillis: Long,
    val title: String,
    val note: String,
    val preparation: String
)

object WomenCarePlannerStore {
    private const val PREFS = "rawafid_women_care_planner_v1"
    private const val ITEMS = "items"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun items(context: Context): List<WomenCareItem> {
        val raw = prefs(context).getString(ITEMS, "[]") ?: "[]"
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val item = array.getJSONObject(i)
                    val type = WomenCareType.entries.firstOrNull { it.key == item.optString("type") } ?: WomenCareType.CUSTOM
                    add(
                        WomenCareItem(
                            id = item.getInt("id"),
                            type = type,
                            atMillis = item.getLong("at"),
                            title = item.optString("title", type.defaultTitle),
                            note = item.optString("note", ""),
                            preparation = item.optString("preparation", "")
                        )
                    )
                }
            }.sortedBy { it.atMillis }
        }.getOrDefault(emptyList())
    }

    fun save(context: Context, value: WomenCareItem) {
        val all = (items(context).filterNot { it.id == value.id } + value).sortedBy { it.atMillis }.take(80)
        val array = JSONArray()
        all.forEach { item ->
            array.put(JSONObject().apply {
                put("id", item.id); put("type", item.type.key); put("at", item.atMillis); put("title", item.title)
                put("note", item.note); put("preparation", item.preparation)
            })
        }
        prefs(context).edit().putString(ITEMS, array.toString()).apply()
    }

    fun remove(context: Context, id: Int) {
        val array = JSONArray()
        items(context).filterNot { it.id == id }.forEach { item ->
            array.put(JSONObject().apply {
                put("id", item.id); put("type", item.type.key); put("at", item.atMillis); put("title", item.title)
                put("note", item.note); put("preparation", item.preparation)
            })
        }
        prefs(context).edit().putString(ITEMS, array.toString()).apply()
    }
}

object WomenCareReminderScheduler {
    const val CHANNEL = "rawafid_women_care_planner"

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(
            NotificationChannel(CHANNEL, "خطة العناية النسائية", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "مواعيد العناية والفحوصات والمتابعات التي تحفظها المستخدمة بنفسها"
            }
        )
    }

    fun schedule(context: Context, item: WomenCareItem) {
        if (item.atMillis <= System.currentTimeMillis()) return
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val operation = pendingIntent(context, item)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && alarm.canScheduleExactAlarms()) {
            alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, item.atMillis, operation)
        } else {
            alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, item.atMillis, operation)
        }
    }

    fun cancel(context: Context, item: WomenCareItem) {
        (context.getSystemService(Context.ALARM_SERVICE) as AlarmManager).cancel(pendingIntent(context, item))
    }

    fun rescheduleFuture(context: Context) {
        WomenCarePlannerStore.items(context).filter { it.atMillis > System.currentTimeMillis() }.forEach { schedule(context, it) }
    }

    private fun pendingIntent(context: Context, item: WomenCareItem): PendingIntent {
        return PendingIntent.getBroadcast(
            context,
            item.id,
            Intent(context, WomenCareReminderReceiver::class.java)
                .putExtra("id", item.id)
                .putExtra("title", item.title)
                .putExtra("note", item.note)
                .putExtra("preparation", item.preparation),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}

class WomenCareReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        WomenCareReminderScheduler.ensureChannel(context)
        val id = intent.getIntExtra("id", 0)
        val title = intent.getStringExtra("title").orEmpty().ifBlank { "رفيقة روافد · موعد عناية" }
        val note = intent.getStringExtra("note").orEmpty()
        val preparation = intent.getStringExtra("preparation").orEmpty()
        val body = listOf(note, preparation).filter { it.isNotBlank() }.joinToString(" · ").ifBlank { "هذا موعد حفظته أنتِ في خطة العناية." }
        val openIntent = PendingIntent.getActivity(
            context,
            id,
            Intent(context, WomenCarePlannerActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(context, WomenCareReminderScheduler.CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(openIntent)
            .setAutoCancel(true)
            .build()
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(9800 + id, notification)
        WomenCarePlannerStore.remove(context, id)
    }
}

class WomenCarePlannerActivity : ComponentActivity() {
    private var permissionContinuation: ((Boolean) -> Unit)? = null
    private val permission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        permissionContinuation?.invoke(granted); permissionContinuation = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WomenCareReminderScheduler.ensureChannel(this)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { WomenCarePlannerScreen(::requestNotifications) }
                }
            }
        }
    }

    private fun requestNotifications(result: (Boolean) -> Unit) {
        if (Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
            result(true); return
        }
        permissionContinuation = result
        permission.launch(Manifest.permission.POST_NOTIFICATIONS)
    }
}

@Composable
private fun WomenCarePlannerScreen(requestNotifications: ((Boolean) -> Unit) -> Unit) {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var type by rememberSaveable { mutableStateOf(WomenCareType.CLINIC) }
    var title by rememberSaveable { mutableStateOf(type.defaultTitle) }
    var note by rememberSaveable { mutableStateOf("") }
    var preparation by rememberSaveable { mutableStateOf("") }
    val items = remember(version) { WomenCarePlannerStore.items(context).filter { it.atMillis > System.currentTimeMillis() } }

    fun chooseDateTime() {
        val now = Calendar.getInstance()
        DatePickerDialog(context, { _, year, month, day ->
            TimePickerDialog(context, { _, hour, minute ->
                val at = Calendar.getInstance().apply {
                    set(year, month, day, hour, minute, 0); set(Calendar.MILLISECOND, 0)
                }.timeInMillis
                if (at > System.currentTimeMillis()) {
                    val id = (((at / 60000L) xor title.hashCode().toLong()).toInt() and Int.MAX_VALUE).coerceAtLeast(1)
                    val item = WomenCareItem(id, type, at, title.trim().ifBlank { type.defaultTitle }, note.trim(), preparation.trim())
                    WomenCarePlannerStore.save(context, item)
                    WomenCareReminderScheduler.schedule(context, item)
                    version++
                }
            }, now.get(Calendar.HOUR_OF_DAY), now.get(Calendar.MINUTE), false).show()
        }, now.get(Calendar.YEAR), now.get(Calendar.MONTH), now.get(Calendar.DAY_OF_MONTH)).show()
    }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("خطة العناية النسائية", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text("احفظي المواعيد التي اخترتِها أو أوصت بها مختصتك. رفيقة روافد لا تخترع موعد فحص طبي من العمر وحده ولا تستبدل توصية الطبيبة.")
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("أضيفي موعدًا", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(WomenCareType.entries.size) { index ->
                            val value = WomenCareType.entries[index]
                            FilterChip(selected = type == value, onClick = { type = value; title = value.defaultTitle }, label = { Text(value.label) })
                        }
                    }
                    OutlinedTextField(title, { title = it.take(100) }, modifier = Modifier.fillMaxWidth(), label = { Text("عنوان الموعد") })
                    OutlinedTextField(note, { note = it.take(300) }, modifier = Modifier.fillMaxWidth(), minLines = 2, label = { Text("ماذا أريد أن أسأل أو أتذكر؟") })
                    OutlinedTextField(preparation, { preparation = it.take(300) }, modifier = Modifier.fillMaxWidth(), minLines = 2, label = { Text("استعداد أو تعليمات أعطتها المختصة") })
                    Button(onClick = { requestNotifications { if (it) chooseDateTime() } }) {
                        Icon(Icons.Default.CalendarMonth, contentDescription = null); Spacer(Modifier.size(8.dp)); Text("اختيار الموعد")
                    }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("قبل الموعد", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("اكتبي الأعراض الجديدة، متى بدأت، شدتها، الأدوية والمكملات التي تستخدمينها، والأسئلة التي لا تريدين نسيانها. اتبعي تعليمات التحضير التي أعطتك إياها الجهة الطبية.")
                    Text("بعد الموعد: سجلي الخطوة التالية والموعد القادم وما الذي يستوجب الرجوع للمختصة.", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        if (items.isEmpty()) item { Text("لا توجد مواعيد قادمة في خطة العناية.") }
        items(items, key = { it.id }) { item ->
            Card {
                Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Notifications, contentDescription = null)
                        Text(item.title, fontWeight = FontWeight.Bold)
                    }
                    Text(DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(item.atMillis)))
                    if (item.note.isNotBlank()) Text("ملاحظتي: ${item.note}")
                    if (item.preparation.isNotBlank()) Text("الاستعداد: ${item.preparation}")
                    OutlinedButton(onClick = {
                        WomenCareReminderScheduler.cancel(context, item); WomenCarePlannerStore.remove(context, item.id); version++
                    }) {
                        Icon(Icons.Default.Delete, contentDescription = null); Spacer(Modifier.size(6.dp)); Text("حذف الموعد")
                    }
                }
            }
        }
    }
}
