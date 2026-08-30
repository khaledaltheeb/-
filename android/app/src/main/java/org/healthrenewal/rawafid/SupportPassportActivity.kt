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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import org.json.JSONArray
import org.json.JSONObject

enum class SupportNeed(val id: String, val labelAr: String, val helperAr: String) {
    SHORT_INSTRUCTIONS("short_instructions", "تعليمات قصيرة وواضحة", "قسّم المطلوب إلى خطوات قليلة ومباشرة."),
    EXTRA_RESPONSE_TIME("extra_response_time", "أحتاج وقتًا أطول للإجابة", "لا تستعجل الرد واترك وقتًا لمعالجة السؤال."),
    TEXT_PREFERRED("text_preferred", "أفضل التواصل النصي", "استخدم الكتابة متى كان ذلك ممكنًا."),
    NO_UNANNOUNCED_TOUCH("no_unannounced_touch", "لا تلمسني دون تنبيه", "أخبرني قبل أي لمس أو مساعدة جسدية."),
    LOW_NOISE("low_noise", "أحتاج بيئة أقل ضوضاء", "خفّض الأصوات والمحفزات قدر الإمكان."),
    SIGN_LANGUAGE("sign_language", "أستخدم لغة الإشارة", "وفّر مترجم لغة إشارة إذا احتجت إلى تواصل مفصل."),
    COMPANION("companion", "قد أحتاج مرافقًا", "اسمح بوجود شخص موثوق عندما يكون ذلك مناسبًا."),
    READING_SUPPORT("reading_support", "أواجه صعوبة في القراءة", "استخدم لغة أبسط ونصًا أقصر واقرأه لي عند الحاجة."),
    EYE_CONTACT_OPTIONAL("eye_contact_optional", "قد لا أنظر مباشرة إلى العين", "عدم التواصل البصري لا يعني عدم الانتباه."),
    LARGE_TEXT("large_text", "أحتاج نصًا كبيرًا وواضحًا", "استخدم خطًا أكبر وتباينًا جيدًا."),
    HEARING_SUPPORT("hearing_support", "لدي احتياج سمعي", "واجهني أثناء الكلام واستخدم النص أو الإشارات المرئية عند الحاجة."),
    MOBILITY_SUPPORT("mobility_support", "لدي احتياج حركي", "اسأل قبل المساعدة واحترم طريقتي وأدواتي في الحركة."),
    COGNITIVE_SUPPORT("cognitive_support", "أحتاج تبسيطًا إدراكيًا", "قدّم معلومة واحدة في كل مرة وتجنب الازدحام."),
    SENSORY_SUPPORT("sensory_support", "لدي حساسية حسية", "اسأل عن الضوء والصوت واللمس والمحفزات التي تزعجني."),
    SAFE_PERSON("safe_person", "قد أحتاج شخصًا موثوقًا", "إذا طلبت ذلك ساعدني في التواصل مع الشخص الذي أحدده.")
}

data class SupportPassportProfile(
    val displayName: String = "",
    val preferredLanguage: String = "العربية",
    val preferredContactMethod: String = "",
    val enabledNeeds: Set<SupportNeed> = emptySet(),
    val sharedNeeds: Set<SupportNeed> = emptySet(),
    val customNotes: String = "",
    val shareDisplayName: Boolean = false,
    val shareLanguage: Boolean = true,
    val shareContactMethod: Boolean = true,
    val shareCustomNotes: Boolean = false,
    val updatedAtEpochMs: Long = 0L
)

object SupportPassportStore {
    private const val PREFS = "rawafid_support_passport_v1"
    private const val PROFILE_JSON = "profile_json"

    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun load(context: Context): SupportPassportProfile {
        val raw = prefs(context).getString(PROFILE_JSON, null) ?: return SupportPassportProfile()
        return runCatching { decode(JSONObject(raw)) }.getOrElse { SupportPassportProfile() }
    }

    fun save(context: Context, profile: SupportPassportProfile) {
        val normalized = profile.copy(
            sharedNeeds = profile.sharedNeeds.intersect(profile.enabledNeeds),
            updatedAtEpochMs = System.currentTimeMillis()
        )
        prefs(context).edit().putString(PROFILE_JSON, encode(normalized).toString()).apply()
    }

    fun clear(context: Context) {
        prefs(context).edit().remove(PROFILE_JSON).apply()
    }

    fun buildShareText(profile: SupportPassportProfile): String {
        val lines = mutableListOf("جواز احتياجاتي — روافد")
        if (profile.shareDisplayName && profile.displayName.isNotBlank()) lines += "الاسم الذي أفضله: ${profile.displayName.trim()}"
        if (profile.shareLanguage && profile.preferredLanguage.isNotBlank()) lines += "لغة التواصل: ${profile.preferredLanguage.trim()}"
        if (profile.shareContactMethod && profile.preferredContactMethod.isNotBlank()) lines += "طريقة التواصل المفضلة: ${profile.preferredContactMethod.trim()}"

        val visibleNeeds = SupportNeed.entries.filter { it in profile.enabledNeeds && it in profile.sharedNeeds }
        if (visibleNeeds.isNotEmpty()) {
            lines += ""
            lines += "ما يساعدني:"
            visibleNeeds.forEach { need -> lines += "• ${need.labelAr} — ${need.helperAr}" }
        }
        if (profile.shareCustomNotes && profile.customNotes.isNotBlank()) {
            lines += ""
            lines += "ملاحظة أريد مشاركتها: ${profile.customNotes.trim()}"
        }
        lines += ""
        lines += "هذه البطاقة للتواصل والدعم وليست إثباتًا لتشخيص أو سجلًا طبيًا."
        return lines.joinToString("\n")
    }

    private fun encode(profile: SupportPassportProfile): JSONObject = JSONObject()
        .put("display_name", profile.displayName)
        .put("preferred_language", profile.preferredLanguage)
        .put("preferred_contact_method", profile.preferredContactMethod)
        .put("enabled_needs", JSONArray(profile.enabledNeeds.map { it.id }))
        .put("shared_needs", JSONArray(profile.sharedNeeds.map { it.id }))
        .put("custom_notes", profile.customNotes)
        .put("share_display_name", profile.shareDisplayName)
        .put("share_language", profile.shareLanguage)
        .put("share_contact_method", profile.shareContactMethod)
        .put("share_custom_notes", profile.shareCustomNotes)
        .put("updated_at", profile.updatedAtEpochMs)

    private fun decode(json: JSONObject): SupportPassportProfile {
        fun needSet(key: String): Set<SupportNeed> {
            val array = json.optJSONArray(key) ?: JSONArray()
            val ids = buildSet {
                for (index in 0 until array.length()) add(array.optString(index))
            }
            return SupportNeed.entries.filterTo(mutableSetOf()) { it.id in ids }
        }
        val enabled = needSet("enabled_needs")
        return SupportPassportProfile(
            displayName = json.optString("display_name"),
            preferredLanguage = json.optString("preferred_language", "العربية"),
            preferredContactMethod = json.optString("preferred_contact_method"),
            enabledNeeds = enabled,
            sharedNeeds = needSet("shared_needs").intersect(enabled),
            customNotes = json.optString("custom_notes"),
            shareDisplayName = json.optBoolean("share_display_name", false),
            shareLanguage = json.optBoolean("share_language", true),
            shareContactMethod = json.optBoolean("share_contact_method", true),
            shareCustomNotes = json.optBoolean("share_custom_notes", false),
            updatedAtEpochMs = json.optLong("updated_at", 0L)
        )
    }
}

class SupportPassportActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { SupportPassportScreen() }
                }
            }
        }
    }
}

@Composable
private fun SupportPassportScreen() {
    val context = LocalContext.current
    var profile by remember { mutableStateOf(SupportPassportStore.load(context)) }
    var saved by remember { mutableStateOf(false) }
    var confirmClear by remember { mutableStateOf(false) }

    fun update(next: SupportPassportProfile) {
        profile = next
        saved = false
    }

    val preview = remember(profile) { SupportPassportStore.buildShareText(profile) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("جواز احتياجاتي", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text("اختر كيف تفضّل أن يتعامل معك الآخرون. البيانات تبقى على الهاتف، ولا يخرج منها شيء إلا عند ضغطك على «مشاركة».")
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("معلومات التواصل", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(
                        value = profile.displayName,
                        onValueChange = { update(profile.copy(displayName = it.take(80))) },
                        label = { Text("الاسم الذي تفضله — اختياري") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    ShareToggle("مشاركة الاسم", profile.shareDisplayName) { update(profile.copy(shareDisplayName = it)) }
                    OutlinedTextField(
                        value = profile.preferredLanguage,
                        onValueChange = { update(profile.copy(preferredLanguage = it.take(60))) },
                        label = { Text("لغة التواصل") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    ShareToggle("مشاركة لغة التواصل", profile.shareLanguage) { update(profile.copy(shareLanguage = it)) }
                    OutlinedTextField(
                        value = profile.preferredContactMethod,
                        onValueChange = { update(profile.copy(preferredContactMethod = it.take(120))) },
                        label = { Text("طريقة التواصل المفضلة — مثال: كتابة، كلام بطيء") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    ShareToggle("مشاركة طريقة التواصل", profile.shareContactMethod) { update(profile.copy(shareContactMethod = it)) }
                }
            }
        }

        item {
            Text("احتياجاتي", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text("فعّل ما ينطبق عليك. خيار «يظهر عند المشاركة» مستقل لكل بند.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        SupportNeed.entries.forEach { need ->
            item(key = need.id) {
                val enabled = need in profile.enabledNeeds
                val shared = need in profile.sharedNeeds
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Column(Modifier.weight(1f)) {
                                Text(need.labelAr, fontWeight = FontWeight.Bold)
                                Text(need.helperAr, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Switch(
                                checked = enabled,
                                onCheckedChange = { checked ->
                                    val enabledNext = if (checked) profile.enabledNeeds + need else profile.enabledNeeds - need
                                    val sharedNext = if (checked) profile.sharedNeeds else profile.sharedNeeds - need
                                    update(profile.copy(enabledNeeds = enabledNext, sharedNeeds = sharedNext))
                                }
                            )
                        }
                        if (enabled) {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("يظهر عند المشاركة")
                                Checkbox(
                                    checked = shared,
                                    onCheckedChange = { checked ->
                                        update(profile.copy(sharedNeeds = if (checked) profile.sharedNeeds + need else profile.sharedNeeds - need))
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("ملاحظة شخصية", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(
                        value = profile.customNotes,
                        onValueChange = { update(profile.copy(customNotes = it.take(800))) },
                        label = { Text("شيء آخر تريد أن يعرفه من يساعدك") },
                        minLines = 4,
                        modifier = Modifier.fillMaxWidth()
                    )
                    ShareToggle("مشاركة هذه الملاحظة", profile.shareCustomNotes) { update(profile.copy(shareCustomNotes = it)) }
                }
            }
        }

        item {
            Button(
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    SupportPassportStore.save(context, profile)
                    profile = SupportPassportStore.load(context)
                    saved = true
                }
            ) { Text(if (saved) "تم الحفظ محليًا" else "حفظ على هذا الهاتف") }
        }

        item { HorizontalDivider() }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("معاينة ما ستشاركه", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(preview)
                    OutlinedButton(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            val intent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, preview)
                            }
                            context.startActivity(Intent.createChooser(intent, "مشاركة جواز احتياجاتي"))
                        }
                    ) { Text("مشاركة النسخة الظاهرة فقط") }
                }
            }
        }

        item {
            TextButton(onClick = { confirmClear = true }) { Text("حذف جواز الاحتياجات من هذا الهاتف") }
        }
    }

    if (confirmClear) {
        AlertDialog(
            onDismissRequest = { confirmClear = false },
            title = { Text("حذف البيانات المحلية؟") },
            text = { Text("سيُحذف جواز احتياجاتك من هذا الهاتف. لا يوجد خادم لاستعادته من هذه النسخة.") },
            confirmButton = {
                TextButton(onClick = {
                    SupportPassportStore.clear(context)
                    profile = SupportPassportProfile()
                    saved = false
                    confirmClear = false
                }) { Text("حذف") }
            },
            dismissButton = { TextButton(onClick = { confirmClear = false }) { Text("إلغاء") } }
        )
    }
}

@Composable
private fun ShareToggle(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label)
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}
