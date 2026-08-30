package org.healthrenewal.rawafid

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Intent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.DeleteForever
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import java.text.DateFormat
import java.util.Calendar
import java.util.Date

private enum class Destination(val key: String, val label: String, val icon: ImageVector) {
    HOME("home", "الرئيسية", Icons.Default.Home),
    CARE("care", "اهتم بي", Icons.Default.Favorite),
    TOOLS("tools", "الأدوات", Icons.Default.Build),
    SAFETY("safety", "الأمان", Icons.Default.Security),
    KNOWLEDGE("knowledge", "المعرفة", Icons.Default.Public)
}

@Composable
fun RawafidApp(initialDestination: String, requestNotifications: ((Boolean) -> Unit) -> Unit) {
    val context = LocalContext.current
    var destination by rememberSaveable { mutableStateOf(Destination.entries.firstOrNull { it.key == initialDestination } ?: Destination.HOME) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                Destination.entries.forEach { item ->
                    NavigationBarItem(
                        selected = destination == item,
                        onClick = {
                            if (item == Destination.KNOWLEDGE) context.startActivity(Intent(context, WebActivity::class.java)) else destination = item
                        },
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) }
                    )
                }
            }
        }
    ) { padding ->
        Surface(Modifier.fillMaxSize().padding(padding)) {
            when (destination) {
                Destination.HOME -> HomeScreen { destination = it }
                Destination.CARE -> CareScreen(requestNotifications)
                Destination.TOOLS -> ToolsScreen()
                Destination.SAFETY -> SafetyScreen()
                Destination.KNOWLEDGE -> HomeScreen { destination = it }
            }
        }
    }
}

@Composable
private fun PageTitle(title: String, subtitle: String) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun HomeScreen(onNavigate: (Destination) -> Unit) {
    val context = LocalContext.current
    var waterVersion by remember { mutableIntStateOf(0) }
    var hint by remember { mutableStateOf("اختر ما تحتاجه الآن؛ ليس مطلوبًا أن تستخدم كل شيء.") }
    val water = remember(waterVersion) { LocalStore.waterCountToday(context) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("روافد", fontWeight = FontWeight.Bold)
                    Text("ماذا تحتاج اليوم؟", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text("الصحة اليومية، الأمان، المعرفة والأدوات في مكان واحد.")
                }
            }
        }
        item { PageTitle("وصول سريع", hint) }
        item {
            QuickCard("ارمش الآن", "راحة قصيرة للعين", Icons.Default.Visibility) {
                hint = "ارمش عدة مرات وانظر بعيدًا عن الشاشة للحظات. يمكنك ضبط تذكير تلقائي من «اهتم بي»."
            }
        }
        item {
            QuickCard("شربت ماء", "$water مرة اليوم", Icons.Default.WaterDrop) {
                LocalStore.recordWater(context); waterVersion++; hint = "تم تسجيل الماء محليًا على هذا الهاتف."
            }
        }
        item {
            QuickCard("تحرك", "قف وتحرك قليلًا", Icons.Default.DirectionsWalk) {
                hint = "قف، حرّك كتفيك، امشِ قليلًا وخذ عدة أنفاس هادئة."
            }
        }
        item {
            QuickCard("فضفض", "اكتب ثم دعها تذهب", Icons.Default.AutoAwesome) { onNavigate(Destination.TOOLS) }
        }
        item {
            QuickCard("جواز احتياجاتي", "شارك فقط طريقة التعامل التي تختارها", Icons.Default.Security) {
                context.startActivity(Intent(context, SupportPassportActivity::class.java))
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("رفيقة روافد", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("قطاع المرأة: رفيقة يومية، تقويم متقدم، عناية ذاتية، دعم نفسي وحدود وأمان.")
                    Button(onClick = { context.startActivity(Intent(context, WomenActivity::class.java)) }) { Text("فتح قطاع المرأة") }
                    OutlinedButton(onClick = { context.startActivity(Intent(context, WomenCarePlannerActivity::class.java)) }) { Text("خطة العناية النسائية") }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("اهتم بي", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("اضبط تنبيهات العين والحركة والماء والرسائل الداعمة وساعات الصمت.")
                    Button(onClick = { onNavigate(Destination.CARE) }) { Text("ضبط اهتم بي") }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("معرفة روافد", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("الموقع يبقى محرك المعرفة والأدلة والموسوعة والقطاعات.")
                    OutlinedButton(onClick = { context.startActivity(Intent(context, WebActivity::class.java)) }) {
                        Icon(Icons.Default.Language, contentDescription = null); Spacer(Modifier.size(8.dp)); Text("فتح المعرفة")
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickCard(title: String, subtitle: String, icon: ImageVector, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), onClick = onClick) {
        Row(Modifier.fillMaxWidth().padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Column {
                Text(title, fontWeight = FontWeight.Bold)
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun CareScreen(requestNotifications: ((Boolean) -> Unit) -> Unit) {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    var treatmentTitle by rememberSaveable { mutableStateOf("موعد علاج") }
    var treatmentNote by rememberSaveable { mutableStateOf("") }
    val treatments = remember(version) { LocalStore.treatments(context).filter { it.timeMillis > System.currentTimeMillis() } }

    fun addTreatment() {
        val now = Calendar.getInstance()
        DatePickerDialog(context, { _, year, month, day ->
            TimePickerDialog(context, { _, hour, minute ->
                val at = Calendar.getInstance().apply {
                    set(year, month, day, hour, minute, 0); set(Calendar.MILLISECOND, 0)
                }.timeInMillis
                if (at > System.currentTimeMillis()) {
                    val id = (((at / 60000L) xor treatmentTitle.hashCode().toLong()).toInt() and Int.MAX_VALUE).coerceAtLeast(1)
                    val reminder = TreatmentReminder(id, at, treatmentTitle.trim().ifBlank { "موعد علاج" }, treatmentNote.trim())
                    LocalStore.saveTreatment(context, reminder); TreatmentReminderScheduler.schedule(context, reminder); version++
                }
            }, now.get(Calendar.HOUR_OF_DAY), now.get(Calendar.MINUTE), false).show()
        }, now.get(Calendar.YEAR), now.get(Calendar.MONTH), now.get(Calendar.DAY_OF_MONTH)).show()
    }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { PageTitle("اهتم بي", "التذكيرات محلية وتحترم ساعات الصمت.") }
        item { ReminderConfig(ReminderType.BLINK, "ارمش الآن", listOf(20L, 30L, 45L, 60L), version, requestNotifications) { version++ } }
        item { ReminderConfig(ReminderType.MOVE, "قف وتحرك", listOf(45L, 60L, 90L, 120L), version, requestNotifications) { version++ } }
        item { ReminderConfig(ReminderType.WATER, "شرب الماء", listOf(60L, 90L, 120L, 180L), version, requestNotifications) { version++ } }
        item { ReminderConfig(ReminderType.MOTIVATION, "رسائل تحفيزية", listOf(120L, 180L, 240L, 360L), version, requestNotifications) { version++ } }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    val max = LocalStore.motivationMaxPerDay(context)
                    Text("الحد اليومي للرسائل: $max", fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { LocalStore.setMotivationMaxPerDay(context, max - 1); version++ }) { Text("−") }
                        OutlinedButton(onClick = { LocalStore.setMotivationMaxPerDay(context, max + 1); version++ }) { Text("+") }
                    }
                    Text("ساعات الصمت: ${LocalStore.quietStart(context)}:00 — ${LocalStore.quietEnd(context)}:00")
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { LocalStore.setQuietStart(context, (LocalStore.quietStart(context) + 1) % 24); version++ }) { Text("تأخير البداية") }
                        OutlinedButton(onClick = { LocalStore.setQuietEnd(context, (LocalStore.quietEnd(context) + 1) % 24); version++ }) { Text("تأخير النهاية") }
                    }
                }
            }
        }
        item { HorizontalDivider() }
        item { PageTitle("مواعيد العلاج", "موعد يضيفه المستخدم ويُحفظ على الهاتف.") }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(treatmentTitle, { treatmentTitle = it.take(80) }, label = { Text("اسم الموعد") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(treatmentNote, { treatmentNote = it.take(240) }, label = { Text("ملاحظة اختيارية") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = { requestNotifications { if (it) addTreatment() } }) {
                        Icon(Icons.Default.MedicalServices, contentDescription = null); Spacer(Modifier.size(8.dp)); Text("اختيار التاريخ والوقت")
                    }
                }
            }
        }
        if (treatments.isEmpty()) item { Text("لا توجد مواعيد قادمة محفوظة.") }
        items(treatments, key = { it.id }) { reminder ->
            Card {
                Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(reminder.title, fontWeight = FontWeight.Bold)
                    Text(DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(reminder.timeMillis)))
                    if (reminder.note.isNotBlank()) Text(reminder.note)
                    TextButton(onClick = {
                        TreatmentReminderScheduler.cancel(context, reminder); LocalStore.removeTreatment(context, reminder.id); version++
                    }) { Text("حذف") }
                }
            }
        }
    }
}

@Composable
private fun ReminderConfig(type: ReminderType, title: String, intervals: List<Long>, version: Int, requestNotifications: ((Boolean) -> Unit) -> Unit, changed: () -> Unit) {
    val context = LocalContext.current
    val enabled = remember(version) { LocalStore.reminderEnabled(context, type) }
    val selected = remember(version) { LocalStore.reminderMinutes(context, type) }
    Card {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(title, fontWeight = FontWeight.Bold)
                Switch(checked = enabled, onCheckedChange = { checked ->
                    if (!checked) {
                        LocalStore.setReminderEnabled(context, type, false); ReminderScheduler.sync(context, type); changed()
                    } else requestNotifications { granted ->
                        if (granted) { LocalStore.setReminderEnabled(context, type, true); ReminderScheduler.sync(context, type); changed() }
                    }
                })
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                intervals.forEach { minutes ->
                    FilterChip(selected = selected == minutes, onClick = {
                        LocalStore.setReminderMinutes(context, type, minutes); ReminderScheduler.sync(context, type); changed()
                    }, label = { Text(if (minutes < 60) "$minutes د" else "${minutes / 60} س") })
                }
            }
        }
    }
}

@Composable
private fun ToolsScreen() {
    val context = LocalContext.current
    var text by rememberSaveable { mutableStateOf("") }
    var lettingGo by remember { mutableStateOf(false) }
    var waterVersion by remember { mutableIntStateOf(0) }
    val alpha by animateFloatAsState(if (lettingGo) 0f else 1f, label = "vent-fade")
    LaunchedEffect(lettingGo) { if (lettingGo) { delay(700); text = ""; lettingGo = false } }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item { PageTitle("الأدوات", "أدوات صغيرة للحظة التي تحتاجها.") }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("فضفض ثم اتركها", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("لا تُحفظ في ملف أو خادم.")
                    OutlinedTextField(text, { if (!lettingGo) text = it.take(4000) }, label = { Text("اكتب ما في بالك") }, minLines = 6, modifier = Modifier.fillMaxWidth().alpha(alpha))
                    Button(enabled = text.isNotBlank() && !lettingGo, onClick = { lettingGo = true }) {
                        Icon(Icons.Default.DeleteForever, contentDescription = null); Spacer(Modifier.size(8.dp)); Text("دعها تذهب")
                    }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    val count = remember(waterVersion) { LocalStore.waterCountToday(context) }
                    Text("الماء اليوم", fontWeight = FontWeight.Bold)
                    Text("سجلت $count مرة. الرقم وصفي وليس هدفًا طبيًا.")
                    OutlinedButton(onClick = { LocalStore.recordWater(context); waterVersion++ }) { Text("شربت ماء") }
                }
            }
        }
    }
}

@Composable
private fun SafetyScreen() {
    val context = LocalContext.current
    var name by rememberSaveable { mutableStateOf(LocalStore.emergencyName(context)) }
    var contact by rememberSaveable { mutableStateOf(LocalStore.emergencyContact(context)) }
    var note by rememberSaveable { mutableStateOf(LocalStore.emergencyNote(context)) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item { PageTitle("الأمان", "بطاقة طوارئ محلية وأدوات تواصل باختيارك.") }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("جواز احتياجاتي", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("حدّد كيف تفضّل أن يتعامل معك الآخرون، ثم اختر كل معلومة تريد أن تظهر عند المشاركة.")
                    Button(onClick = { context.startActivity(Intent(context, SupportPassportActivity::class.java)) }) {
                        Text("فتح جواز احتياجاتي")
                    }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("بطاقة الطوارئ الأساسية", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(name, { name = it.take(80) }, label = { Text("الاسم") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(contact, { contact = it.take(80) }, label = { Text("جهة اتصال للطوارئ") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(note, { note = it.take(600) }, label = { Text("معلومة مهمة") }, minLines = 4, modifier = Modifier.fillMaxWidth())
                    Button(onClick = { LocalStore.saveEmergencyCard(context, name, contact, note) }) { Text("حفظ محلي") }
                    OutlinedButton(onClick = {
                        val shareText = "بطاقة روافد للطوارئ\nالاسم: $name\nجهة الاتصال: $contact\nمعلومة مهمة: $note"
                        context.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, shareText) }, "مشاركة بطاقة الطوارئ"))
                    }) {
                        Icon(Icons.Default.Share, contentDescription = null); Spacer(Modifier.size(6.dp)); Text("مشاركة")
                    }
                }
            }
        }
    }
}
