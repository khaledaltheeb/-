package org.healthrenewal.rawafid

import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDateTime

object LifeUtilityStore {
    private const val PREFS = "rawafid_life_utilities_v1"
    private const val ENCRYPTED_PREFIX = "rawafid_life_utilities_v2_"

    private fun encryptedKey(key: String): String = ENCRYPTED_PREFIX + key.trim().take(80)

    fun text(context: Context, key: String): String = SensitiveLocalPayload.read(
        context = context,
        encryptedKey = encryptedKey(key),
        legacyPrefsName = PREFS,
        legacyKey = key,
        defaultValue = ""
    )

    fun saveText(context: Context, key: String, value: String) {
        SensitiveLocalPayload.write(context, encryptedKey(key), value, PREFS, key)
    }

    fun list(context: Context, key: String): List<String> {
        val raw = SensitiveLocalPayload.read(
            context = context,
            encryptedKey = encryptedKey(key),
            legacyPrefsName = PREFS,
            legacyKey = key,
            defaultValue = "[]",
            validator = { runCatching { JSONArray(it) }.isSuccess }
        )
        return runCatching {
            val array = JSONArray(raw)
            buildList { for (i in 0 until array.length()) add(array.optString(i)) }
        }.getOrDefault(emptyList())
    }

    fun saveList(context: Context, key: String, values: List<String>) {
        val array = JSONArray(); values.forEach(array::put)
        SensitiveLocalPayload.write(context, encryptedKey(key), array.toString(), PREFS, key)
    }

    fun objectList(context: Context, key: String): List<Pair<String, String>> {
        val raw = SensitiveLocalPayload.read(
            context = context,
            encryptedKey = encryptedKey(key),
            legacyPrefsName = PREFS,
            legacyKey = key,
            defaultValue = "[]",
            validator = { runCatching { JSONArray(it) }.isSuccess }
        )
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val o = array.optJSONObject(i) ?: continue
                    add(o.optString("a") to o.optString("b"))
                }
            }
        }.getOrDefault(emptyList())
    }

    fun saveObjectList(context: Context, key: String, values: List<Pair<String, String>>) {
        val array = JSONArray()
        values.forEach { (a, b) -> array.put(JSONObject().put("a", a).put("b", b)) }
        SensitiveLocalPayload.write(context, encryptedKey(key), array.toString(), PREFS, key)
    }
}

class LifeUtilityActivity : ComponentActivity() {
    companion object { const val EXTRA_TOOL_ID = "tool_id" }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val toolId = intent.getStringExtra(EXTRA_TOOL_ID) ?: "one_minute"
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { LifeUtilityScreen(toolId) }
                }
            }
        }
    }
}

@Composable
private fun LifeUtilityScreen(toolId: String) {
    when (toolId) {
        "screen_rest" -> ScreenRestScreen()
        "one_minute" -> OneMinuteScreen()
        "calm_now" -> CalmNowScreen()
        "mood_to_action" -> MoodToActionScreen()
        "before_leave" -> BeforeLeaveScreen()
        "where_put_it" -> WherePutItScreen()
        "quick_capture" -> QuickCaptureScreen()
        "daily_review" -> DailyReviewScreen()
        "gentle_focus" -> GentleFocusScreen()
        "need_you" -> NeedYouScreen()
        "breathing" -> BreathingScreen()
        else -> SimpleSteps("أداة روافد", "هذه الأداة قابلة للتوسعة من الكتالوج المركزي.", listOf("لا يوجد إعداد إضافي لهذه الأداة بعد."))
    }
}

@Composable
private fun SimpleSteps(title: String, subtitle: String, steps: List<String>) {
    LazyColumn(contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)) {
        item { ToolHeader(title, subtitle) }
        items(steps) { step -> Card { Text(step, Modifier.padding(RawafidSpacing.CardContent)) } }
    }
}

@Composable
private fun ToolHeader(title: String, subtitle: String) {
    Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
        Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun BreathingScreen() {
    val reduceMotion = LocalRawafidAccessibility.current.reduceMotion
    var secondsLeft by rememberSaveable { mutableIntStateOf(60) }
    var running by rememberSaveable { mutableStateOf(false) }
    val completed = secondsLeft == 0
    val elapsed = 60 - secondsLeft
    val cycleSecond = elapsed % 10
    val inhale = cycleSecond < 4
    val phaseSecondsLeft = if (inhale) 4 - cycleSecond else 10 - cycleSecond
    val phaseLabel = if (completed) "اكتملت الدقيقة" else if (inhale) "شهيق مريح" else "زفير ببطء"
    val targetSize = if (inhale) 220.dp else 132.dp
    val phaseDuration = if (inhale) 4000 else 6000
    val circleSize by animateDpAsState(
        targetValue = if (running && !completed) targetSize else 164.dp,
        animationSpec = if (reduceMotion) snap() else tween(MotionPolicy.durationMillis(reduceMotion, phaseDuration)),
        label = "breathing-circle"
    )

    LaunchedEffect(running, secondsLeft) {
        if (running && secondsLeft > 0) {
            delay(1000)
            secondsLeft -= 1
            if (secondsLeft == 0) running = false
        }
    }

    LazyColumn(
        contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item { ToolHeader("تنفس دقيقة", "جلسة تفاعلية: شهيق مريح 4 ثوانٍ ثم زفير هادئ 6 ثوانٍ، بلا حبس للنفس.") }
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(RawafidSpacing.Xl),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
                ) {
                    Box(
                        modifier = Modifier
                            .size(circleSize)
                            .background(MaterialTheme.colorScheme.primaryContainer, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            phaseLabel,
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(RawafidSpacing.Md)
                        )
                    }
                    Text(
                        if (completed) "تمت الجلسة" else formatCountdown(secondsLeft),
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold
                    )
                    if (running && !completed) {
                        Text("يتغير الإيقاع بعد $phaseSecondsLeft ث", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    if (reduceMotion) {
                        Text("تقليل الحركة مفعّل: يتغير النص دون حركة تمدد وانكماش.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
        item { TimerControls(running, completed, onStart = { running = true }, onPause = { running = false }, onRestart = { secondsLeft = 60; running = true }) }
        item {
            Text(
                "تنفس براحة ولا تجبر نفسك على عمق معين. توقف إذا شعرت بدوار أو عدم ارتياح.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun OneMinuteScreen() {
    var choice by rememberSaveable { mutableStateOf("تنفس") }
    var secondsLeft by rememberSaveable { mutableIntStateOf(60) }
    var running by rememberSaveable { mutableStateOf(false) }
    val completed = secondsLeft == 0
    val choices = listOf("تنفس", "تمدد", "ماء", "صمت", "مشي", "كتابة")

    LaunchedEffect(running, secondsLeft) {
        if (running && secondsLeft > 0) {
            delay(1000)
            secondsLeft -= 1
            if (secondsLeft == 0) running = false
        }
    }

    LazyColumn(contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)) {
        item { ToolHeader("دقيقة لي", "اختر نشاطًا ثم ابدأ دقيقة فعلية. لا تحتاج إلى مراقبة الساعة.") }
        item {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
            ) {
                choices.forEach {
                    FilterChip(
                        selected = choice == it,
                        onClick = { choice = it; secondsLeft = 60; running = false },
                        enabled = !running,
                        label = { Text(it) }
                    )
                }
            }
        }
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    Modifier.fillMaxWidth().padding(RawafidSpacing.Xl),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
                ) {
                    Text(if (completed) "اكتملت دقيقة $choice" else choice, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(formatCountdown(secondsLeft), style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                    Text(activityPrompt(choice), color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
                }
            }
        }
        item { TimerControls(running, completed, onStart = { running = true }, onPause = { running = false }, onRestart = { secondsLeft = 60; running = true }) }
    }
}

@Composable
private fun ScreenRestScreen() {
    val reduceMotion = LocalRawafidAccessibility.current.reduceMotion
    var secondsLeft by rememberSaveable { mutableIntStateOf(45) }
    var running by rememberSaveable { mutableStateOf(false) }
    val completed = secondsLeft == 0
    val stage = when {
        completed -> 4
        secondsLeft > 40 -> 0
        secondsLeft > 15 -> 1
        secondsLeft > 5 -> 2
        else -> 3
    }
    val title = when (stage) {
        0 -> "ارمش ببطء"
        1 -> "انظر إلى نقطة بعيدة"
        2 -> "أرخِ كتفيك ورقبتك"
        3 -> "استعد للعودة"
        else -> "اكتملت الاستراحة"
    }
    val cueTarget = when (stage) {
        0 -> 72.dp
        1 -> 184.dp
        2 -> 150.dp
        3 -> 130.dp
        else -> 160.dp
    }
    val cueSize by animateDpAsState(
        targetValue = cueTarget,
        animationSpec = if (reduceMotion) snap() else tween(MotionPolicy.durationMillis(reduceMotion, if (stage == 0) 3000 else 900)),
        label = "screen-rest-cue"
    )

    LaunchedEffect(running, secondsLeft) {
        if (running && secondsLeft > 0) {
            delay(1000)
            secondsLeft -= 1
            if (secondsLeft == 0) running = false
        }
    }

    LazyColumn(contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)) {
        item { ToolHeader("راحة الشاشة", "جلسة 45 ثانية تقودك خطوة بخطوة بدل الاكتفاء بتعليمات ثابتة.") }
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    Modifier.fillMaxWidth().padding(RawafidSpacing.Xl),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
                ) {
                    Box(
                        Modifier.size(cueSize).background(MaterialTheme.colorScheme.secondaryContainer, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            if (stage == 0) "ارمش" else "راحة",
                            color = MaterialTheme.colorScheme.onSecondaryContainer,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                    Text(formatCountdown(secondsLeft), style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                    Text(screenRestPrompt(stage), color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
                    if (reduceMotion) Text("تقليل الحركة مفعّل؛ المؤشر يغيّر حجمه فورًا دون حركة تدريجية.", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        item { TimerControls(running, completed, onStart = { running = true }, onPause = { running = false }, onRestart = { secondsLeft = 45; running = true }) }
        item {
            Text(
                "سيصدر تنبيه صوتي قصير عند انتهاء الجلسة؛ يمكنك إبعاد نظرك عن الشاشة بثقة. تذكير الرمش الدوري خارج هذه الشاشة يبقى إشعار Android ويمكن ضبط نغمته واهتزازه من إعدادات روافد.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun TimerControls(
    running: Boolean,
    completed: Boolean,
    onStart: () -> Unit,
    onPause: () -> Unit,
    onRestart: () -> Unit
) {
    var completionSoundPlayed by rememberSaveable { mutableStateOf(false) }
    LaunchedEffect(completed) {
        if (!completed) {
            completionSoundPlayed = false
            return@LaunchedEffect
        }
        if (!completionSoundPlayed) {
            completionSoundPlayed = true
            val tone = ToneGenerator(AudioManager.STREAM_ALARM, 85)
            try {
                tone.startTone(ToneGenerator.TONE_PROP_ACK, 450)
                delay(500)
            } finally {
                tone.release()
            }
        }
    }

    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
        Button(
            onClick = if (running) onPause else if (completed) onRestart else onStart,
            modifier = Modifier.weight(1f)
        ) {
            Text(if (running) "إيقاف مؤقت" else if (completed) "ابدأ من جديد" else "ابدأ")
        }
        OutlinedButton(onClick = onRestart, modifier = Modifier.weight(1f)) { Text("إعادة") }
    }
}

private fun formatCountdown(seconds: Int): String = "%d:%02d".format(seconds / 60, seconds % 60)

private fun activityPrompt(choice: String): String = when (choice) {
    "تنفس" -> "تنفس براحة دون إجبار النفس أو حبسه."
    "تمدد" -> "مدد كتفيك وذراعيك بلطف وبالقدر المريح لك."
    "ماء" -> "خذ وقتك لشرب الماء إذا كان مناسبًا لحالتك وتعليماتك الطبية."
    "صمت" -> "اترك الهاتف للحظة، واسمح للدقيقة أن تمر دون مهمة جديدة."
    "مشي" -> "تحرك قليلًا في مكان آمن وبما يناسب قدرتك."
    else -> "اكتب فكرة واحدة فقط؛ لا تحتاج إلى ترتيب كل شيء الآن."
}

private fun screenRestPrompt(stage: Int): String = when (stage) {
    0 -> "دع الدائرة تضيق مرة واحدة كتذكير لطيف بالرمش، وارمش عدة مرات براحة."
    1 -> "أبعد نظرك عن الشاشة نحو نقطة بعيدة قدر الإمكان."
    2 -> "أرخِ الكتفين وحرك الرقبة بلطف إذا كان ذلك مريحًا."
    3 -> "خذ لحظات أخيرة قبل العودة للشاشة."
    else -> "يمكنك العودة الآن أو تمديد الراحة إذا أردت."
}

@Composable
private fun CalmNowScreen() {
    val context = LocalContext.current
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { ToolHeader("هدوء الآن", "واجهة منخفضة التحفيز للحظة القلق أو الإرهاق.") }
        item { Card { Text("ضع قدميك على الأرض. انظر حولك وسمِّ ثلاثة أشياء تراها وشيئين تسمعهما وشيئًا تلمسه.", Modifier.padding(18.dp)) } }
        item { Card { Text("خفف الضوء والصوت إن استطعت، وأجل القرارات غير العاجلة لبضع دقائق.", Modifier.padding(18.dp)) } }
        item {
            OutlinedButton(onClick = {
                val feature = FeatureCatalog.visible(context).firstOrNull { it.id == "need_you" }
                if (feature != null) FeatureRouter.open(context, feature)
            }) { Text("أحتاج شخصًا معي") }
        }
    }
}

@Composable
private fun MoodToActionScreen() {
    var need by rememberSaveable { mutableStateOf("هدوء") }
    val map = mapOf(
        "هدوء" to "اختر مكانًا أقل ضجيجًا، وأبعد مهمة واحدة غير عاجلة.",
        "ماء" to "اشرب قليلًا إن كان مناسبًا لحالتك وتعليماتك الطبية.",
        "حركة" to "قف وتحرك دقيقة أو مدد كتفيك بلطف.",
        "شخص" to "اختر شخصًا آمنًا واطلب اتصالًا أو وجودًا قصيرًا.",
        "كتابة" to "اكتب ما يزعجك في ثلاث جمل دون محاولة حل كل شيء.",
        "راحة" to "اختر استراحة قصيرة واضحة المدة ثم عد لما يهمك فقط."
    )
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { ToolHeader("ماذا أحتاج الآن؟", "لا نحول الشعور إلى تشخيص؛ نحوله إلى خطوة صغيرة قابلة للتنفيذ.") }
        item { Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { map.keys.take(3).forEach { FilterChip(selected = need == it, onClick = { need = it }, label = { Text(it) }) } } }
        item { Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { map.keys.drop(3).forEach { FilterChip(selected = need == it, onClick = { need = it }, label = { Text(it) }) } } }
        item { Card { Text(map[need].orEmpty(), Modifier.padding(18.dp)) } }
    }
}

@Composable
private fun BeforeLeaveScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var newItem by rememberSaveable { mutableStateOf("") }
    val defaults = listOf("المفاتيح", "الهاتف", "المحفظة", "الماء", "الدواء", "الشاحن")
    val items = remember(version) { LifeUtilityStore.list(context, "before_leave_items").ifEmpty { defaults } }
    var checked by remember(version) { mutableStateOf(emptySet<String>()) }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { ToolHeader("قبل أن أخرج", "قائمة مرنة تحفظ الأشياء التي تهمك أنت بشكل مشفر على الهاتف.") }
        items(items) { item ->
            Card {
                Row(Modifier.fillMaxWidth().padding(14.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(item, Modifier.weight(1f))
                    Checkbox(checked = item in checked, onCheckedChange = { yes -> checked = if (yes) checked + item else checked - item })
                }
            }
        }
        item { OutlinedTextField(newItem, { newItem = it.take(60) }, label = { Text("أضف شيئًا") }, modifier = Modifier.fillMaxWidth()) }
        item {
            Button(onClick = {
                if (newItem.isNotBlank()) {
                    LifeUtilityStore.saveList(context, "before_leave_items", (items + newItem.trim()).distinct())
                    newItem = ""; version++
                }
            }) { Text("إضافة للقائمة") }
        }
    }
}

@Composable
private fun WherePutItScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var thing by rememberSaveable { mutableStateOf("") }
    var place by rememberSaveable { mutableStateOf("") }
    val entries = remember(version) { LifeUtilityStore.objectList(context, "where_put_it") }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { ToolHeader("أين وضعتها؟", "ذاكرة محلية مشفرة للأغراض المهمة.") }
        item { OutlinedTextField(thing, { thing = it.take(80) }, label = { Text("ما الشيء؟") }, modifier = Modifier.fillMaxWidth()) }
        item { OutlinedTextField(place, { place = it.take(160) }, label = { Text("أين وضعته؟") }, modifier = Modifier.fillMaxWidth()) }
        item { Button(onClick = { if (thing.isNotBlank() && place.isNotBlank()) { LifeUtilityStore.saveObjectList(context, "where_put_it", listOf(thing.trim() to place.trim()) + entries.take(49)); thing = ""; place = ""; version++ } }) { Text("حفظ محلي مشفر") } }
        items(entries) { (a, b) -> Card { Column(Modifier.padding(16.dp)) { Text(a, fontWeight = FontWeight.Bold); Text(b) } } }
    }
}

@Composable
private fun QuickCaptureScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var note by rememberSaveable { mutableStateOf("") }
    val entries = remember(version) { LifeUtilityStore.list(context, "quick_capture") }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { ToolHeader("ذاكرتي الصغيرة", "اكتب شيئًا لا تريد نسيانه. يبقى مشفرًا على هذا الهاتف.") }
        item { OutlinedTextField(note, { note = it.take(500) }, label = { Text("ملاحظة سريعة") }, minLines = 3, modifier = Modifier.fillMaxWidth()) }
        item { Button(onClick = { if (note.isNotBlank()) { val stamp = LocalDateTime.now().toString().replace('T', ' ').take(16); LifeUtilityStore.saveList(context, "quick_capture", listOf("$stamp — ${note.trim()}") + entries.take(99)); note = ""; version++ } }) { Text("حفظ مشفر") } }
        items(entries) { Card { Text(it, Modifier.padding(16.dp)) } }
    }
}

@Composable
private fun DailyReviewScreen() {
    val context = LocalContext.current
    var win by rememberSaveable { mutableStateOf(LifeUtilityStore.text(context, "review_win")) }
    var pending by rememberSaveable { mutableStateOf(LifeUtilityStore.text(context, "review_pending")) }
    var tomorrow by rememberSaveable { mutableStateOf(LifeUtilityStore.text(context, "review_tomorrow")) }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { ToolHeader("راجع يومي", "مراجعة قصيرة مشفرة على الهاتف بدل تقرير طويل.") }
        item { OutlinedTextField(win, { win = it.take(500) }, label = { Text("ما الذي نجح اليوم؟") }, modifier = Modifier.fillMaxWidth()) }
        item { OutlinedTextField(pending, { pending = it.take(500) }, label = { Text("ما الذي بقي؟") }, modifier = Modifier.fillMaxWidth()) }
        item { OutlinedTextField(tomorrow, { tomorrow = it.take(300) }, label = { Text("أهم شيء للغد") }, modifier = Modifier.fillMaxWidth()) }
        item { Button(onClick = { LifeUtilityStore.saveText(context, "review_win", win); LifeUtilityStore.saveText(context, "review_pending", pending); LifeUtilityStore.saveText(context, "review_tomorrow", tomorrow) }) { Text("حفظ المراجعة مشفرة") } }
    }
}

@Composable
private fun GentleFocusScreen() {
    var minutes by rememberSaveable { mutableIntStateOf(15) }
    var secondsLeft by rememberSaveable { mutableIntStateOf(15 * 60) }
    var running by rememberSaveable { mutableStateOf(false) }
    val completed = secondsLeft == 0

    LaunchedEffect(running, secondsLeft) {
        if (running && secondsLeft > 0) {
            delay(1000)
            secondsLeft -= 1
            if (secondsLeft == 0) running = false
        }
    }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { ToolHeader("تركيز لطيف", "جلسة تركيز فعلية قصيرة مع عدّ تنازلي وتنبيه صوتي عند النهاية.") }
        item {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(10, 15, 25).forEach { value ->
                    FilterChip(
                        selected = minutes == value,
                        onClick = { minutes = value; secondsLeft = value * 60; running = false },
                        enabled = !running,
                        label = { Text("$value د") }
                    )
                }
            }
        }
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    Modifier.fillMaxWidth().padding(18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(if (completed) "اكتملت جلسة التركيز" else "ركز على شيء واحد فقط", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                    Text(formatCountdown(secondsLeft), style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                    Text("بعد النهاية: انظر بعيدًا، تحرك قليلًا، ثم قرر إن كنت تحتاج جلسة أخرى.", color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
                }
            }
        }
        item {
            TimerControls(
                running = running,
                completed = completed,
                onStart = { running = true },
                onPause = { running = false },
                onRestart = { secondsLeft = minutes * 60; running = true }
            )
        }
    }
}

@Composable
private fun NeedYouScreen() {
    val context = LocalContext.current
    var message by rememberSaveable { mutableStateOf("أحتاجك الآن. لا أحتاج حلًا، فقط اتصل بي أو ابقَ معي قليلًا.") }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { ToolHeader("أحتاجك", "رسالة يراجعها المستخدم قبل الإرسال؛ لا يوجد إرسال تلقائي.") }
        item { OutlinedTextField(message, { message = it.take(500) }, label = { Text("الرسالة") }, minLines = 4, modifier = Modifier.fillMaxWidth()) }
        item {
            Button(onClick = {
                val intent = Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, message) }
                context.startActivity(Intent.createChooser(intent, "اختر شخصًا أو تطبيقًا"))
            }) { Text("اختيار شخص أو تطبيق للإرسال") }
        }
    }
}
