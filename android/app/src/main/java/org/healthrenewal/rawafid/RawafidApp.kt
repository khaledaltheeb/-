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
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.weight
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
import androidx.compose.material3.ExperimentalMaterial3Api
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
    var destination by rememberSaveable {
        mutableStateOf(Destination.entries.firstOrNull { it.key == initialDestination } ?: Destination.HOME)
    }
    Scaffold(
        bottomBar = {
            NavigationBar {
                Destination.entries.forEach { item ->
                    NavigationBarItem(
                        selected = destination == item,
                        onClick = {
                            if (item == Destination.KNOWLEDGE) context.startActivity(Intent(context, WebActivity::class.java))
                            else destination = item
                        },
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) }
                    )
                }
            }
        }
    ) { padding ->
        Surface(modifier = Modifier.fillMaxSize().padding(padding)) {
            when (destination) {
                Destination.HOME -> HomeScreen(onNavigate = { destination = it })
                Destination.CARE -> CareScreen(requestNotifications)
                Destination.TOOLS -> ToolsScreen()
                Destination.SAFETY -> SafetyScreen()
                Destination.KNOWLEDGE -> HomeScreen(onNavigate = { destination = it })
            }
        }
    }
}

@Composable
private fun PageTitle(title: String, subtitle: String) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun HomeScreen(onNavigate: (Destination) -> Unit) {
    val context = LocalContext.current
    var waterVersion by remember { mutableIntStateOf(0) }
    var hint by remember { mutableStateOf("اختر ما تحتاجه الآن؛ ليس مطلوبًا أن تستخدم كل شيء.") }
    val water = remember(waterVersion) { LocalStore.waterCountToday(context) }
    LazyColumn(
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("روافد", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("ماذا تحتاج اليوم؟", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text("الصحة اليومية، الأمان، المعرفة والأدوات في مكان واحد.")
                }
            }
        }
        item { PageTitle("وصول سريع", hint) }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                QuickCard("ارمش الآن", "راحة قصيرة للعين", Icons.Default.Visibility, Modifier.weight(1f)) {
                    hint = "ارمش عدة مرات وانظر بعيدًا عن الشاشة للحظات. يمكنك ضبط تذكير تلقائي من «اهتم بي»."
                }
                QuickCard("شربت ماء", "$water مرة اليوم", Icons.Default.WaterDrop, Modifier.weight(1f)) {
                    LocalStore.recordWater(context); waterVersion++
                    hint = "تم تسجيل الماء محليًا على هذا الهاتف."
                }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                QuickCard("تحرك", "قف وتحرك قليلًا", Icons.Default.DirectionsWalk, Modifier.weight(1f)) {
                    hint = "قف، حرّك كتفيك، امشِ قليلًا وخذ عدة أنفاس هادئة."
                }
                QuickCard("فضفض", "اكتب ثم دعها تذهب", Icons.Default.AutoAwesome, Modifier.weight(1f)) {
                    onNavigate(Destination.TOOLS)
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("اهتم بي", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("اضبط وتيرة تنبيهات العين والحركة والماء والرسائل الداعمة، وحدد ساعات لا تريد فيها أي إزعاج.")
                    Button(onClick = { onNavigate(Destination.CARE) }) { Text("ضبط اهتم بي") }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("موقع روافد داخل التطبيق", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("الموقع هو محرك المعرفة: الأدلة، المقالات، الموسوعة، القطاعات والمختصون؛ بينما تبقى أدوات الهاتف محلية قدر الإمكان.")
                    OutlinedButton(onClick = { context.startActivity(Intent(context, WebActivity::class.java)) }) {
                        Icon(Icons.Default.Language, contentDescription = null)
                        Spacer(Modifier.size(8.dp))
                        Text("فتح المعرفة")
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickCard(title: String, subtitle: String, icon: ImageVector, modifier: Modifier, onClick: () -> Unit) {
    Card(modifier = modifier, onClick = onClick) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Text(title, fontWeight = FontWeight.Bold)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
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
                    set(year, month, day, hour, minute, 0)
                    set(Calendar.MILLISECOND, 0)
                }.timeInMillis
                if (at > System.currentTimeMillis()) {
                    val id = (((at / 60000L) xor treatmentTitle.hashCode().toLong()).toInt() and Int.MAX_VALUE).coerceAtLeast(1)
                    val reminder = TreatmentReminder(id, at, treatmentTitle.trim().ifBlank { "موعد علاج" }, treatmentNote.trim())
                    LocalStore.saveTreatment(context, reminder)
                    TreatmentReminderScheduler.schedule(context, reminder)
                    version++
                }
            }, now.get(Calendar.HOUR_OF_DAY), now.get(Calendar.MINUTE), false).show()
        }, now.get(Calendar.YEAR), now.get(Calendar.MONTH), now.get(Calendar.DAY_OF_MONTH)).show()
    }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { PageTitle("اهتم بي", "أنت تحدد ما تريد، وعدد المرات، وساعات الصمت. لا تحتاج هذه التذكيرات إلى Supabase أو Cloudflare.") }
        item { ReminderConfig(ReminderType.BLINK, "ارمش الآن", "إراحة العين من الشاشة", listOf(20L, 30L, 45L, 60L), version, requestNotifications) { version++ } }
        item { ReminderConfig(ReminderType.MOVE, "قف وتحرك", "وقفة حركة وتنفس", listOf(45L, 60L, 90L, 120L), version, requestNotifications) { version++ } }
        item { ReminderConfig(ReminderType.WATER, "شرب الماء", "تذكير مرن وليس هدفًا طبيًا", listOf(60L, 90L, 120L, 180L), version, requestNotifications) { version++ } }
        item { ReminderConfig(ReminderType.MOTIVATION, "رسائل تحفيزية", "تحدد أنت كل كم ساعة والحد اليومي", listOf(120L, 180L, 240L, 360L), version, requestNotifications) { version++ } }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("الحد اليومي للرسائل التحفيزية", fontWeight = FontWeight.Bold)
                    var max by remember(version) { mutableIntStateOf(LocalStore.motivationMaxPerDay(context)) }
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(onClick = { max = (max - 1).coerceAtLeast(1); LocalStore.setMotivationMaxPerDay(context, max); version++ }) { Text("−") }
                        Text("$max رسائل", modifier = Modifier.padding(top = 12.dp))
                        OutlinedButton(onClick = { max = (max + 1).coerceAtMost(12); LocalStore.setMotivationMaxPerDay(context, max); version++ }) { Text("+") }
                    }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("ساعات الصمت", fontWeight = FontWeight.Bold)
                    Text("لن تظهر تذكيرات اهتم بي داخل هذا النطاق.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    HourControl("من", LocalStore.quietStart(context)) { LocalStore.setQuietStart(context, it); version++ }
                    HourControl("إلى", LocalStore.quietEnd(context)) { LocalStore.setQuietEnd(context, it); version++ }
                }
            }
        }
        item { HorizontalDivider() }
        item { PageTitle("مواعيد العلاج", "احفظ موعدك على الهاتف وسيذكرك Android. قد يطبق النظام تأخيرًا طفيفًا إذا لم تكن صلاحية المنبّه الدقيق متاحة.") }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(value = treatmentTitle, onValueChange = { treatmentTitle = it.take(80) }, label = { Text("اسم الموعد") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = treatmentNote, onValueChange = { treatmentNote = it.take(240) }, label = { Text("ملاحظة اختيارية") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = { requestNotifications { granted -> if (granted) addTreatment() } }) {
                        Icon(Icons.Default.MedicalServices, contentDescription = null)
                        Spacer(Modifier.size(8.dp))
                        Text("اختيار التاريخ والوقت")
                    }
                }
            }
        }
        if (treatments.isEmpty()) item { Text("لا توجد مواعيد قادمة محفوظة.", color = MaterialTheme.colorScheme.onSurfaceVariant) }
        items(treatments, key = { it.id }) { reminder ->
            Card {
                Row(Modifier.fillMaxWidth().padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column(Modifier.weight(1f)) {
                        Text(reminder.title, fontWeight = FontWeight.Bold)
                        Text(DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(reminder.timeMillis)))
                        if (reminder.note.isNotBlank()) Text(reminder.note, style = MaterialTheme.typography.bodySmall)
                    }
                    TextButton(onClick = {
                        TreatmentReminderScheduler.cancel(context, reminder)
                        LocalStore.removeTreatment(context, reminder.id)
                        version++
                    }) { Text("حذف") }
                }
            }
        }
    }
}

@Composable
private fun ReminderConfig(type: ReminderType, title: String, subtitle: String, intervals: List<Long>, version: Int, requestNotifications: ((Boolean) -> Unit) -> Unit, changed: () -> Unit) {
    val context = LocalContext.current
    val enabled = remember(version) { LocalStore.reminderEnabled(context, type) }
    val selected = remember(version) { LocalStore.reminderMinutes(context, type) }
    Card {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column(Modifier.weight(1f)) {
                    Text(title, fontWeight = FontWeight.Bold)
                    Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Switch(checked = enabled, onCheckedChange = { checked ->
                    if (!checked) {
                        LocalStore.setReminderEnabled(context, type, false); ReminderScheduler.sync(context, type); changed()
                    } else requestNotifications { granted ->
                        if (granted) {
                            LocalStore.setReminderEnabled(context, type, true); ReminderScheduler.sync(context, type); changed()
                        }
                    }
                })
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                intervals.forEach { minutes ->
                    FilterChip(
                        selected = selected == minutes,
                        onClick = { LocalStore.setReminderMinutes(context, type, minutes); ReminderScheduler.sync(context, type); changed() },
                        label = { Text(if (minutes < 60) "$minutes د" else if (minutes % 60L == 0L) "${minutes / 60} س" else "${minutes / 60}س ${minutes % 60}د") }
                    )
                }
            }
        }
    }
}

@Composable
private fun HourControl(label: String, value: Int, onChange: (Int) -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text("$label ${value.toString().padStart(2, '0')}:00", modifier = Modifier.padding(top = 12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            OutlinedButton(onClick = { onChange((value + 23) % 24) }) { Text("−") }
            OutlinedButton(onClick = { onChange((value + 1) % 24) }) { Text("+") }
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
    LaunchedEffect(lettingGo) {
        if (lettingGo) {
            delay(700)
            text = ""
            lettingGo = false
        }
    }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item { PageTitle("الأدوات", "أدوات صغيرة تُستخدم في اللحظة التي تحتاجها، لا صفحات مزدحمة.") }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("فضفض ثم اتركها", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("النص يبقى في ذاكرة الشاشة فقط ولا يُحفظ في ملف أو خادم. عند المغادرة أو الضغط على «دعها تذهب» يختفي.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    OutlinedTextField(
                        value = text,
                        onValueChange = { if (!lettingGo) text = it.take(4000) },
                        label = { Text("اكتب ما في بالك") },
                        minLines = 6,
                        modifier = Modifier.fillMaxWidth().alpha(alpha)
                    )
                    Button(enabled = text.isNotBlank() && !lettingGo, onClick = { lettingGo = true }) {
                        Icon(Icons.Default.DeleteForever, contentDescription = null)
                        Spacer(Modifier.size(8.dp))
                        Text("دعها تذهب")
                    }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    val count = remember(waterVersion) { LocalStore.waterCountToday(context) }
                    Text("الماء اليوم", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("سجلت $count مرة. لا يحول التطبيق هذا الرقم إلى وصفة طبية لأن احتياج السوائل يختلف حسب الحالة.")
                    OutlinedButton(onClick = { LocalStore.recordWater(context); waterVersion++ }) {
                        Icon(Icons.Default.WaterDrop, contentDescription = null)
                        Spacer(Modifier.size(8.dp))
                        Text("شربت ماء")
                    }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("دقيقة لي", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("ارمش، حرّك كتفيك، خذ عدة أنفاس هادئة، ثم اسأل نفسك: ما الشيء الواحد الذي أحتاجه الآن؟")
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
    var saved by remember { mutableStateOf(false) }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item { PageTitle("الأمان", "ابدأ ببطاقة طوارئ محلية بسيطة. سنوسع هذا القسم إلى Life Card وMy Circle وSupport Passport.") }
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("بطاقتي للطوارئ", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    OutlinedTextField(value = name, onValueChange = { name = it.take(80) }, label = { Text("الاسم أو الاسم الذي تريد عرضه") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = contact, onValueChange = { contact = it.take(80) }, label = { Text("جهة اتصال للطوارئ") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = note, onValueChange = { note = it.take(600) }, label = { Text("معلومة مهمة: حساسية، حالة، طريقة مساعدة...") }, minLines = 4, modifier = Modifier.fillMaxWidth())
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(onClick = { LocalStore.saveEmergencyCard(context, name, contact, note); saved = true }) { Text("حفظ محلي") }
                        OutlinedButton(onClick = {
                            val shareText = buildString {
                                append("بطاقة روافد للطوارئ\n")
                                if (name.isNotBlank()) append("الاسم: $name\n")
                                if (contact.isNotBlank()) append("جهة الاتصال: $contact\n")
                                if (note.isNotBlank()) append("معلومة مهمة: $note")
                            }
                            context.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"; putExtra(Intent.EXTRA_TEXT, shareText)
                            }, "مشاركة بطاقة الطوارئ"))
                        }) {
                            Icon(Icons.Default.Share, contentDescription = null)
                            Spacer(Modifier.size(6.dp))
                            Text("مشاركة")
                        }
                    }
                    if (saved) Text("تم الحفظ على هذا الهاتف.", color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}
