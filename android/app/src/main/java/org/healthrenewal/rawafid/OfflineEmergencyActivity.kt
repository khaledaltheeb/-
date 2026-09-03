package org.healthrenewal.rawafid

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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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

object OfflineEmergencyPackStore {
    private const val KEY = "offline_emergency_pack_v1"

    fun build(context: android.content.Context): String {
        val life = LifeCardStore.load(context)
        val contacts = JSONArray()
        MyCircleStore.forPermission(context, CirclePermission.EMERGENCY).take(8).forEach { person ->
            contacts.put(JSONObject().put("name", person.name).put("relation", person.relation).put("phone", person.phone))
        }
        val medications = JSONArray()
        MedicationStore.medications(context).take(30).forEach { med ->
            medications.put(JSONObject().put("name", med.name).put("instruction", med.instruction).put("hour", med.hour).put("minute", med.minute))
        }
        val scenarios = JSONArray()
        WhatNowCatalog.all(context).forEach { scenario -> scenarios.put(scenario.id) }
        val data = JSONObject()
            .put("version", 1)
            .put("generated_at", System.currentTimeMillis())
            .put("life_card", JSONObject().put("name", life.displayName).put("allergies", life.allergies).put("conditions", life.conditions).put("medications", life.medications).put("communication", life.communicationNeeds).put("accessibility", life.accessibilityNeeds).put("emergency_notes", life.emergencyNotes))
            .put("emergency_contacts", contacts)
            .put("medication_schedule", medications)
            .put("offline_scenario_ids", scenarios)
        EncryptedLocalStore.put(context, KEY, data.toString())
        return data.toString()
    }

    fun load(context: android.content.Context): String? = EncryptedLocalStore.get(context, KEY)
    fun clear(context: android.content.Context) = EncryptedLocalStore.remove(context, KEY)
}

class OfflineEmergencyActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { OfflineEmergencyScreen() }
                }
            }
        }
    }
}

@Composable
private fun OfflineEmergencyScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    val life = remember(version) { LifeCardStore.load(context) }
    val contacts = remember(version) { MyCircleStore.forPermission(context, CirclePermission.EMERGENCY) }
    val meds = remember(version) { MedicationStore.medications(context) }
    val scenarios = remember { WhatNowCatalog.all(context) }
    val stored = remember(version) { OfflineEmergencyPackStore.load(context) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("حزمة الطوارئ Offline", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("تجمع نسخة محلية مشفرة من المعلومات التي تحتاجها عند ضعف الشبكة. لا ترفع الحزمة إلى أي خادم.")
            }
        }
        item { ReadinessCard("بطاقة الحياة", life.displayName.isNotBlank() || life.emergencyNotes.isNotBlank(), "أضف المعلومات التي تريد أن تكون جاهزة وقت الحاجة.") }
        item { ReadinessCard("أشخاص الطوارئ", contacts.isNotEmpty(), if (contacts.isEmpty()) "لم تحدد شخصًا للطوارئ في دائرتي." else "${contacts.size} جهة موثوقة") }
        item { ReadinessCard("العلاج", meds.isNotEmpty(), if (meds.isEmpty()) "لا توجد علاجات محفوظة." else "${meds.size} علاج/دواء محفوظ") }
        item { ReadinessCard("إرشادات ماذا أفعل الآن", scenarios.isNotEmpty(), "${scenarios.size} مسارات محفوظة داخل التطبيق وتعمل دون شبكة.") }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("الحزمة المشفرة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(if (stored == null) "لم تنشئ لقطة طوارئ بعد." else "توجد لقطة محلية مشفرة. أعد إنشاءها كلما تغيرت بياناتك المهمة.")
                    Button(modifier = Modifier.fillMaxWidth(), onClick = { OfflineEmergencyPackStore.build(context); version++ }) { Text("تحديث حزمة الطوارئ الآن") }
                    if (stored != null) Button(modifier = Modifier.fillMaxWidth(), onClick = { OfflineEmergencyPackStore.clear(context); version++ }) { Text("حذف الحزمة المحلية") }
                }
            }
        }
        item {
            Text("الحزمة لا تستبدل خدمات الطوارئ، ولا تضمن وصول بياناتك لشخص آخر ما لم تعرضها أو تشاركها بنفسك.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.error)
        }
    }
}

@Composable
private fun ReadinessCard(title: String, ready: Boolean, detail: String) {
    Card {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text("${if (ready) "✓" else "○"} $title", fontWeight = FontWeight.Bold)
            Text(detail, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
