package org.healthrenewal.rawafid

import android.content.Context
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
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp

data class AccessibilityProfile(
    val textScale: Float = 1f,
    val highContrast: Boolean = false,
    val reduceMotion: Boolean = false,
    val largeTargets: Boolean = false,
    val cognitiveMode: Boolean = false,
    val lowStimulation: Boolean = false,
    val textToSpeechPreferred: Boolean = false,
    val simpleLanguagePreferred: Boolean = false
)

object AccessibilityProfileStore {
    private const val PREFS = "rawafid_accessibility_profile_v1"
    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun load(context: Context) = AccessibilityProfile(
        textScale = prefs(context).getFloat("text_scale", 1f).coerceIn(0.9f, 1.6f),
        highContrast = prefs(context).getBoolean("high_contrast", false),
        reduceMotion = prefs(context).getBoolean("reduce_motion", false),
        largeTargets = prefs(context).getBoolean("large_targets", false),
        cognitiveMode = prefs(context).getBoolean("cognitive_mode", false),
        lowStimulation = prefs(context).getBoolean("low_stimulation", false),
        textToSpeechPreferred = prefs(context).getBoolean("tts", false),
        simpleLanguagePreferred = prefs(context).getBoolean("simple_language", false)
    )

    fun save(context: Context, profile: AccessibilityProfile) {
        prefs(context).edit()
            .putFloat("text_scale", profile.textScale.coerceIn(0.9f, 1.6f))
            .putBoolean("high_contrast", profile.highContrast)
            .putBoolean("reduce_motion", profile.reduceMotion)
            .putBoolean("large_targets", profile.largeTargets)
            .putBoolean("cognitive_mode", profile.cognitiveMode)
            .putBoolean("low_stimulation", profile.lowStimulation)
            .putBoolean("tts", profile.textToSpeechPreferred)
            .putBoolean("simple_language", profile.simpleLanguagePreferred)
            .apply()
    }
}

class AccessibilityProfileActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { AccessibilityProfileScreen() }
                }
            }
        }
    }
}

@Composable
private fun AccessibilityProfileScreen() {
    val context = androidx.compose.ui.platform.LocalContext.current
    var profile by remember { mutableStateOf(AccessibilityProfileStore.load(context)) }

    fun save(next: AccessibilityProfile) {
        profile = next
        AccessibilityProfileStore.save(context, next)
    }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("ملف الوصولية", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("اضبط التطبيق مرة واحدة. الشاشات الجديدة ترث هذه التفضيلات بدل ضبط كل أداة منفردة.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("حجم النص", fontWeight = FontWeight.Bold)
                    Text("${(profile.textScale * 100).toInt()}%")
                    Slider(
                        value = profile.textScale,
                        onValueChange = { save(profile.copy(textScale = it)) },
                        valueRange = 0.9f..1.6f,
                        steps = 6
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(1f to "عادي", 1.2f to "كبير", 1.4f to "أكبر").forEach { (scale, label) ->
                            FilterChip(selected = kotlin.math.abs(profile.textScale - scale) < 0.06f, onClick = { save(profile.copy(textScale = scale)) }, label = { Text(label) })
                        }
                    }
                    Text("يطبّق الحجم على Typography العامة بعد إعادة فتح الشاشة، وليس على صفحة واحدة فقط.", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        item { AccessibilityToggle("تباين مرتفع", "ألوان أوضح وحدود أقوى عند الحاجة.", profile.highContrast) { save(profile.copy(highContrast = it)) } }
        item { AccessibilityToggle("تقليل الحركة", "إشارة مركزية للشاشات لتجنب الحركات غير الضرورية.", profile.reduceMotion) { save(profile.copy(reduceMotion = it)) } }
        item { AccessibilityToggle("أهداف لمس أكبر", "تفضيل أزرار ومساحات لمس أكبر في الواجهات المتكيفة.", profile.largeTargets) { save(profile.copy(largeTargets = it)) } }
        item { AccessibilityToggle("الوضع الإدراكي", "أولوية للخطوات القصيرة، خيار واحد في كل مرة، وتقليل كثافة المعلومات.", profile.cognitiveMode) { save(profile.copy(cognitiveMode = it)) } }
        item { AccessibilityToggle("تقليل المحفزات", "تقليل العناصر الثانوية والحركة والزحام البصري حيث تدعم الشاشة ذلك.", profile.lowStimulation) { save(profile.copy(lowStimulation = it)) } }
        item { AccessibilityToggle("أفضل القراءة الصوتية", "يسجل تفضيل Text-to-Speech لتستخدمه المقالات والأدوات التي تدعم القراءة.", profile.textToSpeechPreferred) { save(profile.copy(textToSpeechPreferred = it)) } }
        item { AccessibilityToggle("أفضل لغة أبسط", "يسجل تفضيل الشرح المباشر والمختصر دون تغيير الدقة.", profile.simpleLanguagePreferred) { save(profile.copy(simpleLanguagePreferred = it)) } }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("ملاحظة", fontWeight = FontWeight.Bold)
                    Text("ملف الوصولية لا يرسل تشخيصًا أو نوع إعاقة إلى الخادم. هو تفضيلات استخدام محلية.")
                }
            }
        }
    }
}

@Composable
private fun AccessibilityToggle(title: String, description: String, checked: Boolean, changed: (Boolean) -> Unit) {
    Card {
        Row(Modifier.fillMaxWidth().padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(title, fontWeight = FontWeight.Bold)
                Text(description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Switch(checked = checked, onCheckedChange = changed)
        }
    }
}
