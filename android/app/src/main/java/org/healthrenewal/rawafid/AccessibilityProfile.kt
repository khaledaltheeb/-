package org.healthrenewal.rawafid

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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

data class AppPersonalization(
    val themeMode: String = "system",
    val palette: String = "rawafid",
    val backgroundTone: String = "soft",
    val textTone: String = "standard"
)

object AppPersonalizationStore {
    private const val PREFS = "rawafid_app_personalization_v1"
    private val revision = mutableIntStateOf(0)

    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun load(context: Context) = AppPersonalization(
        themeMode = prefs(context).getString("theme_mode", "system") ?: "system",
        palette = prefs(context).getString("palette", "rawafid") ?: "rawafid",
        backgroundTone = prefs(context).getString("background_tone", "soft") ?: "soft",
        textTone = prefs(context).getString("text_tone", "standard") ?: "standard"
    )

    fun save(context: Context, value: AppPersonalization) {
        prefs(context).edit()
            .putString("theme_mode", value.themeMode)
            .putString("palette", value.palette)
            .putString("background_tone", value.backgroundTone)
            .putString("text_tone", value.textTone)
            .apply()
        revision.intValue += 1
    }

    @Composable
    fun observe(context: Context): AppPersonalization {
        revision.intValue
        return load(context)
    }
}

class AccessibilityProfileActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { SettingsAndAccessibilityScreen() }
                }
            }
        }
    }
}

@Composable
private fun SettingsAndAccessibilityScreen() {
    val context = androidx.compose.ui.platform.LocalContext.current
    var profile by remember { mutableStateOf(AccessibilityProfileStore.load(context)) }
    var appearance by remember { mutableStateOf(AppPersonalizationStore.load(context)) }

    fun saveProfile(next: AccessibilityProfile) {
        profile = next
        AccessibilityProfileStore.save(context, next)
    }

    fun saveAppearance(next: AppPersonalization) {
        appearance = next
        AppPersonalizationStore.save(context, next)
    }

    LazyColumn(
        contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("الإعدادات والوصولية", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text(
                    "خصص مظهر روافد وطريقة التنبيه والوصولية. تبقى هذه التفضيلات على هذا الهاتف.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        item {
            SettingsSection("المظهر") {
                Text("الوضع", fontWeight = FontWeight.SemiBold)
                PreferenceChips(
                    options = listOf("system" to "حسب الهاتف", "light" to "نهاري", "dark" to "ليلي"),
                    selected = appearance.themeMode,
                    onSelect = { saveAppearance(appearance.copy(themeMode = it)) }
                )

                Text("اللون الرئيسي", fontWeight = FontWeight.SemiBold)
                PreferenceChips(
                    options = listOf(
                        "rawafid" to "روافد",
                        "ocean" to "أزرق هادئ",
                        "sage" to "أخضر طبيعي",
                        "rose" to "وردي هادئ"
                    ),
                    selected = appearance.palette,
                    onSelect = { saveAppearance(appearance.copy(palette = it)) }
                )

                Text("الخلفية", fontWeight = FontWeight.SemiBold)
                PreferenceChips(
                    options = listOf("soft" to "ناعمة", "pure" to "نقية", "warm" to "دافئة"),
                    selected = appearance.backgroundTone,
                    onSelect = { saveAppearance(appearance.copy(backgroundTone = it)) }
                )

                Text("لون النص", fontWeight = FontWeight.SemiBold)
                PreferenceChips(
                    options = listOf("standard" to "متوازن", "strong" to "داكن قوي", "soft" to "أهدأ"),
                    selected = appearance.textTone,
                    onSelect = { saveAppearance(appearance.copy(textTone = it)) }
                )

                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(RawafidSpacing.Md), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text("معاينة", style = MaterialTheme.typography.titleMedium)
                        Text("هذا مثال لشكل النص والخلفية بعد اختيارك.")
                        Text(
                            "الألوان المتاحة مقيدة بمجموعات مقروءة بدل السماح بتركيبات قد تجعل النص غير واضح.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }

        item {
            SettingsSection("الإشعارات والنغمة") {
                Text(
                    "Android يتحكم بصوت كل قناة إشعار بعد إنشائها. افتح القناة المطلوبة واختر النغمة والاهتزاز والظهور على الشاشة من إعدادات الهاتف.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                FilledTonalButton(
                    onClick = { openNotificationSettings(context, null) },
                    modifier = Modifier.fillMaxWidth()
                ) { Text("كل إعدادات إشعارات روافد") }
                NotificationChannelButton(context, "راحة العين والرمش", NotificationChannels.EYE)
                NotificationChannelButton(context, "العناية اليومية والماء والحركة", NotificationChannels.DAILY)
                NotificationChannelButton(context, "الرسائل الداعمة", NotificationChannels.MOTIVATION)
                NotificationChannelButton(context, "مواعيد العلاج", NotificationChannels.TREATMENT)
            }
        }

        item {
            SettingsSection("حجم النص") {
                Text("${(profile.textScale * 100).toInt()}%", style = MaterialTheme.typography.titleMedium)
                Slider(
                    value = profile.textScale,
                    onValueChange = { saveProfile(profile.copy(textScale = it)) },
                    valueRange = 0.9f..1.6f,
                    steps = 6
                )
                PreferenceChips(
                    options = listOf("100" to "عادي", "120" to "كبير", "140" to "أكبر"),
                    selected = when {
                        kotlin.math.abs(profile.textScale - 1.4f) < 0.06f -> "140"
                        kotlin.math.abs(profile.textScale - 1.2f) < 0.06f -> "120"
                        else -> "100"
                    },
                    onSelect = {
                        val scale = when (it) { "120" -> 1.2f; "140" -> 1.4f; else -> 1f }
                        saveProfile(profile.copy(textScale = scale))
                    }
                )
            }
        }

        item { AccessibilityToggle("تباين مرتفع", "ألوان أوضح وحدود أقوى عند الحاجة.", profile.highContrast) { saveProfile(profile.copy(highContrast = it)) } }
        item { AccessibilityToggle("تقليل الحركة", "يوقف أو يختصر الحركات البصرية غير الضرورية، بما فيها مؤشرات الأدوات التفاعلية.", profile.reduceMotion) { saveProfile(profile.copy(reduceMotion = it)) } }
        item { AccessibilityToggle("أهداف لمس أكبر", "يزيد الحد الأدنى لمساحة لمس الأزرار والعناصر التفاعلية.", profile.largeTargets) { saveProfile(profile.copy(largeTargets = it)) } }
        item { AccessibilityToggle("الوضع الإدراكي", "أولوية للخطوات القصيرة وتقليل كثافة المعلومات في الشاشات التي تدعمه.", profile.cognitiveMode) { saveProfile(profile.copy(cognitiveMode = it)) } }
        item { AccessibilityToggle("تقليل المحفزات", "يقلل العناصر الثانوية والزحام البصري حيث تدعم الشاشة ذلك.", profile.lowStimulation) { saveProfile(profile.copy(lowStimulation = it)) } }
        item { AccessibilityToggle("أفضل القراءة الصوتية", "يسجل تفضيل Text-to-Speech لتستخدمه الأدوات والمحتوى الذي يدعمه.", profile.textToSpeechPreferred) { saveProfile(profile.copy(textToSpeechPreferred = it)) } }
        item { AccessibilityToggle("أفضل لغة أبسط", "يسجل تفضيل الشرح المباشر والمختصر دون تغيير الدقة.", profile.simpleLanguagePreferred) { saveProfile(profile.copy(simpleLanguagePreferred = it)) } }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                    Text("الخصوصية", fontWeight = FontWeight.Bold)
                    Text(
                        "إعدادات المظهر والوصولية محلية، ولا ترسل نوع إعاقة أو تفضيلات شخصية إلى الخادم.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun SettingsSection(title: String, content: @Composable Column.() -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(RawafidSpacing.CardContent),
            verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
        ) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            content()
        }
    }
}

@Composable
private fun PreferenceChips(
    options: List<Pair<String, String>>,
    selected: String,
    onSelect: (String) -> Unit
) {
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
    ) {
        options.forEach { (id, label) ->
            FilterChip(
                selected = selected == id,
                onClick = { onSelect(id) },
                label = { Text(label) }
            )
        }
    }
}

@Composable
private fun NotificationChannelButton(context: Context, label: String, channelId: String) {
    FilledTonalButton(
        onClick = { openNotificationSettings(context, channelId) },
        modifier = Modifier.fillMaxWidth()
    ) { Text("نغمة $label") }
}

private fun openNotificationSettings(context: Context, channelId: String?) {
    NotificationChannels.create(context)
    val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && channelId != null) {
        Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS).apply {
            putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
            putExtra(Settings.EXTRA_CHANNEL_ID, channelId)
        }
    } else {
        Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
            putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
        }
    }
    runCatching { context.startActivity(intent) }
}

@Composable
private fun AccessibilityToggle(title: String, description: String, checked: Boolean, changed: (Boolean) -> Unit) {
    Card {
        Row(Modifier.fillMaxWidth().padding(RawafidSpacing.Md), horizontalArrangement = Arrangement.SpaceBetween) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xxs)) {
                Text(title, fontWeight = FontWeight.Bold)
                Text(description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Switch(checked = checked, onCheckedChange = changed)
        }
    }
}
