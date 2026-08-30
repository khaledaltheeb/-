package org.healthrenewal.rawafid

import android.content.Intent
import android.os.Bundle
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
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import org.json.JSONArray
import org.json.JSONObject

data class TravelSafeProfile(
    val destination: String = "",
    val emergencyContact: String = "",
    val allergies: String = "",
    val medications: String = "",
    val importantNote: String = "",
    val insuranceNote: String = ""
)

object TravelSafeStore {
    private const val KEY = "travel_safe_profile"

    fun load(context: android.content.Context): TravelSafeProfile {
        val raw = EncryptedLocalStore.get(context, KEY) ?: return TravelSafeProfile()
        return runCatching {
            val o = JSONObject(raw)
            TravelSafeProfile(
                destination = o.optString("destination"),
                emergencyContact = o.optString("contact"),
                allergies = o.optString("allergies"),
                medications = o.optString("medications"),
                importantNote = o.optString("important_note"),
                insuranceNote = o.optString("insurance")
            )
        }.getOrDefault(TravelSafeProfile())
    }

    fun save(context: android.content.Context, profile: TravelSafeProfile) {
        EncryptedLocalStore.put(
            context,
            KEY,
            JSONObject()
                .put("destination", profile.destination)
                .put("contact", profile.emergencyContact)
                .put("allergies", profile.allergies)
                .put("medications", profile.medications)
                .put("important_note", profile.importantNote)
                .put("insurance", profile.insuranceNote)
                .toString()
        )
    }

    fun presentationCards(profile: TravelSafeProfile): List<PresentationCard> = buildList {
        if (profile.emergencyContact.isNotBlank()) {
            add(PresentationCard("جهة اتصال مهمة", profile.emergencyContact.trim(), hint = "يمكن استخدام هذه المعلومة للتواصل مع الشخص الذي حدده صاحب الهاتف."))
        }
        if (profile.allergies.isNotBlank()) {
            add(PresentationCard("حساسية مهمة", profile.allergies.trim(), hint = "معلومة كتبها صاحب الهاتف؛ لا تعد تشخيصًا أو وصفة طبية."))
        }
        if (profile.medications.isNotBlank()) {
            add(PresentationCard("أدوية أستخدمها", profile.medications.trim(), hint = "اعرض أسماء الأدوية المسجلة كما كتبها صاحب الهاتف."))
        }
        if (profile.insuranceNote.isNotBlank()) {
            add(PresentationCard("تأمين أو جهة مساعدة", profile.insuranceNote.trim()))
        }
        if (profile.importantNote.isNotBlank()) {
            add(PresentationCard("معلومة مهمة", profile.importantNote.trim()))
        }
    }
}

data class TravelPhrase(
    val id: String,
    val category: String,
    val ar: String,
    val en: String,
    val fr: String,
    val tr: String
) {
    fun translation(language: String): String = when (language) {
        "fr" -> fr
        "tr" -> tr
        else -> en
    }
}

object TravelPhraseCatalog {
    private const val ASSET = "travel_safe_phrases.json"
    @Volatile private var cache: List<TravelPhrase>? = null

    fun all(context: android.content.Context): List<TravelPhrase> = cache ?: synchronized(this) {
        cache ?: runCatching {
            val raw = context.assets.open(ASSET).bufferedReader(Charsets.UTF_8).use { it.readText() }
            val array = JSONArray(raw)
            buildList {
                for (index in 0 until array.length()) {
                    val item = array.optJSONObject(index) ?: continue
                    add(
                        TravelPhrase(
                            id = item.optString("id"),
                            category = item.optString("category", "general"),
                            ar = item.optString("ar"),
                            en = item.optString("en"),
                            fr = item.optString("fr"),
                            tr = item.optString("tr")
                        )
                    )
                }
            }.filter { it.id.isNotBlank() && it.ar.isNotBlank() }
        }.getOrDefault(emptyList()).also { cache = it }
    }
}

class TravelSafeActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { TravelSafeScreen() }
                }
            }
        }
    }
}

@Composable
private fun TravelSafeScreen() {
    val context = LocalContext.current
    val initial = remember { TravelSafeStore.load(context) }
    val phrases = remember { TravelPhraseCatalog.all(context) }

    var destination by rememberSaveable { mutableStateOf(initial.destination) }
    var contact by rememberSaveable { mutableStateOf(initial.emergencyContact) }
    var allergies by rememberSaveable { mutableStateOf(initial.allergies) }
    var medications by rememberSaveable { mutableStateOf(initial.medications) }
    var note by rememberSaveable { mutableStateOf(initial.importantNote) }
    var insurance by rememberSaveable { mutableStateOf(initial.insuranceNote) }
    var language by rememberSaveable { mutableStateOf("en") }
    var category by rememberSaveable { mutableStateOf("all") }
    var query by rememberSaveable { mutableStateOf("") }
    var saved by rememberSaveable { mutableStateOf(false) }

    fun profile() = TravelSafeProfile(
        destination = destination.trim(),
        emergencyContact = contact.trim(),
        allergies = allergies.trim(),
        medications = medications.trim(),
        importantNote = note.trim(),
        insuranceNote = insurance.trim()
    )

    val categories = remember(phrases) { listOf("all") + phrases.map { it.category }.distinct() }
    val filtered = remember(phrases, category, query, language) {
        val normalized = query.trim().lowercase()
        phrases.filter { phrase ->
            val categoryMatch = category == "all" || phrase.category == category
            val textMatch = normalized.isBlank() || listOf(phrase.ar, phrase.translation(language), phrase.en, phrase.fr, phrase.tr)
                .any { it.lowercase().contains(normalized) }
            categoryMatch && textMatch
        }
    }

    LazyColumn(
        contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("Travel Safe", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text(
                    "ملف سفر مشفر ومكتبة عبارات تعمل دون إنترنت. ابحث عن العبارة ثم اعرضها للشخص أمامك بملء الشاشة.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        item {
            Card(colors = androidx.compose.material3.CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                Column(Modifier.padding(RawafidSpacing.Lg), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("ملف الرحلة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(destination, { destination = it.take(120); saved = false }, label = { Text("الوجهة أو اسم الرحلة") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(contact, { contact = it.take(160); saved = false }, label = { Text("جهة اتصال مهمة") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(allergies, { allergies = it.take(500); saved = false }, label = { Text("حساسية مهمة") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(medications, { medications = it.take(800); saved = false }, label = { Text("أدوية تريد حمل معلوماتها") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(insurance, { insurance = it.take(500); saved = false }, label = { Text("تأمين أو جهة مساعدة — اختياري") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(note, { note = it.take(800); saved = false }, label = { Text("معلومة مهمة أخرى") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    Button(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            TravelSafeStore.save(context, profile())
                            saved = true
                        }
                    ) { Text(if (saved) "تم الحفظ مشفرًا" else "حفظ مشفر على الهاتف") }

                    val profileCards = TravelSafeStore.presentationCards(profile())
                    OutlinedButton(
                        modifier = Modifier.fillMaxWidth(),
                        enabled = profileCards.isNotEmpty(),
                        onClick = {
                            PresentationActivity.open(context, "معلوماتي المهمة", profileCards)
                        }
                    ) { Text(if (profileCards.isEmpty()) "أضف معلومات لعرضها" else "أرِ معلوماتي للشخص أمامي") }

                    OutlinedButton(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            val p = profile()
                            val text = listOfNotNull(
                                "Travel Safe — روافد",
                                p.destination.takeIf { it.isNotBlank() }?.let { "الوجهة: $it" },
                                p.emergencyContact.takeIf { it.isNotBlank() }?.let { "جهة الاتصال: $it" },
                                p.allergies.takeIf { it.isNotBlank() }?.let { "الحساسية: $it" },
                                p.medications.takeIf { it.isNotBlank() }?.let { "الأدوية: $it" },
                                p.insuranceNote.takeIf { it.isNotBlank() }?.let { "التأمين/المساعدة: $it" },
                                p.importantNote.takeIf { it.isNotBlank() }?.let { "ملاحظة: $it" }
                            ).joinToString("\n")
                            context.startActivity(
                                Intent.createChooser(
                                    Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_TEXT, text)
                                    },
                                    "مشاركة معلومات الرحلة"
                                )
                            )
                        }
                    ) { Text("مشاركة معلومات الرحلة") }
                }
            }
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                Text("عبارات جاهزة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("اختر اللغة، ثم ابحث أو اختر الفئة. الضغط على «اعرض» يفتح العبارة بملء الشاشة.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                    verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
                ) {
                    listOf("en" to "English", "fr" to "Français", "tr" to "Türkçe").forEach { (id, label) ->
                        FilterChip(selected = language == id, onClick = { language = id }, label = { Text(label) })
                    }
                }
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it.take(100) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    label = { Text("ابحث: طبيب، مطار، حساسية، دواء...") }
                )
            }
        }

        item {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
            ) {
                categories.forEach { id ->
                    FilterChip(
                        selected = category == id,
                        onClick = { category = id },
                        label = { Text(travelCategoryLabel(id)) }
                    )
                }
            }
        }

        if (filtered.isEmpty()) {
            item {
                Card {
                    Text(
                        "لا توجد عبارة مطابقة. جرّب كلمة أقصر أو اختر «الكل».",
                        modifier = Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            items(filtered, key = { it.id }) { phrase ->
                val translation = phrase.translation(language)
                Card {
                    Column(Modifier.padding(RawafidSpacing.Md), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text(phrase.ar, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(translation, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                            Button(
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    val cards = filtered.map {
                                        PresentationCard(
                                            title = it.ar,
                                            body = it.translation(language),
                                            secondary = it.ar,
                                            hint = "هذه عبارة تواصل جاهزة. استخدم السابق/التالي للتنقل بين العبارات الظاهرة في قائمتك الحالية."
                                        )
                                    }
                                    val start = filtered.indexOfFirst { it.id == phrase.id }.coerceAtLeast(0)
                                    PresentationActivity.open(context, "Travel Safe", cards, start)
                                }
                            ) { Text("اعرض") }
                            OutlinedButton(
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    val text = "${phrase.ar}\n$translation"
                                    context.startActivity(
                                        Intent.createChooser(
                                            Intent(Intent.ACTION_SEND).apply {
                                                type = "text/plain"
                                                putExtra(Intent.EXTRA_TEXT, text)
                                            },
                                            "مشاركة العبارة"
                                        )
                                    )
                                }
                            ) { Text("مشاركة") }
                        }
                    }
                }
            }
        }

        item {
            Text(
                "العبارات مخصصة للتواصل وتسهيل الفهم فقط. لا تستبدل خدمات الطوارئ أو التقييم الطبي أو تعليمات المختص.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

private fun travelCategoryLabel(id: String): String = when (id) {
    "all" -> "الكل"
    "emergency" -> "طوارئ"
    "communication" -> "تواصل"
    "accessibility" -> "وصولية"
    "medical" -> "معلومات صحية"
    "symptoms" -> "أعراض"
    "pharmacy" -> "صيدلية"
    "travel" -> "مطار وسفر"
    "food" -> "طعام وحساسية"
    "family" -> "طفل وأسرة"
    else -> "عام"
}
