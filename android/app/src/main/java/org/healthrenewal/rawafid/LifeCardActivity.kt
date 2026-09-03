package org.healthrenewal.rawafid

import android.content.Intent
import android.graphics.Bitmap
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter

class LifeCardActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { LifeCardScreen() }
                }
            }
        }
    }
}

@Composable
private fun LifeCardScreen() {
    val context = LocalContext.current
    val initial = remember { LifeCardStore.load(context) }
    var name by rememberSaveable { mutableStateOf(initial.displayName) }
    var birthYear by rememberSaveable { mutableStateOf(initial.birthYear) }
    var bloodType by rememberSaveable { mutableStateOf(initial.bloodType) }
    var allergies by rememberSaveable { mutableStateOf(initial.allergies) }
    var conditions by rememberSaveable { mutableStateOf(initial.conditions) }
    var medications by rememberSaveable { mutableStateOf(initial.medications) }
    var communication by rememberSaveable { mutableStateOf(initial.communicationNeeds) }
    var accessibility by rememberSaveable { mutableStateOf(initial.accessibilityNeeds) }
    var emergencyNotes by rememberSaveable { mutableStateOf(initial.emergencyNotes) }
    var contactName by rememberSaveable { mutableStateOf(initial.contacts.firstOrNull()?.name.orEmpty()) }
    var contactRelation by rememberSaveable { mutableStateOf(initial.contacts.firstOrNull()?.relation.orEmpty()) }
    var contactPhone by rememberSaveable { mutableStateOf(initial.contacts.firstOrNull()?.phone.orEmpty()) }
    var preset by remember { mutableStateOf(LifeCardPreset.MINIMAL) }
    var included by remember { mutableStateOf(preset.fields) }
    var expiry by rememberSaveable { mutableStateOf(24) }
    var qrPayload by remember { mutableStateOf<String?>(null) }

    fun profile(): LifeCardProfile {
        val contacts = if (contactName.isBlank() && contactPhone.isBlank()) emptyList() else listOf(
            LifeCardContact("primary", contactName.trim(), contactRelation.trim(), contactPhone.trim())
        )
        return LifeCardProfile(
            displayName = name.trim(), birthYear = birthYear.trim(), bloodType = bloodType.trim(),
            allergies = allergies.trim(), conditions = conditions.trim(), medications = medications.trim(),
            communicationNeeds = communication.trim(), accessibilityNeeds = accessibility.trim(),
            emergencyNotes = emergencyNotes.trim(), contacts = contacts
        )
    }

    val qrBitmap = remember(qrPayload) { qrPayload?.let { generateQr(it, 720) } }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("بطاقة روافد للحياة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("أنت تحدد ما يُحفظ وما يدخل QR. البطاقة تعمل Offline ولا تعتمد على رابط خادم.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    Text("بيانات البطاقة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(name, { name = it.take(80) }, label = { Text("الاسم الذي تريد عرضه") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(birthYear, { birthYear = it.filter(Char::isDigit).take(4) }, label = { Text("سنة الميلاد — اختياري") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(bloodType, { bloodType = it.take(8) }, label = { Text("فصيلة الدم — إن كنت متأكدًا منها") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(allergies, { allergies = it.take(700) }, label = { Text("الحساسية") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(conditions, { conditions = it.take(700) }, label = { Text("حالة مهمة تريد أن يعرفها من يساعدك") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(medications, { medications = it.take(700) }, label = { Text("أدوية مهمة") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(communication, { communication = it.take(700) }, label = { Text("كيف أتواصل بشكل أفضل") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(accessibility, { accessibility = it.take(700) }, label = { Text("احتياجات وصولية مهمة") }, minLines = 2, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(emergencyNotes, { emergencyNotes = it.take(900) }, label = { Text("كيف تساعدني / معلومة طوارئ") }, minLines = 3, modifier = Modifier.fillMaxWidth())
                    Text("جهة طوارئ", fontWeight = FontWeight.Bold)
                    OutlinedTextField(contactName, { contactName = it.take(80) }, label = { Text("الاسم") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(contactRelation, { contactRelation = it.take(80) }, label = { Text("العلاقة") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(contactPhone, { contactPhone = it.take(40) }, label = { Text("الهاتف") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = { LifeCardStore.save(context, profile()) }) { Text("حفظ محلي") }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    Text("ما الذي يدخل QR؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        LifeCardPreset.entries.forEach { value ->
                            FilterChip(
                                selected = preset == value,
                                onClick = { preset = value; included = value.fields; qrPayload = null },
                                label = { Text(value.labelAr) }
                            )
                        }
                    }
                    LifeCardField.entries.forEach { field ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(fieldLabel(field), Modifier.weight(1f))
                            Checkbox(
                                checked = field in included,
                                onCheckedChange = { yes -> included = if (yes) included + field else included - field; qrPayload = null }
                            )
                        }
                    }
                    Text("صلاحية مقصودة للبطاقة: $expiry ساعة")
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(12, 24, 72, 168).forEach { hours ->
                            FilterChip(selected = expiry == hours, onClick = { expiry = hours; qrPayload = null }, label = { Text(if (hours < 24) "$hours س" else "${hours / 24} ي") })
                        }
                    }
                    Button(onClick = {
                        val p = profile()
                        LifeCardStore.save(context, p)
                        qrPayload = LifeCardStore.buildSharePayload(p, LifeCardShareConfig(preset, included, expiry))
                    }) { Text("إنشاء QR Offline") }
                }
            }
        }
        qrBitmap?.let { bitmap ->
            item {
                Card {
                    Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("QR البطاقة", fontWeight = FontWeight.Bold)
                        Image(bitmap.asImageBitmap(), contentDescription = "QR بطاقة روافد", modifier = Modifier.size(280.dp))
                        Text("اعرضه فقط لمن تريد أن يقرأ الحقول التي اخترتها. وجود QR لا يجعل البيانات سجلًا طبيًا موثقًا.", style = MaterialTheme.typography.bodySmall)
                        OutlinedButton(onClick = {
                            val payload = qrPayload.orEmpty()
                            context.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, payload) }, "مشاركة بيانات البطاقة"))
                        }) { Text("مشاركة النص نفسه") }
                    }
                }
            }
        }
    }
}

private fun generateQr(payload: String, size: Int): Bitmap? = runCatching {
    val matrix = QRCodeWriter().encode(payload, BarcodeFormat.QR_CODE, size, size)
    Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888).apply {
        for (y in 0 until size) for (x in 0 until size) {
            setPixel(x, y, if (matrix[x, y]) android.graphics.Color.BLACK else android.graphics.Color.WHITE)
        }
    }
}.getOrNull()

private fun fieldLabel(field: LifeCardField): String = when (field) {
    LifeCardField.DISPLAY_NAME -> "الاسم"
    LifeCardField.BIRTH_YEAR -> "سنة الميلاد"
    LifeCardField.BLOOD_TYPE -> "فصيلة الدم"
    LifeCardField.ALLERGIES -> "الحساسية"
    LifeCardField.CONDITIONS -> "الحالات المهمة"
    LifeCardField.MEDICATIONS -> "الأدوية"
    LifeCardField.COMMUNICATION_NEEDS -> "احتياجات التواصل"
    LifeCardField.ACCESSIBILITY_NEEDS -> "الوصولية"
    LifeCardField.EMERGENCY_NOTES -> "ملاحظات المساعدة"
    LifeCardField.EMERGENCY_CONTACTS -> "جهات الطوارئ"
}
