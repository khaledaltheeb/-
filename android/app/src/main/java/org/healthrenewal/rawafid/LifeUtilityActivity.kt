package org.healthrenewal.rawafid

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import java.time.LocalDateTime

object LifeUtilityStore {
    private const val PREFS = "rawafid_life_utilities_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun text(context: Context, key: String): String = prefs(context).getString(key, "") ?: ""
    fun saveText(context: Context, key: String, value: String) = prefs(context).edit().putString(key, value).apply()

    fun list(context: Context, key: String): List<String> {
        val raw = prefs(context).getString(key, "[]") ?: "[]"
        return runCatching {
            val array = JSONArray(raw)
            buildList { for (i in 0 until array.length()) add(array.optString(i)) }
        }.getOrDefault(emptyList())
    }

    fun saveList(context: Context, key: String, values: List<String>) {
        val array = JSONArray(); values.forEach(array::put)
        prefs(context).edit().putString(key, array.toString()).apply()
    }

    fun objectList(context: Context, key: String): List<Pair<String, String>> {
        val raw = prefs(context).getString(key, "[]") ?: "[]"
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
        prefs(context).edit().putString(key, array.toString()).apply()
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
        "screen_rest" -> SimpleSteps(
            "راحة الشاشة",
            "دقيقة قصيرة لتخفيف إجهاد الشاشة.",
            listOf("ارمش ببطء عدة مرات.", "انظر إلى نقطة بعيدة 20–30 ثانية.", "حرّك الرقبة والكتفين بلطف.", "غيّر وضعية الجلوس إذا بقيت ثابتًا طويلًا.")
        )
        "one_minute" -> OneMinuteScreen()
        "calm_now" -> CalmNowScreen()
        "mood_to_action" -> MoodToActionScreen()
        "before_leave" -> BeforeLeaveScreen()
        "where_put_it" -> WherePutItScreen()
        "quick_capture" -> QuickCaptureScreen()
        "daily_review" -> DailyReviewScreen()
        "gentle_focus" -> GentleFocusScreen()
        "need_you" -> NeedYouScreen()
        "breathing" -> SimpleSteps(
            "تنفس دقيقة",
            "تنفس بهدوء دون حبس النفس أو إجبار الجسد.",
            listOf("خذ شهيقًا مريحًا.", "ازفر ببطء أطول قليلًا من الشهيق.", "كرر لدقيقة إذا كان ذلك مريحًا.", "توقف إذا شعرت بدوار أو عدم ارتياح.")
        )
        else -> SimpleSteps("أداة روافد", "هذه الأداة قابلة للتوسعة من الكتالوج المركزي.", listOf("لا يوجد إعداد إضافي لهذه الأداة بعد."))
    }
}

@Composable
private fun SimpleSteps(title: String, subtitle: String, steps: List<String>) {
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { ToolHeader(title, subtitle) }
        items(steps) { step -> Card { Text(step, Modifier.padding(18.dp)) } }
    }
}

@Composable
private fun ToolHeader(title: String, subtitle: String) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun OneMinuteScreen() {
    var choice by rememberSaveable { mutableStateOf("تنفس") }
    val choices = listOf("تنفس", "تمدد", "ماء", "صمت", "مشي", "كتابة")
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { ToolHeader("دقيقة لي", "اختر شيئًا صغيرًا يمكن فعله الآن بدل انتظار وقت مثالي.") }
        item { Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { choices.take(3).forEach { FilterChip(selected = choice == it, onClick = { choice = it }, label = { Text(it) }) } } }
        item { Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { choices.drop(3).forEach { FilterChip(selected = choice == it, onClick = { choice = it }, label = { Text(it) }) } } }
        item { Card { Text("اختيارك الآن: $choice. امنح نفسك دقيقة واحدة فقط لهذا الشيء، ثم قرر إن كنت تريد الاستمرار.", Modifier.padding(18.dp)) } }
    }
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
        item { ToolHeader("قبل أن أخرج", "قائمة مرنة تحفظ الأشياء التي تهمك أنت.") }
        items(items) { item ->
            Card {
                Row(Modifier.fillMaxWidth().padding(14.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(item, Modifier.weight(1f))
                    Checkbox(checked = item in checked, onCheckedChange = { yes -> checked = if (yes) checked + item else checked - item })
                }
            }
        }
        item {
            OutlinedTextField(newItem, { newItem = it.take(60) }, label = { Text("أضف شيئًا") }, modifier = Modifier.fillMaxWidth())
        }
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
        item { ToolHeader("أين وضعتها؟", "ذاكرة محلية سريعة للأغراض المهمة.") }
        item { OutlinedTextField(thing, { thing = it.take(80) }, label = { Text("ما الشيء؟") }, modifier = Modifier.fillMaxWidth()) }
        item { OutlinedTextField(place, { place = it.take(160) }, label = { Text("أين وضعته؟") }, modifier = Modifier.fillMaxWidth()) }
        item { Button(onClick = { if (thing.isNotBlank() && place.isNotBlank()) { LifeUtilityStore.saveObjectList(context, "where_put_it", listOf(thing.trim() to place.trim()) + entries.take(49)); thing = ""; place = ""; version++ } }) { Text("حفظ محلي") } }
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
        item { ToolHeader("ذاكرتي الصغيرة", "اكتب شيئًا لا تريد نسيانه. يبقى على هذا الهاتف.") }
        item { OutlinedTextField(note, { note = it.take(500) }, label = { Text("ملاحظة سريعة") }, minLines = 3, modifier = Modifier.fillMaxWidth()) }
        item { Button(onClick = { if (note.isNotBlank()) { val stamp = LocalDateTime.now().toString().replace('T', ' ').take(16); LifeUtilityStore.saveList(context, "quick_capture", listOf("$stamp — ${note.trim()}") + entries.take(99)); note = ""; version++ } }) { Text("حفظ") } }
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
        item { ToolHeader("راجع يومي", "مراجعة قصيرة بدل تقرير طويل.") }
        item { OutlinedTextField(win, { win = it.take(500) }, label = { Text("ما الذي نجح اليوم؟") }, modifier = Modifier.fillMaxWidth()) }
        item { OutlinedTextField(pending, { pending = it.take(500) }, label = { Text("ما الذي بقي؟") }, modifier = Modifier.fillMaxWidth()) }
        item { OutlinedTextField(tomorrow, { tomorrow = it.take(300) }, label = { Text("أهم شيء للغد") }, modifier = Modifier.fillMaxWidth()) }
        item { Button(onClick = { LifeUtilityStore.saveText(context, "review_win", win); LifeUtilityStore.saveText(context, "review_pending", pending); LifeUtilityStore.saveText(context, "review_tomorrow", tomorrow) }) { Text("حفظ المراجعة محليًا") } }
    }
}

@Composable
private fun GentleFocusScreen() {
    var minutes by rememberSaveable { mutableIntStateOf(15) }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { ToolHeader("تركيز لطيف", "اختر جلسة قصيرة ثم خذ فاصل عين وحركة.") }
        item { Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { listOf(10, 15, 25).forEach { value -> FilterChip(selected = minutes == value, onClick = { minutes = value }, label = { Text("$value د") }) } } }
        item { Card { Text("ركز $minutes دقيقة على شيء واحد فقط. بعدها: انظر بعيدًا، تحرك قليلًا، ثم قرر إن كنت تحتاج جلسة أخرى.", Modifier.padding(18.dp)) } }
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
