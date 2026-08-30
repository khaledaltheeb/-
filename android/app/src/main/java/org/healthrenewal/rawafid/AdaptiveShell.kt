package org.healthrenewal.rawafid

import android.content.Context
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

private enum class ShellTab(val key: String, val label: String, val icon: ImageVector) {
    TODAY("today", "اليوم", Icons.Default.Home),
    TOOLS("tools", "الأدوات", Icons.Default.Build),
    SAFETY("safety", "الأمان", Icons.Default.Security),
    KNOWLEDGE("knowledge", "المعرفة", Icons.Default.Public),
    ME("me", "أنا", Icons.Default.AccountCircle)
}

object HomePreferenceStore {
    private const val PREFS = "rawafid_home_preferences_v1"
    private const val KEY = "categories"
    private val defaults = setOf("daily", "health", "wellbeing", "safety", "knowledge")

    fun selected(context: Context): Set<String> =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getStringSet(KEY, defaults)?.toSet() ?: defaults

    fun save(context: Context, value: Set<String>) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putStringSet(KEY, value).apply()
    }
}

@Composable
fun RawafidAdaptiveShell(initialDestination: String = "home") {
    val initial = when (initialDestination) {
        "tools" -> ShellTab.TOOLS
        "safety" -> ShellTab.SAFETY
        "knowledge" -> ShellTab.KNOWLEDGE
        else -> ShellTab.TODAY
    }
    var tab by remember { mutableStateOf(initial) }
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
        when (tab) {
            ShellTab.TODAY -> TodayScreen(Modifier.padding(padding))
            ShellTab.TOOLS -> CatalogCategoryScreen(null, "أدواتي", "كل قدرات روافد مرتبة دون ازدحام.", Modifier.padding(padding))
            ShellTab.SAFETY -> CatalogCategoryScreen("safety", "الأمان", "بطاقات وخطط وفحوص أمان تعمل بأقل احتكاك ممكن.", Modifier.padding(padding))
            ShellTab.KNOWLEDGE -> CatalogCategoryScreen("knowledge", "المعرفة", "الموقع المنشور هو محرك المعرفة داخل التطبيق ولا يتأثر بتطوير Android.", Modifier.padding(padding))
            ShellTab.ME -> MeScreen(Modifier.padding(padding))
        }
    }
}

@Composable
private fun TodayScreen(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    var refresh by remember { mutableIntStateOf(0) }
    val selected = remember(refresh) { HomePreferenceStore.selected(context) }
    val all = remember { FeatureCatalog.visible(context) }
    val candidates = remember(selected, all) {
        all.filter { it.category in selected && it.id !in setOf("knowledge_daily_tools", "site_entry", "treatment_center_legacy") }
            .sortedByDescending { it.priority }
            .take(7)
    }
    val water = remember(refresh) { LocalStore.waterCountToday(context) }
    val safe = remember(refresh) { SafeArrivalStore.load(context) }
    val meds = remember(refresh) { MedicationStore.medications(context) }
    val taken = remember(refresh) { meds.count { MedicationStore.todayStatus(context, it.id) == "أخذته" } }
    val nextAppointment = remember(refresh) { LocalStore.treatments(context).filter { it.timeMillis > System.currentTimeMillis() }.minByOrNull { it.timeMillis } }
    val familyOpen = remember(refresh) { FamilyHubStore.tasks(context).count { !it.done } }

    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("روافد", fontWeight = FontWeight.Bold)
                    Text("ماذا تحتاج اليوم؟", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text("لا تحتاج إلى استخدام كل شيء. تظهر هنا الأدوات الأكثر صلة باختياراتك.")
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text("لمحة اليوم", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("الماء المسجل: $water")
                    if (meds.isNotEmpty()) Text("العلاج اليوم: $taken/${meds.size} مسجل كـ«أخذته»")
                    if (nextAppointment != null) Text("لديك موعد قادم محفوظ: ${nextAppointment.title}")
                    if (familyOpen > 0) Text("مهام رعاية مفتوحة: $familyOpen")
                    if (safe.active) Text("فحص «وصلت بالسلامة» نشط.", color = MaterialTheme.colorScheme.primary)
                    OutlinedButton(onClick = { LocalStore.recordWater(context); RawafidWidgetProvider.updateAll(context); refresh++ }) { Text("شربت ماء") }
                }
            }
        }
        item { Text("مقترح لك", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
        candidates.forEach { feature ->
            item(key = feature.id) { AdaptiveFeatureCard(feature) }
        }
        item {
            OutlinedButton(modifier = Modifier.fillMaxWidth(), onClick = { FeatureRouter.open(context, RawafidFeature("tools", "كل الأدوات", "", "daily", "activity", ToolCatalogActivity::class.java.name, "stable", 0)) }) {
                Text("عرض كل الأدوات")
            }
        }
    }
}

@Composable
private fun CatalogCategoryScreen(category: String?, title: String, subtitle: String, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val all = remember { FeatureCatalog.visible(context) }
    val features = remember(category, all) {
        if (category == null) all.filter { it.id != "treatment_center_legacy" } else all.filter { it.category == category }
    }
    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text(subtitle)
            }
        }
        features.forEach { feature -> item(key = feature.id) { AdaptiveFeatureCard(feature) } }
    }
}

@Composable
private fun AdaptiveFeatureCard(feature: RawafidFeature) {
    val context = LocalContext.current
    Card(modifier = Modifier.fillMaxWidth(), onClick = { FeatureRouter.open(context, feature) }) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text(feature.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            if (feature.subtitle.isNotBlank()) Text(feature.subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
            if (feature.status == "beta") Text("تجريبي", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
        }
    }
}

@Composable
private fun MeScreen(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    var selected by remember { mutableStateOf(HomePreferenceStore.selected(context)) }
    val categories = listOf(
        "daily" to "اليوميات",
        "health" to "الصحة",
        "wellbeing" to "الهدوء والدعم",
        "family" to "الأسرة",
        "safety" to "الأمان",
        "accessibility" to "الوصولية",
        "women" to "قطاع المرأة",
        "planning" to "التنظيم",
        "memory" to "الذاكرة",
        "knowledge" to "المعرفة"
    )

    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("أنا", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("هذه تفضيلات محلية لتحديد ما يظهر في «اليوم». لا تحتاج إلى حساب.")
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("ما الذي تريد أن يساعدك فيه روافد؟", fontWeight = FontWeight.Bold)
                    categories.chunked(2).forEach { row ->
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            row.forEach { (id, label) ->
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
        }
        listOf("accessibility_profile", "support_passport", "family_hub", "life_vault").mapNotNull { id -> FeatureCatalog.visible(context).firstOrNull { it.id == id } }.forEach { feature ->
            item(key = feature.id) { AdaptiveFeatureCard(feature) }
        }
    }
}
