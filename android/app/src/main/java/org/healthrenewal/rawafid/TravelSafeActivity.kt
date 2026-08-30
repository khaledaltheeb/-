package org.healthrenewal.rawafid

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.unit.dp
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
            TravelSafeProfile(o.optString("destination"), o.optString("contact"), o.optString("allergies"), o.optString("medications"), o.optString("important_note"), o.optString("insurance"))
        }.getOrDefault(TravelSafeProfile())
    }
    fun save(context: android.content.Context, p: TravelSafeProfile) {
        EncryptedLocalStore.put(context, KEY, JSONObject().put("destination", p.destination).put("contact", p.emergencyContact).put("allergies", p.allergies).put("medications", p.medications).put("important_note", p.importantNote).put("insurance", p.insuranceNote).toString())
    }
}

data class MedicalPhrase(val ar: String, val en: String, val fr: String, val tr: String)

private val medicalPhrases = listOf(
    MedicalPhrase("أحتاج مساعدة طبية.", "I need medical help.", "J’ai besoin d’aide médicale.", "Tıbbi yardıma ihtiyacım var."),
    MedicalPhrase("لدي حساسية. سأريك التفاصيل المكتوبة.", "I have an allergy. I will show you the written details.", "J’ai une allergie. Je vais vous montrer les détails écrits.", "Alerjim var. Yazılı ayrıntıları göstereceğim."),
    MedicalPhrase("أتناول دواءً بانتظام. سأريك اسمه وتعليماته.", "I take a medication regularly. I will show you its name and instructions.", "Je prends un médicament régulièrement. Je vais vous montrer son nom et ses instructions.", "Düzenli ilaç kullanıyorum. Adını ve talimatlarını göstereceğim."),
    MedicalPhrase("لدي صرع.", "I have epilepsy.", "Je suis atteint(e) d’épilepsie.", "Epilepsim var."),
    MedicalPhrase("لدي سكري.", "I have diabetes.", "Je suis diabétique.", "Diyabetim var."),
    MedicalPhrase("لدي صعوبة في السمع.", "I have difficulty hearing.", "J’ai des difficultés à entendre.", "İşitme güçlüğüm var."),
    MedicalPhrase("أفضل التواصل بالكتابة.", "I prefer written communication.", "Je préfère communiquer par écrit.", "Yazılı iletişimi tercih ediyorum."),
    MedicalPhrase("أحتاج مترجمًا.", "I need an interpreter.", "J’ai besoin d’un interprète.", "Tercümana ihtiyacım var."),
    MedicalPhrase("من فضلك اتصل بهذا الشخص.", "Please call this person.", "Veuillez appeler cette personne.", "Lütfen bu kişiyi arayın."),
    MedicalPhrase("لا تلمسني قبل أن تخبرني بما ستفعله.", "Please tell me before touching me.", "Veuillez me prévenir avant de me toucher.", "Lütfen bana dokunmadan önce haber verin."),
    MedicalPhrase("أحتاج وقتًا أطول للإجابة.", "I need more time to answer.", "J’ai besoin de plus de temps pour répondre.", "Cevap vermek için daha fazla zamana ihtiyacım var.")
)

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
    var destination by rememberSaveable { mutableStateOf(initial.destination) }
    var contact by rememberSaveable { mutableStateOf(initial.emergencyContact) }
    var allergies by rememberSaveable { mutableStateOf(initial.allergies) }
    var medications by rememberSaveable { mutableStateOf(initial.medications) }
    var note by rememberSaveable { mutableStateOf(initial.importantNote) }
    var insurance by rememberSaveable { mutableStateOf(initial.insuranceNote) }
    var language by rememberSaveable { mutableStateOf("en") }

    fun profile() = TravelSafeProfile(destination.trim(), contact.trim(), allergies.trim(), medications.trim(), note.trim(), insurance.trim())

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Travel Safe", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("بيانات السفر المهمة والعبارات الطبية الأساسية تعمل Offline. الملف الشخصي مشفر محليًا ولا يُشارك إلا بفعل منك.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    Text("ملف الرحلة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(destination, { destination = it.take(120) }, label = { Text("الوجهة / الرحلة") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(contact, { contact = it.take(160) }, label = { Text("جهة اتصال مهمة") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(allergies, { allergies = it.take(500) }, label = { Text("حساسية تريد حفظها") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(medications, { medications = it.take(800) }, label = { Text("أدوية تريد حمل معلوماتها") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(insurance, { insurance = it.take(500) }, label = { Text("تأمين / جهة مساعدة — اختياري") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(note, { note = it.take(800) }, label = { Text("معلومة مهمة أخرى") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    Button(onClick = { TravelSafeStore.save(context, profile()) }) { Text("حفظ مشفر على الهاتف") }
                    OutlinedButton(onClick = {
                        val p = profile()
                        val text = listOf("Travel Safe — روافد", "الوجهة: ${p.destination}", "جهة الاتصال: ${p.emergencyContact}", "الحساسية: ${p.allergies}", "الأدوية: ${p.medications}", "التأمين/المساعدة: ${p.insuranceNote}", "ملاحظة: ${p.importantNote}").joinToString("\n")
                        context.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, text) }, "مشاركة معلومات الرحلة"))
                    }) { Text("مشاركة ما أراه الآن") }
                }
            }
        }
        item {
            Text("بطاقة كلام طبية Offline", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            androidx.compose.foundation.layout.Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("en" to "English", "fr" to "Français", "tr" to "Türkçe").forEach { (id, label) -> FilterChip(selected = language == id, onClick = { language = id }, label = { Text(label) }) }
            }
        }
        medicalPhrases.forEachIndexed { index, phrase ->
            item(key = "phrase_$index") {
                val translation = when (language) { "fr" -> phrase.fr; "tr" -> phrase.tr; else -> phrase.en }
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(phrase.ar, fontWeight = FontWeight.Bold)
                        Text(translation, style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }
        item {
            Text("هذه العبارات للتواصل فقط، ولا تحل محل خدمات الطوارئ أو التقييم الطبي.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
