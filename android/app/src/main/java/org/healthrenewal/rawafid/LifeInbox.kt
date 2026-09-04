package org.healthrenewal.rawafid

import android.content.Context
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddTask
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.Medication
import androidx.compose.material.icons.filled.People
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant

enum class LifeCaptureKind(
    val key: String,
    val label: String,
    val targetFeatureId: String,
    val icon: ImageVector
) {
    NOTE("note", "ملاحظة", "quick_capture", Icons.Default.Description),
    TASK("task", "مهمة", "routines", Icons.Default.AddTask),
    APPOINTMENT("appointment", "موعد", "appointment_companion", Icons.Default.CalendarMonth),
    MEDICATION("medication", "علاج", "medication_companion", Icons.Default.Medication),
    ITEM("item", "غرض / مكان", "where_put_it", Icons.Default.Inventory2),
    PERSON("person", "شخص / دائرة", "my_circle", Icons.Default.People),
    SAFETY("safety", "أمان", "help_now", Icons.Default.HealthAndSafety);

    companion object {
        fun fromKey(value: String): LifeCaptureKind = entries.firstOrNull { it.key == value } ?: NOTE
    }
}

data class LifeCapture(
    val id: Long,
    val text: String,
    val kind: LifeCaptureKind,
    val createdAtEpochMs: Long
)

object LifeInboxClassifier {
    private val medicationWords = setOf("دواء", "دوائي", "العلاج", "علاج", "جرعة", "حبوب", "دواءي", "medication", "medicine", "dose")
    private val appointmentWords = setOf("موعد", "دكتور", "طبيب", "عيادة", "مستشفى", "زيارة", "appointment", "doctor", "clinic")
    private val itemWords = setOf("وضعت", "وضعتها", "مكان", "مفتاح", "مفاتيح", "محفظة", "جواز", "غرض", "where", "put", "keys", "passport")
    private val safetyWords = setOf("طوارئ", "خطر", "أمان", "نجدة", "ساعدني", "حادث", "emergency", "danger", "safety", "help")
    private val personWords = setOf("أمي", "ابي", "أبي", "زوجي", "زوجتي", "ابني", "ابنتي", "صديقي", "شخص", "اتصل", "circle", "person", "call")
    private val taskWords = setOf("مهمة", "افعل", "أنجز", "انجز", "لازم", "يجب", "تذكّر", "تذكر", "task", "todo", "do")

    fun classify(text: String): LifeCaptureKind {
        val normalized = text.trim().lowercase()
        if (normalized.isBlank()) return LifeCaptureKind.NOTE
        return when {
            containsAny(normalized, safetyWords) -> LifeCaptureKind.SAFETY
            containsAny(normalized, medicationWords) -> LifeCaptureKind.MEDICATION
            containsAny(normalized, appointmentWords) -> LifeCaptureKind.APPOINTMENT
            containsAny(normalized, itemWords) -> LifeCaptureKind.ITEM
            containsAny(normalized, personWords) -> LifeCaptureKind.PERSON
            containsAny(normalized, taskWords) -> LifeCaptureKind.TASK
            else -> LifeCaptureKind.NOTE
        }
    }

    private fun containsAny(value: String, words: Set<String>): Boolean = words.any(value::contains)
}

object LifeInboxStore {
    private const val LEGACY_PREFS = "rawafid_life_inbox_v1"
    private const val LEGACY_KEY = "captures"
    private const val ENCRYPTED_KEY = "rawafid_life_inbox_captures_v2"
    private const val LIMIT = 120

    fun captures(context: Context): List<LifeCapture> {
        val raw = SensitiveLocalPayload.read(
            context = context,
            encryptedKey = ENCRYPTED_KEY,
            legacyPrefsName = LEGACY_PREFS,
            legacyKey = LEGACY_KEY,
            defaultValue = "[]",
            validator = { runCatching { JSONArray(it) }.isSuccess }
        )
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (index in 0 until array.length()) {
                    val item = array.optJSONObject(index) ?: continue
                    val text = item.optString("text").trim()
                    if (text.isBlank()) continue
                    add(
                        LifeCapture(
                            id = item.optLong("id"),
                            text = text,
                            kind = LifeCaptureKind.fromKey(item.optString("kind")),
                            createdAtEpochMs = item.optLong("created_at")
                        )
                    )
                }
            }.sortedByDescending { it.createdAtEpochMs }.take(LIMIT)
        }.getOrDefault(emptyList())
    }

    fun add(context: Context, text: String, kind: LifeCaptureKind): LifeCapture {
        val capture = LifeCapture(
            id = System.currentTimeMillis(),
            text = text.trim().take(800),
            kind = kind,
            createdAtEpochMs = System.currentTimeMillis()
        )
        persist(context, listOf(capture) + captures(context).filterNot { it.id == capture.id })
        return capture
    }

    fun remove(context: Context, id: Long) {
        persist(context, captures(context).filterNot { it.id == id })
    }

    private fun persist(context: Context, values: List<LifeCapture>) {
        val array = JSONArray()
        values.sortedByDescending { it.createdAtEpochMs }.take(LIMIT).forEach { capture ->
            array.put(
                JSONObject()
                    .put("id", capture.id)
                    .put("text", capture.text)
                    .put("kind", capture.kind.key)
                    .put("created_at", capture.createdAtEpochMs)
            )
        }
        SensitiveLocalPayload.write(context, ENCRYPTED_KEY, array.toString(), LEGACY_PREFS, LEGACY_KEY)
    }
}

@Composable
fun LifeInboxScreen(onClose: () -> Unit) {
    val context = LocalContext.current
    var revision by remember { mutableIntStateOf(0) }
    var text by rememberSaveable { mutableStateOf("") }
    var kindOverride by rememberSaveable { mutableStateOf<String?>(null) }
    val suggested = remember(text) { LifeInboxClassifier.classify(text) }
    val selected = kindOverride?.let(LifeCaptureKind::fromKey) ?: suggested
    val captures = remember(revision) { LifeInboxStore.captures(context) }
    val features = remember { FeatureCatalog.visible(context) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            horizontal = RawafidSpacing.ScreenHorizontal,
            vertical = RawafidSpacing.ScreenVertical
        ),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.SectionGap)
    ) {
        item {
            LifeInboxHero(onClose = onClose)
        }

        item {
            Card(
                shape = MaterialTheme.shapes.extraLarge,
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(
                    Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
                    verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
                ) {
                    Text("اكتب الشيء كما خطر في بالك", style = MaterialTheme.typography.titleLarge)
                    Text(
                        "روافد يصنّفه محليًا على جهازك ثم يوجهك إلى المكان الصحيح. لا يُرسل النص إلى خدمة ذكاء اصطناعي خارجية.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    OutlinedTextField(
                        value = text,
                        onValueChange = {
                            text = it.take(800)
                            kindOverride = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3,
                        maxLines = 6,
                        label = { Text("مثال: عندي موعد طبيب الخميس الساعة 4") },
                        supportingText = { Text("${text.length}/800") }
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text("التصنيف", style = MaterialTheme.typography.labelLarge)
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                            verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
                        ) {
                            LifeCaptureKind.entries.forEach { kind ->
                                FilterChip(
                                    selected = selected == kind,
                                    onClick = { kindOverride = kind.key },
                                    label = { Text(kind.label) },
                                    leadingIcon = { Icon(kind.icon, contentDescription = null) }
                                )
                            }
                        }
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            enabled = text.isNotBlank(),
                            onClick = {
                                LifeInboxStore.add(context, text, selected)
                                text = ""
                                kindOverride = null
                                revision++
                            },
                            modifier = Modifier.weight(1f)
                        ) { Text("حفظ في صندوق الحياة") }
                        OutlinedButton(
                            enabled = text.isNotBlank(),
                            onClick = {
                                val feature = features.firstOrNull { it.id == selected.targetFeatureId }
                                if (feature != null) FeatureRouter.open(context, feature)
                            }
                        ) { Text("فتح ${selected.label}") }
                    }
                }
            }
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xxs)) {
                Text("المحفوظ مؤخرًا", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text(
                    "مدخل واحد، ثم تنتقل التفاصيل إلى الأداة المتخصصة عندما تكون جاهزًا.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        if (captures.isEmpty()) {
            item { LifeInboxEmptyState() }
        } else {
            items(captures, key = { it.id }) { capture ->
                LifeCaptureCard(
                    capture = capture,
                    onOpen = {
                        val feature = features.firstOrNull { it.id == capture.kind.targetFeatureId }
                        if (feature != null) FeatureRouter.open(context, feature)
                    },
                    onDelete = {
                        LifeInboxStore.remove(context, capture.id)
                        revision++
                    }
                )
            }
        }
    }
}

@Composable
private fun LifeInboxHero(onClose: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(MaterialTheme.shapes.extraLarge)
            .background(
                Brush.linearGradient(
                    listOf(
                        MaterialTheme.colorScheme.primaryContainer,
                        MaterialTheme.colorScheme.secondaryContainer
                    )
                )
            )
            .padding(RawafidSpacing.Xl)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xxs)) {
                    Text("روافد · Life OS", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                    Text("صندوق الحياة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                }
                if (BuildConfig.DEBUG) {
                    Surface(shape = CircleShape, color = MaterialTheme.colorScheme.tertiaryContainer) {
                        Text("اختبار", modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp), style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
            Text(
                "مكان واحد لالتقاط ما لا تريد أن تنساه، ثم تحويله إلى فعل منظم بدل أن يبقى ملاحظة مبعثرة.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            TextButton(onClick = onClose) { Text("العودة للرئيسية") }
        }
    }
}

@Composable
private fun LifeInboxEmptyState() {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(
            Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
            verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
        ) {
            Text("الصندوق فارغ", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text("اكتب أول شيء تريد تذكره أو تنظيمه. سيبقى محفوظًا محليًا بشكل مشفر.")
        }
    }
}

@Composable
private fun LifeCaptureCard(capture: LifeCapture, onOpen: () -> Unit, onDelete: () -> Unit) {
    Card(shape = MaterialTheme.shapes.large) {
        Column(
            Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
            verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm),
                verticalAlignment = Alignment.Top
            ) {
                Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primaryContainer) {
                    Icon(
                        capture.kind.icon,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(10.dp)
                    )
                }
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xxs)) {
                    Text(capture.kind.label, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                    Text(capture.text, style = MaterialTheme.typography.bodyLarge)
                    Text(
                        Instant.ofEpochMilli(capture.createdAtEpochMs).toString().replace("T", " ").take(16),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Button(onClick = onOpen) { Text("فتح الأداة المناسبة") }
                TextButton(onClick = onDelete) { Text("حذف") }
            }
        }
    }
}
