package org.healthrenewal.rawafid

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

private data class WomenEntry(
    val date: String,
    val mood: Int,
    val energy: Int,
    val pain: Int,
    val bleeding: String,
    val feeling: String,
    val need: String,
    val note: String
)

private object WomenCompanionStore {
    private const val PREFS = "rawafid_women_companion_v1"
    private const val ENTRIES = "entries"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun reminderEnabled(context: Context) = prefs(context).getBoolean("reminder_enabled", false)
    fun reminderMinutes(context: Context) = prefs(context).getLong("reminder_minutes", 240L)
    fun reminderMax(context: Context) = prefs(context).getInt("reminder_max", 4)

    fun setReminderEnabled(context: Context, enabled: Boolean) {
        prefs(context).edit().putBoolean("reminder_enabled", enabled).apply()
    }

    fun setReminderMinutes(context: Context, minutes: Long) {
        prefs(context).edit().putLong("reminder_minutes", minutes.coerceAtLeast(60L)).apply()
    }

    fun setReminderMax(context: Context, value: Int) {
        prefs(context).edit().putInt("reminder_max", value.coerceIn(1, 8)).apply()
    }

    fun claimReminderSlot(context: Context): Boolean {
        val p = prefs(context)
        val today = LocalDate.now().toString()
        val savedDay = p.getString("reminder_day", "")
        val previous = if (savedDay == today) p.getInt("reminder_count", 0) else 0
        if (previous >= reminderMax(context)) return false
        p.edit().putString("reminder_day", today).putInt("reminder_count", previous + 1).apply()
        return true
    }

    fun entries(context: Context): List<WomenEntry> {
        val raw = prefs(context).getString(ENTRIES, "[]") ?: "[]"
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val item = array.getJSONObject(i)
                    add(
                        WomenEntry(
                            date = item.getString("date"),
                            mood = item.optInt("mood", 3),
                            energy = item.optInt("energy", 3),
                            pain = item.optInt("pain", 0),
                            bleeding = item.optString("bleeding", "none"),
                            feeling = item.optString("feeling", "بخير"),
                            need = item.optString("need", "هدوء"),
                            note = item.optString("note", "")
                        )
                    )
                }
            }.sortedByDescending { it.date }.take(120)
        }.getOrDefault(emptyList())
    }

    fun saveToday(context: Context, entry: WomenEntry) {
        val all = (listOf(entry) + entries(context).filterNot { it.date == entry.date }).take(120)
        val array = JSONArray()
        all.forEach { value ->
            array.put(JSONObject().apply {
                put("date", value.date)
                put("mood", value.mood)
                put("energy", value.energy)
                put("pain", value.pain)
                put("bleeding", value.bleeding)
                put("feeling", value.feeling)
                put("need", value.need)
                put("note", value.note)
            })
        }
        prefs(context).edit().putString(ENTRIES, array.toString()).apply()
    }
}

private object WomenCompanionScheduler {
    private const val UNIQUE_WORK = "rawafid_women_companion"
    private const val CHANNEL = "rawafid_women_companion"

    fun sync(context: Context) {
        val manager = WorkManager.getInstance(context)
        if (!WomenCompanionStore.reminderEnabled(context)) {
            manager.cancelUniqueWork(UNIQUE_WORK)
            return
        }
        val minutes = WomenCompanionStore.reminderMinutes(context).coerceAtLeast(60L)
        val request = PeriodicWorkRequestBuilder<WomenCompanionWorker>(minutes, TimeUnit.MINUTES)
            .setInitialDelay(minutes, TimeUnit.MINUTES)
            .setInputData(Data.EMPTY)
            .build()
        manager.enqueueUniquePeriodicWork(UNIQUE_WORK, ExistingPeriodicWorkPolicy.UPDATE, request)
    }

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(
            NotificationChannel(CHANNEL, "رفيقة روافد", NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = "رسائل دعم واختيارات عناية يومية للمرأة، تعمل محليًا وبصورة اختيارية"
            }
        )
    }

    fun channelId() = CHANNEL
}

class WomenCompanionWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        if (!WomenCompanionStore.reminderEnabled(applicationContext)) return Result.success()
        if (LocalStore.isQuietHour(applicationContext, LocalDateTime.now().hour)) return Result.success()
        if (!WomenCompanionStore.claimReminderSlot(applicationContext)) return Result.success()
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(applicationContext, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return Result.success()

        WomenCompanionScheduler.ensureChannel(applicationContext)
        val bank = listOf(
            "كيف حالك الآن؟ لا تحتاجين إلى إجابة مثالية؛ اختاري ما تحتاجينه فعلًا في هذه اللحظة.",
            "امنحي نفسك دقيقة: ماء، راحة، حركة لطيفة، طعام مناسب، هدوء أو تواصل مع شخص آمن.",
            "طاقتك اليوم ليست مقياسًا لقيمتك. عدّلي خطتك بحيث تناسب واقعك لا توقعات الآخرين.",
            "هل مر وقت طويل وأنت منشغلة بالآخرين؟ خذي لحظة قصيرة لك أنتِ الآن.",
            "إذا كان يومك ثقيلًا، اختاري مهمة واحدة فقط يمكن إنجازها بوضوح واتركي الباقي لوقته.",
            "لا تهملي تغيرًا واضحًا أو مزعجًا عن المعتاد لديك؛ سجليه وناقشيه مع مختصة مؤهلة إذا استمر أو أقلقك.",
            "حدودك وراحتك ووقتك احتياجات مشروعة. ليس عليك شرح كل احتياج حتى يصبح مهمًا.",
            "خذي نفسًا أبطأ، أرخِي كتفيك، واسألي نفسك: ما الذي سيجعل الساعة القادمة ألطف بدرجة واحدة؟"
        )
        val index = (LocalDate.now().dayOfYear * 7 + LocalDateTime.now().hour) % bank.size
        val openIntent = PendingIntent.getActivity(
            applicationContext,
            9401,
            Intent(applicationContext, WomenActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(applicationContext, WomenCompanionScheduler.channelId())
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("رفيقة روافد · لحظة لك")
            .setContentText(bank[index])
            .setStyle(NotificationCompat.BigTextStyle().bigText(bank[index]))
            .setContentIntent(openIntent)
            .setAutoCancel(true)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .build()
        (applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .notify(9400, notification)
        return Result.success()
    }
}

class WomenActivity : ComponentActivity() {
    private var permissionContinuation: ((Boolean) -> Unit)? = null
    private val notificationPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        permissionContinuation?.invoke(granted)
        permissionContinuation = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WomenCompanionScheduler.ensureChannel(this)
        WomenCompanionScheduler.sync(this)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) {
                        WomenCompanionScreen(requestNotifications = ::requestNotifications)
                    }
                }
            }
        }
    }

    private fun requestNotifications(onResult: (Boolean) -> Unit) {
        if (Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
            onResult(true)
            return
        }
        permissionContinuation = onResult
        notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
    }
}

@Composable
private fun WomenCompanionScreen(requestNotifications: ((Boolean) -> Unit) -> Unit) {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    val today = LocalDate.now().toString()
    val existing = remember(version) { WomenCompanionStore.entries(context).firstOrNull { it.date == today } }

    var mood by rememberSaveable(existing?.date) { mutableIntStateOf(existing?.mood ?: 3) }
    var energy by rememberSaveable(existing?.date) { mutableIntStateOf(existing?.energy ?: 3) }
    var pain by rememberSaveable(existing?.date) { mutableIntStateOf(existing?.pain ?: 0) }
    var bleeding by rememberSaveable(existing?.date) { mutableStateOf(existing?.bleeding ?: "none") }
    var feeling by rememberSaveable(existing?.date) { mutableStateOf(existing?.feeling ?: "بخير") }
    var need by rememberSaveable(existing?.date) { mutableStateOf(existing?.need ?: "هدوء") }
    var note by rememberSaveable(existing?.date) { mutableStateOf(existing?.note ?: "") }
    var vent by rememberSaveable { mutableStateOf("") }
    var savedMessage by remember { mutableStateOf("") }

    val companion = remember(mood, energy, pain, bleeding, feeling, need) {
        companionMessage(mood, energy, pain, bleeding, feeling, need)
    }
    val recent = remember(version) { WomenCompanionStore.entries(context).take(7) }
    val reminderEnabled = remember(version) { WomenCompanionStore.reminderEnabled(context) }
    val reminderMinutes = remember(version) { WomenCompanionStore.reminderMinutes(context) }
    val reminderMax = remember(version) { WomenCompanionStore.reminderMax(context) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Favorite, contentDescription = null)
                        Text("قطاع المرأة", fontWeight = FontWeight.Bold)
                    }
                    Text("رفيقة روافد", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text("مساحة يومية خاصة للمرأة: تسمعك، تساعدك على وصف يومك، وتذكّرك بالعناية بنفسك من دون لوم أو تشخيص.")
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("كيف تشعرين الآن؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    ChoiceRow(listOf("هادئة", "بخير", "متعبة", "قلقة", "منزعجة"), feeling) { feeling = it }
                    Text("ماذا تحتاجين الآن؟", fontWeight = FontWeight.Bold)
                    ChoiceRow(listOf("هدوء", "ماء", "راحة", "حركة", "طعام", "تواصل آمن"), need) { need = it }
                    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("من رفيقة روافد", fontWeight = FontWeight.Bold)
                            Text(companion)
                        }
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("متابعة اليوم", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    MetricSlider("المزاج", mood, 1, 5) { mood = it }
                    MetricSlider("الطاقة", energy, 1, 5) { energy = it }
                    MetricSlider("الألم", pain, 0, 10) { pain = it }
                    Text("النزف", fontWeight = FontWeight.Bold)
                    ChoiceRow(listOf("none", "light", "moderate", "heavy"), bleeding, labels = mapOf("none" to "لا يوجد", "light" to "خفيف", "moderate" to "متوسط", "heavy" to "غزير")) { bleeding = it }
                    OutlinedTextField(
                        value = note,
                        onValueChange = { note = it.take(600) },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3,
                        label = { Text("ملاحظة خاصة اختيارية") }
                    )
                    Button(onClick = {
                        WomenCompanionStore.saveToday(
                            context,
                            WomenEntry(today, mood, energy, pain, bleeding, feeling, need, note.trim())
                        )
                        savedMessage = "تم حفظ متابعة اليوم على هذا الهاتف."
                        version++
                    }) { Text("حفظ متابعة اليوم") }
                    if (savedMessage.isNotBlank()) Text(savedMessage, color = MaterialTheme.colorScheme.primary)
                    if (pain >= 8 || bleeding == "heavy") {
                        Text(
                            "إذا كان الألم شديدًا جدًا، أو كان النزف مختلفًا بوضوح عن المعتاد لديك، أو ترافق مع دوخة شديدة/إغماء أو شعور بأنك لست بخير، فاطلبي تقييمًا طبيًا مناسبًا بدل الاعتماد على التطبيق.",
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("تقويم المرأة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("افتحي تقويم المرأة لتسجيل النمط عبر الأيام ومراجعة المزاج والطاقة والألم والنزف. الرفيقة لا تحول هذه البيانات إلى تشخيص أو تنبؤ بالخصوبة.")
                    Button(onClick = {
                        context.startActivity(
                            Intent(context, WebActivity::class.java)
                                .putExtra(WebActivity.EXTRA_URL, "https://healthrenewal.org/sectors/calendars/women")
                        )
                    }) {
                        Icon(Icons.Default.CalendarMonth, contentDescription = null)
                        Spacer(Modifier.size(8.dp))
                        Text("فتح تقويم المرأة")
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("رسائل رفيقة روافد", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column(Modifier.weight(1f)) {
                            Text("تفعيل الرفيقة خلال اليوم", fontWeight = FontWeight.Bold)
                            Text("اختياري، ويحترم ساعات الصمت العامة في «اهتم بي».", style = MaterialTheme.typography.bodySmall)
                        }
                        Switch(checked = reminderEnabled, onCheckedChange = { enabled ->
                            if (!enabled) {
                                WomenCompanionStore.setReminderEnabled(context, false)
                                WomenCompanionScheduler.sync(context)
                                version++
                            } else {
                                requestNotifications { granted ->
                                    if (granted) {
                                        WomenCompanionStore.setReminderEnabled(context, true)
                                        WomenCompanionScheduler.sync(context)
                                        version++
                                    }
                                }
                            }
                        })
                    }
                    Text("كل كم ساعة؟", fontWeight = FontWeight.Bold)
                    ChoiceRow(listOf("120", "240", "360"), reminderMinutes.toString(), labels = mapOf("120" to "ساعتان", "240" to "4 ساعات", "360" to "6 ساعات")) {
                        WomenCompanionStore.setReminderMinutes(context, it.toLong())
                        WomenCompanionScheduler.sync(context)
                        version++
                    }
                    Text("الحد الأقصى اليومي: $reminderMax", fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { WomenCompanionStore.setReminderMax(context, reminderMax - 1); version++ }) { Text("−") }
                        OutlinedButton(onClick = { WomenCompanionStore.setReminderMax(context, reminderMax + 1); version++ }) { Text("+") }
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Lock, contentDescription = null)
                        Text("فضفضي ثم اتركيها", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    }
                    Text("هذا النص لا يُكتب إلى التخزين المحلي ولا إلى الخادم؛ يبقى في ذاكرة الشاشة فقط.")
                    OutlinedTextField(
                        value = vent,
                        onValueChange = { vent = it.take(4000) },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 5,
                        label = { Text("اكتبي ما في بالك") }
                    )
                    Button(enabled = vent.isNotBlank(), onClick = { vent = "" }) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = null)
                        Spacer(Modifier.size(8.dp))
                        Text("دعها تذهب")
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("مساحتك وحدودك", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("يمكنك أن تقولي: أحتاج وقتًا، لا أستطيع الآن، أريد أن أفكر أولًا، أحتاج أن أتحدث مع شخص أثق به. الحدود ليست إساءة للآخرين.")
                    OutlinedButton(onClick = {
                        context.startActivity(Intent(context, MainActivity::class.java).putExtra("destination", "safety"))
                    }) {
                        Icon(Icons.Default.Security, contentDescription = null)
                        Spacer(Modifier.size(8.dp))
                        Text("فتح مركز الأمان")
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("ملخص آخر 7 إدخالات", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    if (recent.isEmpty()) {
                        Text("لا توجد بيانات كافية بعد. ابدئي من اليوم من دون ضغط للاستمرار المثالي.")
                    } else {
                        val avgMood = recent.map { it.mood }.average()
                        val avgEnergy = recent.map { it.energy }.average()
                        val maxPain = recent.maxOf { it.pain }
                        Text("أيام مسجلة: ${recent.size}/7")
                        Text("متوسط المزاج الوصفي: ${"%.1f".format(avgMood)}/5")
                        Text("متوسط الطاقة الوصفي: ${"%.1f".format(avgEnergy)}/5")
                        Text("أعلى ألم مسجل: $maxPain/10")
                        Text("هذه أرقام وصفية لبياناتك وليست تفسيرًا طبيًا.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricSlider(label: String, value: Int, min: Int, max: Int, onChange: (Int) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text("$label: $value/$max", fontWeight = FontWeight.Bold)
        Slider(
            value = value.toFloat(),
            onValueChange = { onChange(it.toInt().coerceIn(min, max)) },
            valueRange = min.toFloat()..max.toFloat(),
            steps = (max - min - 1).coerceAtLeast(0)
        )
    }
}

@Composable
private fun ChoiceRow(values: List<String>, selected: String, labels: Map<String, String> = emptyMap(), onSelect: (String) -> Unit) {
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(values.size) { index ->
            val value = values[index]
            FilterChip(
                selected = selected == value,
                onClick = { onSelect(value) },
                label = { Text(labels[value] ?: value) }
            )
        }
    }
}

private fun companionMessage(mood: Int, energy: Int, pain: Int, bleeding: String, feeling: String, need: String): String {
    return when {
        feeling == "قلقة" -> "أنتِ لا تحتاجين إلى حل كل ما يقلقك الآن. حددي الشيء الأقرب: ما الذي يحدث؟ ما الذي تحت سيطرتك؟ وما الخطوة الأصغر التي تستطيعين أخذها؟"
        feeling == "متعبة" || energy <= 2 -> "طاقتك منخفضة اليوم؛ خففي سقف التوقعات واختاري ما هو ضروري فعلًا. الراحة ليست شيئًا يجب أن تستحقيه بالإنجاز."
        pain >= 7 -> "الألم الذي يضغط على يومك يستحق أن يؤخذ بجدية. سجلي توقيته وما يؤثر فيه، وخففي ما تستطيعين من العبء. إذا كان شديدًا أو مختلفًا بوضوح عن المعتاد فاطلبي تقييمًا مناسبًا."
        bleeding == "heavy" -> "سجلي أن النزف اليوم غزير وقارنيه بما هو معتاد لديك. إذا كان غير معتاد أو ترافق مع شعور بأنك لست بخير، لا تعتمدي على التتبع وحده واطلبي رعاية مناسبة."
        need == "ماء" -> "خذي استراحة قصيرة واشربي ماءً إذا كان مناسبًا لك ولا توجد لديك تعليمات طبية تحد السوائل. ثم عودي لما كنت تفعلينه بهدوء."
        need == "راحة" -> "اختاري راحة حقيقية، حتى لو كانت عشر دقائق بلا شاشة أو مطالب. لا تحولي الاستراحة إلى قائمة مهام جديدة."
        need == "حركة" -> "قفي وتحركي بلطف حسب قدرتك: خطوات قليلة، تمدد بسيط أو تغيير وضعية. الهدف أن تشعري أفضل، لا أن تعاقبي جسدك."
        need == "طعام" -> "إذا كنت جائعة، خذي احتياجك بجدية واختاري طعامًا مناسبًا لك ومتاحًا بدل تأجيل الأكل حتى يشتد الإرهاق."
        need == "تواصل آمن" -> "اختاري شخصًا تشعرين معه بالأمان. يمكنك أن تقولي له بوضوح: لا أحتاج حلًا الآن، أحتاج فقط أن تسمعني أو تبقى معي قليلًا."
        mood >= 4 -> "يبدو أن يومك أفضل نسبيًا الآن. احتفظي بالشيء الذي ساعدك اليوم؛ التفاصيل الصغيرة التي تنفعك تستحق أن تُلاحظ."
        else -> "كوني لطيفة ودقيقة مع نفسك: ماذا تحتاجين خلال الساعة القادمة فقط؟ اختاري احتياجًا واحدًا بدل محاولة إصلاح اليوم كله دفعة واحدة."
    }
}
