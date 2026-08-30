package org.healthrenewal.rawafid

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import java.text.DateFormat
import java.util.Calendar
import java.util.Date

private enum class ShellTab(val key: String, val label: String, val icon: ImageVector) {
    TODAY("today", "اليوم", Icons.Default.Home),
    HEALTH("health", "صحتي", Icons.Default.MedicalServices),
    SAFETY("safety", "الأمان", Icons.Default.Security),
    LIFE("life", "حياتي", Icons.Default.Favorite),
    MORE("more", "حسابي", Icons.Default.AccountCircle)
}

object HomePreferenceStore {
    private const val PREFS = "rawafid_home_preferences_v1"
    private const val KEY = "categories"
    private val defaults = setOf("daily", "health", "wellbeing", "safety", "knowledge", "family")

    fun selected(context: Context): Set<String> =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getStringSet(KEY, defaults)?.toSet() ?: defaults

    fun save(context: Context, value: Set<String>) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putStringSet(KEY, value).apply()
    }
}

@Composable
fun RawafidAdaptiveShell(initialDestination: String = "home") {
    val initial = when (initialDestination) {
        "health" -> ShellTab.HEALTH
        "tools" -> ShellTab.LIFE
        "safety" -> ShellTab.SAFETY
        "knowledge" -> ShellTab.MORE
        else -> ShellTab.TODAY
    }
    var tab by remember { mutableStateOf(initial) }

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val expanded = maxWidth >= 760.dp
        if (expanded) {
            Row(Modifier.fillMaxSize()) {
                NavigationRail {
                    Spacer(Modifier.size(RawafidSpacing.Md))
                    ShellTab.entries.forEach { item ->
                        NavigationRailItem(
                            selected = tab == item,
                            onClick = { tab = item },
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) },
                            alwaysShowLabel = true
                        )
                    }
                }
                Surface(Modifier.weight(1f)) {
                    ShellContent(tab = tab, expanded = true, onNavigate = { tab = it })
                }
            }
        } else {
            Scaffold(
                bottomBar = {
                    NavigationBar {
                        ShellTab.entries.forEach { item ->
                            NavigationBarItem(
                                selected = tab == item,
                                onClick = { tab = item },
                                icon = { Icon(item.icon, contentDescription = item.label) },
                                label = { Text(item.label) }
                            )
                        }
                    }
                }
            ) { padding ->
                Box(Modifier.fillMaxSize().padding(padding)) {
                    ShellContent(tab = tab, expanded = false, onNavigate = { tab = it })
                }
            }
        }
    }
}

@Composable
private fun ShellContent(tab: ShellTab, expanded: Boolean, onNavigate: (ShellTab) -> Unit) {
    when (tab) {
        ShellTab.TODAY -> TodayScreen(expanded = expanded, onNavigate = onNavigate)
        ShellTab.HEALTH -> HealthScreen(expanded = expanded)
        ShellTab.SAFETY -> SafetyScreen(expanded = expanded)
        ShellTab.LIFE -> LifeScreen(expanded = expanded)
        ShellTab.MORE -> MoreScreen(expanded = expanded, onNavigate = onNavigate)
    }
}

@Composable
private fun TodayScreen(expanded: Boolean, onNavigate: (ShellTab) -> Unit) {
    val context = LocalContext.current
    var refresh by remember { mutableIntStateOf(0) }
    val all = remember { FeatureCatalog.visible(context) }
    val selected = remember(refresh) { HomePreferenceStore.selected(context) }
    val water = remember(refresh) { LocalStore.waterCountToday(context) }
    val safe = remember(refresh) { SafeArrivalStore.load(context) }
    val meds = remember(refresh) { MedicationStore.medications(context) }
    val taken = remember(refresh) { meds.count { MedicationStore.todayStatus(context, it.id) == "أخذته" } }
    val nextAppointment = remember(refresh) {
        LocalStore.treatments(context)
            .filter { it.timeMillis > System.currentTimeMillis() }
            .minByOrNull { it.timeMillis }
    }
    val familyOpen = remember(refresh) { FamilyHubStore.tasks(context).count { !it.done } }
    val recommended = remember(selected, all) {
        all.filter { it.category in selected && it.id !in setOf("site_entry", "knowledge_daily_tools") }
            .sortedByDescending { it.priority }
            .take(8)
    }
    val greeting = remember {
        when (Calendar.getInstance().get(Calendar.HOUR_OF_DAY)) {
            in 5..11 -> "صباح الخير"
            in 12..17 -> "أهلًا بك"
            else -> "مساء الخير"
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            horizontal = if (expanded) RawafidSpacing.Xxl else RawafidSpacing.ScreenHorizontal,
            vertical = RawafidSpacing.ScreenVertical
        ),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.SectionGap)
    ) {
        item {
            TodayHero(
                greeting = greeting,
                onHelp = { openFeature(context, all, "help_now") },
                onAllTools = { context.startActivity(Intent(context, ToolCatalogActivity::class.java)) }
            )
        }

        item {
            AccountCircleGatewayCard(context = context, features = all)
        }

        item {
            SectionHeader("أحتاج الآن", "اختصارات مباشرة لأكثر الأفعال استخدامًا")
        }
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                val ids = listOf("help_now", "what_now", "medication_companion", "one_minute", "support_passport")
                items(ids.mapNotNull { id -> all.firstOrNull { it.id == id } }, key = { it.id }) { feature ->
                    QuickActionTile(feature)
                }
            }
        }

        item {
            SectionHeader("اليوم", "لمحة مختصرة لما سجلته وما يحتاج انتباهك")
        }
        item {
            DashboardMetrics(
                expanded = expanded,
                water = water,
                medicationValue = if (meds.isEmpty()) "—" else "$taken/${meds.size}",
                appointmentValue = nextAppointment?.let { DateFormat.getDateInstance(DateFormat.SHORT).format(Date(it.timeMillis)) } ?: "لا يوجد",
                familyValue = familyOpen.toString(),
                onWater = {
                    LocalStore.recordWater(context)
                    RawafidWidgetProvider.updateAll(context)
                    refresh++
                },
                onMedication = { openFeature(context, all, "medication_companion") },
                onAppointment = { openFeature(context, all, "appointment_companion") },
                onFamily = { openFeature(context, all, "family_hub") }
            )
        }

        item {
            NextActionCard(
                safeActive = safe.active,
                nextAppointmentTitle = nextAppointment?.title,
                nextAppointmentTime = nextAppointment?.timeMillis,
                onSafeArrival = { openFeature(context, all, "safe_arrival") },
                onAppointment = { openFeature(context, all, "appointment_companion") },
                onRoutines = { openFeature(context, all, "routines") }
            )
        }

        item {
            SectionHeader("مقترح لك", "بناءً على المجالات التي اخترتها في إعداداتك")
        }
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                items(recommended, key = { it.id }) { feature ->
                    RecommendationCard(feature)
                }
            }
        }

        item {
            SectionHeader("استكشف", "انتقل إلى المجال الذي تحتاجه بدل تصفح قائمة طويلة")
        }
        item {
            DiscoveryGrid(
                expanded = expanded,
                onHealth = { onNavigate(ShellTab.HEALTH) },
                onSafety = { onNavigate(ShellTab.SAFETY) },
                onLife = { onNavigate(ShellTab.LIFE) },
                onKnowledge = { openFeature(context, all, "knowledge_home") }
            )
        }
    }
}

@Composable
private fun TodayHero(greeting: String, onHelp: () -> Unit, onAllTools: () -> Unit) {
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
            Text("روافد", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
            Text(greeting, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text(
                "اختر ما تحتاجه الآن. الصحة والأمان والحياة اليومية في مسارات واضحة دون ازدحام.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
            ) {
                Button(onClick = onHelp) { Text("ساعدني الآن") }
                OutlinedButton(onClick = onAllTools) { Text("كل الأدوات") }
            }
        }
    }
}

@Composable
private fun AccountCircleGatewayCard(context: Context, features: List<RawafidFeature>) {
    val signedIn = RawafidCircleApi.hasSession(context)
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)
    ) {
        Column(
            Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
            verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.AccountCircle, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xxs)) {
                    Text("حسابي ودائرتي", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(
                        if (signedIn) "حسابك مسجّل. اعرض رقم RFD واربط الأشخاص والجهات الموثوقة بموافقتهم."
                        else "ابدأ هنا: أنشئ حساب روافد للحصول على رقم RFD، ثم استخدمه لربط الأشخاص والجهات الموثوقة."
                    )
                }
            }
            Text(
                "إنشاء الحساب ← الحصول على رقم RFD ← إرسال أو قبول طلب الربط ← اختيار الصلاحيات.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onTertiaryContainer
            )
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
            ) {
                Button(onClick = { openFeature(context, features, "rawafid_account") }) {
                    Text(if (signedIn) "إدارة حسابي" else "إنشاء حساب / دخول")
                }
                OutlinedButton(onClick = { openFeature(context, features, "my_circle") }) {
                    Text("رقمي وربط الجهات")
                }
            }
        }
    }
}

@Composable
private fun DashboardMetrics(
    expanded: Boolean,
    water: Int,
    medicationValue: String,
    appointmentValue: String,
    familyValue: String,
    onWater: () -> Unit,
    onMedication: () -> Unit,
    onAppointment: () -> Unit,
    onFamily: () -> Unit
) {
    val cards = listOf(
        MetricSpec("الماء", water.toString(), "سجّل كوبًا", Icons.Default.WaterDrop, onWater),
        MetricSpec("العلاج اليوم", medicationValue, "فتح العلاج", Icons.Default.MedicalServices, onMedication),
        MetricSpec("الموعد القادم", appointmentValue, "فتح المواعيد", Icons.Default.Visibility, onAppointment),
        MetricSpec("مهام الأسرة", familyValue, "فتح الأسرة", Icons.Default.Favorite, onFamily)
    )
    if (expanded) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
            cards.forEach { spec -> MetricCard(spec, Modifier.weight(1f)) }
        }
    } else {
        Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
            cards.chunked(2).forEach { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    row.forEach { spec -> MetricCard(spec, Modifier.weight(1f)) }
                    if (row.size == 1) Spacer(Modifier.weight(1f))
                }
            }
        }
    }
}

private data class MetricSpec(
    val label: String,
    val value: String,
    val action: String,
    val icon: ImageVector,
    val onClick: () -> Unit
)

@Composable
private fun MetricCard(spec: MetricSpec, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.heightIn(min = 132.dp),
        onClick = spec.onClick,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f))
    ) {
        Column(
            Modifier.fillMaxWidth().padding(RawafidSpacing.Md),
            verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
        ) {
            Icon(spec.icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Text(spec.value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text(spec.label, style = MaterialTheme.typography.bodyMedium)
            Text(spec.action, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
        }
    }
}

@Composable
private fun NextActionCard(
    safeActive: Boolean,
    nextAppointmentTitle: String?,
    nextAppointmentTime: Long?,
    onSafeArrival: () -> Unit,
    onAppointment: () -> Unit,
    onRoutines: () -> Unit
) {
    val title: String
    val body: String
    val button: String
    val onClick: () -> Unit
    val container: Color

    when {
        safeActive -> {
            title = "فحص الأمان نشط"
            body = "«وصلت بالسلامة» يعمل الآن. افتحه لتأكيد وصولك أو مراجعة الوقت المحدد."
            button = "فتح فحص الأمان"
            onClick = onSafeArrival
            container = MaterialTheme.colorScheme.tertiaryContainer
        }
        nextAppointmentTitle != null && nextAppointmentTime != null -> {
            title = "التالي: $nextAppointmentTitle"
            body = DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(nextAppointmentTime))
            button = "جهّز الموعد"
            onClick = onAppointment
            container = MaterialTheme.colorScheme.primaryContainer
        }
        else -> {
            title = "لا يوجد شيء عاجل محفوظ"
            body = "يمكنك بدء روتين قصير أو ترك الصفحة كما هي. لا تحتاج إلى ملء يومك بالمهام."
            button = "فتح روتيناتي"
            onClick = onRoutines
            container = MaterialTheme.colorScheme.secondaryContainer
        }
    }

    Card(colors = CardDefaults.cardColors(containerColor = container)) {
        Column(Modifier.padding(RawafidSpacing.Lg), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
            Text("التالي", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(body)
            Button(onClick = onClick) { Text(button) }
        }
    }
}

@Composable
private fun QuickActionTile(feature: RawafidFeature) {
    val context = LocalContext.current
    Surface(
        modifier = Modifier.width(164.dp).heightIn(min = 126.dp),
        shape = MaterialTheme.shapes.large,
        tonalElevation = 2.dp,
        onClick = { FeatureRouter.open(context, feature) }
    ) {
        Column(
            Modifier.padding(RawafidSpacing.Md),
            verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
        ) {
            Surface(shape = CircleShape, color = featureContainerColor(feature)) {
                Box(Modifier.size(42.dp), contentAlignment = Alignment.Center) {
                    Icon(featureIcon(feature), contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                }
            }
            Text(feature.title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun RecommendationCard(feature: RawafidFeature) {
    val context = LocalContext.current
    Card(
        modifier = Modifier.width(270.dp).heightIn(min = 165.dp),
        onClick = { FeatureRouter.open(context, feature) }
    ) {
        Column(Modifier.padding(RawafidSpacing.Lg), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
            Surface(shape = CircleShape, color = featureContainerColor(feature)) {
                Box(Modifier.size(44.dp), contentAlignment = Alignment.Center) {
                    Icon(featureIcon(feature), contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                }
            }
            Text(feature.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(feature.subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun HealthScreen(expanded: Boolean) {
    val context = LocalContext.current
    val all = remember { FeatureCatalog.visible(context) }
    val features = remember(all) { all.filter { it.category == "health" }.sortedByDescending { it.priority } }

    DomainScreen(
        title = "صحتي",
        subtitle = "العلاج والمواعيد والسجل الصحي والملفات في مكان واحد.",
        heroTitle = "تابع ما يخص صحتك دون تشخيص أو تخمين",
        heroBody = "سجّل ما تعرفه، راجع ما حدث، وجهّز المعلومات التي تحتاجها عند زيارة المختص.",
        features = features,
        expanded = expanded
    )
}

@Composable
private fun SafetyScreen(expanded: Boolean) {
    val context = LocalContext.current
    val all = remember { FeatureCatalog.visible(context) }
    val features = remember(all) { all.filter { it.category == "safety" }.sortedByDescending { it.priority } }
    val help = all.firstOrNull { it.id == "help_now" }
    val whatNow = all.firstOrNull { it.id == "what_now" }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            horizontal = if (expanded) RawafidSpacing.Xxl else RawafidSpacing.ScreenHorizontal,
            vertical = RawafidSpacing.ScreenVertical
        ),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.SectionGap)
    ) {
        item {
            Box(
                Modifier
                    .fillMaxWidth()
                    .clip(MaterialTheme.shapes.extraLarge)
                    .background(MaterialTheme.colorScheme.errorContainer)
                    .padding(RawafidSpacing.Xl)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("الأمان", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.error)
                    Text("إذا كنت تحتاج خطوة الآن", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text("ابدأ بالموقف الأقرب لك. لا تحتاج إلى معرفة اسم الحالة أو تشخيص السبب.")
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
                    ) {
                        if (help != null) Button(onClick = { FeatureRouter.open(context, help) }) { Text("ساعدني الآن") }
                        if (whatNow != null) OutlinedButton(onClick = { FeatureRouter.open(context, whatNow) }) { Text("ماذا أفعل الآن؟") }
                    }
                }
            }
        }
        item { SectionHeader("أدوات الأمان", "اختر الوظيفة مباشرة") }
        item { ResponsiveFeatureGrid(features, expanded) }
    }
}

@Composable
private fun LifeScreen(expanded: Boolean) {
    val context = LocalContext.current
    val all = remember { FeatureCatalog.visible(context) }
    val groups = listOf(
        Triple("يومي وراحتي", "روتينات، تذكيرات، تركيز واستراحات قصيرة.", setOf("daily", "wellbeing")),
        Triple("التنظيم والذاكرة", "أشياء تريد تذكرها أو إنجازها دون تعقيد.", setOf("planning", "memory")),
        Triple("الأسرة والرعاية", "الأشخاص والمهام وأنماط الرعاية التي تتابعها.", setOf("family")),
        Triple("قطاع المرأة", "التقويم والعناية والمتابعة والخصوصية.", setOf("women"))
    )

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            horizontal = if (expanded) RawafidSpacing.Xxl else RawafidSpacing.ScreenHorizontal,
            vertical = RawafidSpacing.ScreenVertical
        ),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.SectionGap)
    ) {
        item { PageHeader("حياتي", "الأدوات اليومية مرتبة حسب الهدف، لا حسب اسم الميزة.") }
        groups.forEach { (title, subtitle, categories) ->
            val features = all.filter { it.category in categories }.sortedByDescending { it.priority }
            if (features.isNotEmpty()) {
                item(key = "header_$title") { SectionHeader(title, subtitle) }
                item(key = "grid_$title") { ResponsiveFeatureGrid(features, expanded) }
            }
        }
    }
}

@Composable
private fun MoreScreen(expanded: Boolean, onNavigate: (ShellTab) -> Unit) {
    val context = LocalContext.current
    val all = remember { FeatureCatalog.visible(context) }
    var selected by remember { mutableStateOf(HomePreferenceStore.selected(context)) }
    val categories = listOf(
        "daily" to "اليوميات",
        "health" to "الصحة",
        "wellbeing" to "الهدوء",
        "family" to "الأسرة",
        "safety" to "الأمان",
        "accessibility" to "الوصولية",
        "women" to "المرأة",
        "planning" to "التنظيم",
        "memory" to "الذاكرة",
        "knowledge" to "المعرفة"
    )

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            horizontal = if (expanded) RawafidSpacing.Xxl else RawafidSpacing.ScreenHorizontal,
            vertical = RawafidSpacing.ScreenVertical
        ),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.SectionGap)
    ) {
        item { PageHeader("حسابي والمزيد", "الحساب، رقم RFD، ربط الأشخاص والجهات الموثوقة، ثم الإعدادات والمعرفة.") }

        item {
            AccountCircleGatewayCard(context = context, features = all)
        }

        item {
            Box(
                Modifier
                    .fillMaxWidth()
                    .clip(MaterialTheme.shapes.extraLarge)
                    .background(
                        Brush.linearGradient(
                            listOf(
                                MaterialTheme.colorScheme.secondaryContainer,
                                MaterialTheme.colorScheme.primaryContainer
                            )
                        )
                    )
                    .padding(RawafidSpacing.Xl)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Icon(Icons.Default.Public, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Text("معرفة روافد", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("افتح الموسوعة والأدلة والقطاعات المنشورة على Health Renewal.")
                    Button(onClick = { openFeature(context, all, "knowledge_home") }) { Text("فتح المعرفة") }
                }
            }
        }

        item { SectionHeader("إعداداتي", "تحكم بالمظهر والوصولية وما يظهر في الصفحة الرئيسية") }
        item {
            ResponsiveFeatureGrid(
                listOfNotNull(
                    all.firstOrNull { it.id == "accessibility_profile" },
                    all.firstOrNull { it.id == "support_passport" },
                    all.firstOrNull { it.id == "life_vault" }
                ),
                expanded
            )
        }

        item {
            Card {
                Column(Modifier.padding(RawafidSpacing.Lg), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text("ما الذي تريد أن يظهر لك أكثر؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("تُستخدم هذه الاختيارات محليًا لترتيب اقتراحات «اليوم». يمكنك تغييرها في أي وقت.")
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)
                    ) {
                        categories.forEach { (id, label) ->
                            FilterChip(
                                selected = id in selected,
                                onClick = {
                                    selected = if (id in selected) selected - id else selected + id
                                    HomePreferenceStore.save(context, selected)
                                },
                                label = { Text(label) }
                            )
                        }
                    }
                }
            }
        }

        item {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm),
                verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
            ) {
                OutlinedButton(onClick = { context.startActivity(Intent(context, ToolCatalogActivity::class.java)) }) {
                    Icon(Icons.Default.Build, contentDescription = null)
                    Spacer(Modifier.size(RawafidSpacing.Xs))
                    Text("كل الأدوات")
                }
                OutlinedButton(onClick = { onNavigate(ShellTab.TODAY) }) { Text("العودة إلى اليوم") }
            }
        }
    }
}

@Composable
private fun DomainScreen(
    title: String,
    subtitle: String,
    heroTitle: String,
    heroBody: String,
    features: List<RawafidFeature>,
    expanded: Boolean
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            horizontal = if (expanded) RawafidSpacing.Xxl else RawafidSpacing.ScreenHorizontal,
            vertical = RawafidSpacing.ScreenVertical
        ),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.SectionGap)
    ) {
        item { PageHeader(title, subtitle) }
        item {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                Column(Modifier.padding(RawafidSpacing.Xl), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                    Text(heroTitle, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(heroBody, color = MaterialTheme.colorScheme.onPrimaryContainer)
                }
            }
        }
        item { SectionHeader("الأدوات", "اختر ما تريد فعله الآن") }
        item { ResponsiveFeatureGrid(features, expanded) }
    }
}

@Composable
private fun ResponsiveFeatureGrid(features: List<RawafidFeature>, expanded: Boolean) {
    if (features.isEmpty()) {
        EmptyState("لا توجد أدوات متاحة في هذا القسم الآن.")
        return
    }
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val columns = when {
            maxWidth < 360.dp -> 1
            expanded || maxWidth >= 760.dp -> 3
            else -> 2
        }
        val gap = RawafidSpacing.Sm
        val cardWidth = (maxWidth - (gap * (columns - 1))) / columns
        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(gap),
            verticalArrangement = Arrangement.spacedBy(gap)
        ) {
            features.forEach { feature ->
                FeatureGridCard(feature, Modifier.width(cardWidth))
            }
        }
    }
}

@Composable
private fun FeatureGridCard(feature: RawafidFeature, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    Card(
        modifier = modifier.heightIn(min = 168.dp),
        onClick = { FeatureRouter.open(context, feature) },
        colors = CardDefaults.cardColors(containerColor = featureContainerColor(feature).copy(alpha = 0.68f))
    ) {
        Column(Modifier.padding(RawafidSpacing.Md), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
            Surface(shape = CircleShape, color = MaterialTheme.colorScheme.surface.copy(alpha = 0.75f)) {
                Box(Modifier.size(44.dp), contentAlignment = Alignment.Center) {
                    Icon(featureIcon(feature), contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                }
            }
            Text(feature.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(
                feature.subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun DiscoveryGrid(
    expanded: Boolean,
    onHealth: () -> Unit,
    onSafety: () -> Unit,
    onLife: () -> Unit,
    onKnowledge: () -> Unit
) {
    val items = listOf(
        DiscoverySpec("صحتي", "العلاج والمواعيد والسجل", Icons.Default.MedicalServices, onHealth),
        DiscoverySpec("الأمان", "المساعدة والحالات العاجلة", Icons.Default.Security, onSafety),
        DiscoverySpec("حياتي", "الروتين والأسرة والذاكرة", Icons.Default.Favorite, onLife),
        DiscoverySpec("المعرفة", "الموسوعة والأدلة والقطاعات", Icons.Default.Public, onKnowledge)
    )
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val columns = if (expanded || maxWidth >= 720.dp) 4 else 2
        val gap = RawafidSpacing.Sm
        val cardWidth = (maxWidth - (gap * (columns - 1))) / columns
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(gap),
            verticalArrangement = Arrangement.spacedBy(gap)
        ) {
            items.forEach { spec ->
                Card(modifier = Modifier.width(cardWidth).heightIn(min = 130.dp), onClick = spec.onClick) {
                    Column(Modifier.padding(RawafidSpacing.Md), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Icon(spec.icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Text(spec.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(spec.subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

private data class DiscoverySpec(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val onClick: () -> Unit
)

@Composable
private fun PageHeader(title: String, subtitle: String) {
    Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
        Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Text(subtitle, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun SectionHeader(title: String, subtitle: String) {
    Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xxs)) {
        Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun EmptyState(message: String) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))) {
        Text(
            message,
            modifier = Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun featureContainerColor(feature: RawafidFeature): Color = when (feature.category) {
    "safety" -> MaterialTheme.colorScheme.errorContainer
    "health" -> MaterialTheme.colorScheme.primaryContainer
    "wellbeing" -> MaterialTheme.colorScheme.secondaryContainer
    "family", "women" -> MaterialTheme.colorScheme.tertiaryContainer
    "knowledge" -> MaterialTheme.colorScheme.secondaryContainer
    else -> MaterialTheme.colorScheme.surfaceVariant
}

private fun featureIcon(feature: RawafidFeature): ImageVector = when {
    feature.id == "help_now" || feature.id == "what_now" || feature.category == "safety" -> Icons.Default.Security
    feature.category == "health" -> Icons.Default.MedicalServices
    feature.category == "knowledge" -> Icons.Default.Public
    feature.category == "family" || feature.category == "women" -> Icons.Default.Favorite
    feature.category == "accessibility" -> Icons.Default.Visibility
    else -> Icons.Default.Build
}

private fun openFeature(context: Context, features: List<RawafidFeature>, id: String) {
    features.firstOrNull { it.id == id }?.let { FeatureRouter.open(context, it) }
}
