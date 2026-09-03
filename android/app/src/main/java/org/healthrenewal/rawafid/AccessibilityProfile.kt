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
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection

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
    var savedProfile by remember { mutableStateOf(AccessibilityProfileStore.load(context)) }
    var savedAppearance by remember { mutableStateOf(AppPersonalizationStore.load(context)) }
    var draftProfile by remember { mutableStateOf(savedProfile) }
    var draftAppearance by remember { mutableStateOf(savedAppearance) }
    var showConfirm by remember { mutableStateOf(false) }
    var savedMessage by remember { mutableStateOf("") }

    val dirty = draftProfile != savedProfile || draftAppearance != savedAppearance

    LazyColumn(
        contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("الإعدادات والوصولية", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("جرّب التغييرات في المعاينة أولًا. لن تصبح إعدادات دائمة حتى تضغط «حفظ الإعدادات» وتؤكد.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }

        item {
            SettingsSection("معاينة مباشرة — غير محفوظة") {
                SettingsPreview(draftAppearance, draftProfile)
                Text(
                    if (dirty) "لديك تغييرات غير محفوظة." else "المعاينة تطابق الإعدادات المحفوظة.",
                    color = if (dirty) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        item {
            SettingsSection("المظهر") {
                Text("الوضع", fontWeight = FontWeight.SemiBold)
                PreferenceChips(listOf("system" to "حسب الهاتف", "light" to "نهاري", "dark" to "ليلي"), draftAppearance.themeMode) {
                    draftAppearance = draftAppearance.copy(themeMode = it); savedMessage = ""
                }
                Text("اللون الرئيسي", fontWeight = FontWeight.SemiBold)
                PreferenceChips(listOf("rawafid" to "روافد", "ocean" to "أزرق هادئ", "sage" to "أخضر طبيعي", "rose" to "وردي هادئ"), draftAppearance.palette) {
                    draftAppearance = draftAppearance.copy(palette = it); savedMessage = ""
                }
                Text("الخلفية", fontWeight = FontWeight.SemiBold)
                PreferenceChips(listOf("soft" to "ناعمة", "pure" to "نقية", "warm" to "دافئة"), draftAppearance.backgroundTone) {
                    draftAppearance = draftAppearance.copy(backgroundTone = it); savedMessage = ""
                }
                Text("لون النص", fontWeight = FontWeight.SemiBold)
                PreferenceChips(listOf("standard" to "متوازن", "strong" to "داكن قوي", "soft" to "أهدأ"), draftAppearance.textTone) {
                    draftAppearance = draftAppearance.copy(textTone = it); savedMessage = ""
                }
            }
        }

        item {
            SettingsSection("حجم النص") {
                Text("${(draftProfile.textScale * 100).toInt()}%", style = MaterialTheme.typography.titleMedium)
                Slider(value = draftProfile.textScale, onValueChange = { draftProfile = draftProfile.copy(textScale = it); savedMessage = "" }, valueRange = 0.9f..1.6f, steps = 6)
                PreferenceChips(
                    options = listOf("100" to "عادي", "120" to "كبير", "140" to "أكبر"),
                    selected = when {
                        kotlin.math.abs(draftProfile.textScale - 1.4f) < 0.06f -> "140"
                        kotlin.math.abs(draftProfile.textScale - 1.2f) < 0.06f -> "120"
                        else -> "100"
                    }
                ) {
                    val scale = when (it) { "120" -> 1.2f; "140" -> 1.4f; else -> 1f }
                    draftProfile = draftProfile.copy(textScale = scale); savedMessage = ""
                }
            }
        }

        item { AccessibilityToggle("تباين مرتفع", "ألوان أوضح وحدود أقوى عند الحاجة.", draftProfile.highContrast) { draftProfile = draftProfile.copy(highContrast = it); savedMessage = "" } }
        item { AccessibilityToggle("تقليل الحركة", "يوقف أو يختصر الحركات البصرية غير الضرورية.", draftProfile.reduceMotion) { draftProfile = draftProfile.copy(reduceMotion = it); savedMessage = "" } }
        item { AccessibilityToggle("أهداف لمس أكبر", "يزيد الحد الأدنى لمساحة لمس الأزرار والعناصر التفاعلية.", draftProfile.largeTargets) { draftProfile = draftProfile.copy(largeTargets = it); savedMessage = "" } }
        item { AccessibilityToggle("الوضع الإدراكي", "أولوية للخطوات القصيرة وتقليل كثافة المعلومات في الشاشات التي تدعمه.", draftProfile.cognitiveMode) { draftProfile = draftProfile.copy(cognitiveMode = it); savedMessage = "" } }
        item { AccessibilityToggle("تقليل المحفزات", "يقلل العناصر الثانوية والزحام البصري حيث تدعم الشاشة ذلك.", draftProfile.lowStimulation) { draftProfile = draftProfile.copy(lowStimulation = it); savedMessage = "" } }
        item { AccessibilityToggle("أفضل القراءة الصوتية", "يسجل تفضيل Text-to-Speech لتستخدمه الأدوات والمحتوى الذي يدعمه.", draftProfile.textToSpeechPreferred) { draftProfile = draftProfile.copy(textToSpeechPreferred = it); savedMessage = "" } }
        item { AccessibilityToggle("أفضل لغة أبسط", "يسجل تفضيل الشرح المباشر والمختصر دون تغيير الدقة.", draftProfile.simpleLanguagePreferred) { draftProfile = draftProfile.copy(simpleLanguagePreferred = it); savedMessage = "" } }

        item {
            SettingsSection("الإشعارات والنغمة") {
                Text("صوت الإشعارات والاهتزاز والظهور على شاشة القفل تتحكم بها قنوات Android بعد إنشاء القناة.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                FilledTonalButton(onClick = { openNotificationSettings(context, null) }, modifier = Modifier.fillMaxWidth()) { Text("كل إعدادات إشعارات روافد") }
                NotificationChannelButton(context, "راحة العين والرمش", NotificationChannels.EYE)
                NotificationChannelButton(context, "العناية اليومية والماء والحركة", NotificationChannels.DAILY)
                NotificationChannelButton(context, "الرسائل الداعمة", NotificationChannels.MOTIVATION)
                NotificationChannelButton(context, "مواعيد العلاج", NotificationChannels.TREATMENT)
            }
        }

        item {
            Button(modifier = Modifier.fillMaxWidth(), enabled = dirty, onClick = { showConfirm = true }) {
                Text(if (dirty) "حفظ الإعدادات" else "الإعدادات محفوظة")
            }
        }
        if (dirty) {
            item {
                FilledTonalButton(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { draftProfile = savedProfile; draftAppearance = savedAppearance; savedMessage = "تم إلغاء التغييرات غير المحفوظة." }
                ) { Text("إلغاء التغييرات") }
            }
        }
        if (savedMessage.isNotBlank()) item { Text(savedMessage, color = MaterialTheme.colorScheme.primary) }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                    Text("الخصوصية", fontWeight = FontWeight.Bold)
                    Text("إعدادات المظهر والوصولية محلية، ولا ترسل نوع إعاقة أو تفضيلات شخصية إلى الخادم.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }

    if (showConfirm) {
        AlertDialog(
            onDismissRequest = { showConfirm = false },
            title = { Text("حفظ هذه الإعدادات؟") },
            text = { Text("سيتم تطبيق الإعدادات التي راجعتها في المعاينة على التطبيق. يمكنك تعديلها لاحقًا في أي وقت.") },
            confirmButton = {
                TextButton(onClick = {
                    AccessibilityProfileStore.save(context, draftProfile)
                    AppPersonalizationStore.save(context, draftAppearance)
                    savedProfile = draftProfile
                    savedAppearance = draftAppearance
                    showConfirm = false
                    savedMessage = "تم حفظ الإعدادات وتطبيقها."
                }) { Text("حفظ") }
            },
            dismissButton = { TextButton(onClick = { showConfirm = false }) { Text("رجوع") } }
        )
    }
}

@Composable
private fun SettingsPreview(appearance: AppPersonalization, profile: AccessibilityProfile) {
    val dark = appearance.themeMode == "dark"
    val primary = when (appearance.palette) {
        "ocean" -> if (dark) Color(0xFF91CAF4) else Color(0xFF2C6483)
        "sage" -> if (dark) Color(0xFFA4D8A7) else Color(0xFF3E7047)
        "rose" -> if (dark) Color(0xFFF2B7C2) else Color(0xFF965365)
        else -> if (dark) Color(0xFF7FD8D7) else Color(0xFF006A6B)
    }
    val background = when {
        dark && appearance.backgroundTone == "pure" -> Color(0xFF080B0B)
        dark && appearance.backgroundTone == "warm" -> Color(0xFF171411)
        dark -> Color(0xFF0E1513)
        appearance.backgroundTone == "pure" -> Color.White
        appearance.backgroundTone == "warm" -> Color(0xFFFFF9F0)
        else -> Color(0xFFF7FAF8)
    }
    val foreground = when {
        dark && appearance.textTone == "soft" -> Color(0xFFC9D0CD)
        dark -> Color.White
        appearance.textTone == "strong" -> Color(0xFF080B0A)
        appearance.textTone == "soft" -> Color(0xFF39423F)
        else -> Color(0xFF151D1B)
    }
    val scheme = if (dark) darkColorScheme(primary = primary, background = background, surface = background, onBackground = foreground, onSurface = foreground)
    else lightColorScheme(primary = primary, background = background, surface = background, onBackground = foreground, onSurface = foreground)

    MaterialTheme(colorScheme = scheme) {
        Surface(modifier = Modifier.fillMaxWidth(), tonalElevation = if (profile.highContrast) RawafidSpacing.Xxs else RawafidSpacing.Xxs) {
            Column(Modifier.padding(RawafidSpacing.Lg), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                Text("روافد — معاينة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("نص نموذجي لقياس وضوح اللون والخلفية قبل الحفظ.")
                Text("حجم النص المختار: ${(profile.textScale * 100).toInt()}%")
                Text(if (profile.highContrast) "التباين المرتفع: مفعّل" else "التباين المرتفع: غير مفعّل", color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

@Composable
private fun SettingsSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            content()
        }
    }
}

@Composable
private fun PreferenceChips(options: List<Pair<String, String>>, selected: String, onSelect: (String) -> Unit) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
        options.forEach { (id, label) -> FilterChip(selected = selected == id, onClick = { onSelect(id) }, label = { Text(label) }) }
    }
}

@Composable
private fun NotificationChannelButton(context: Context, label: String, channelId: String) {
    FilledTonalButton(onClick = { openNotificationSettings(context, channelId) }, modifier = Modifier.fillMaxWidth()) { Text("نغمة $label") }
}

private fun openNotificationSettings(context: Context, channelId: String?) {
    NotificationChannels.create(context)
    val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && channelId != null) {
        Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS).apply {
            putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
            putExtra(Settings.EXTRA_CHANNEL_ID, channelId)
        }
    } else {
        Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply { putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName) }
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