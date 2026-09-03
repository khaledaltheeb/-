package org.healthrenewal.rawafid

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessibilityNew
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.SelfImprovement
import androidx.compose.material.icons.filled.Woman
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp

class ToolCatalogActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { ToolCatalogScreen() }
                }
            }
        }
    }
}

private data class CatalogCategory(val key: String, val label: String, val icon: ImageVector)

@Composable
private fun ToolCatalogScreen() {
    val context = LocalContext.current
    val features = remember { FeatureCatalog.visible(context) }
    val categoryVisuals = remember {
        listOf(
            CatalogCategory("all", "الكل", Icons.Default.Home),
            CatalogCategory("daily", "يومي", Icons.Default.CalendarMonth),
            CatalogCategory("wellbeing", "هدوء ودعم", Icons.Default.SelfImprovement),
            CatalogCategory("health", "صحة", Icons.Default.MedicalServices),
            CatalogCategory("family", "الأسرة", Icons.Default.People),
            CatalogCategory("safety", "أمان", Icons.Default.Security),
            CatalogCategory("accessibility", "وصولية", Icons.Default.AccessibilityNew),
            CatalogCategory("women", "المرأة", Icons.Default.Woman),
            CatalogCategory("memory", "ذاكرة", Icons.Default.Lightbulb),
            CatalogCategory("planning", "تنظيم", Icons.Default.CalendarMonth),
            CatalogCategory("social", "تواصل", Icons.Default.Favorite),
            CatalogCategory("knowledge", "الموقع والمعرفة", Icons.Default.HealthAndSafety)
        )
    }
    val labels = remember(categoryVisuals) { categoryVisuals.associate { it.key to it.label } }
    val publishedCategories = remember(features) { features.map { it.category }.toSet() }
    val categories = remember(categoryVisuals, publishedCategories) {
        categoryVisuals.filter { it.key == "all" || it.key in publishedCategories }
    }
    var selected by rememberSaveable { androidx.compose.runtime.mutableStateOf("all") }
    var query by rememberSaveable { androidx.compose.runtime.mutableStateOf("") }
    val visible = remember(selected, query, features, labels) {
        ToolCatalogSearch.filter(features, selected, query, labels)
    }
    val stableCount = remember(features) { features.count { it.status == "stable" } }
    val betaCount = remember(features) { features.count { it.status == "beta" } }

    LazyColumn(
        contentPadding = PaddingValues(
            horizontal = RawafidSpacing.ScreenHorizontal,
            vertical = RawafidSpacing.ScreenVertical
        ),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.SectionGap)
    ) {
        item { CatalogHero(total = features.size, stable = stableCount, beta = betaCount) }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                Text("ابحث حسب ما تريد فعله", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it.take(80) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    label = { Text("مثال: دواء، أمان، موعد، روتين") },
                    supportingText = { Text("البحث يعمل محليًا داخل كتالوج التطبيق") }
                )
            }
        }

        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                categories.forEach { category ->
                    item(key = category.key) {
                        FilterChip(
                            selected = selected == category.key,
                            onClick = { selected = category.key },
                            leadingIcon = { Icon(category.icon, contentDescription = null, modifier = Modifier.size(18.dp)) },
                            label = { Text(category.label) }
                        )
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    if (query.isBlank()) "الأدوات المتاحة" else "نتائج البحث",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Surface(shape = CircleShape, color = MaterialTheme.colorScheme.surfaceVariant) {
                    Text(
                        "${visible.size}",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelLarge
                    )
                }
            }
        }

        if (visible.isEmpty()) {
            item(key = "tool-catalog-empty") {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(Modifier.padding(RawafidSpacing.Lg), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text("لا توجد أدوات مطابقة", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(
                            if (query.isBlank()) {
                                "لا توجد أدوات منشورة ضمن هذه الفئة حاليًا."
                            } else {
                                "جرّب كلمة أقصر، اسمًا آخر للأداة، أو اختر «الكل»."
                            },
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            visible.forEach { feature ->
                item(key = feature.id) {
                    CatalogFeatureCard(feature = feature, onOpen = { FeatureRouter.open(context, feature) })
                }
            }
        }
    }
}

@Composable
private fun CatalogHero(total: Int, stable: Int, beta: Int) {
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
            Text("روافد · Life OS", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
            Text("كل ما تحتاجه، دون قائمة مربكة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text(
                "ابحث بالهدف أو اختر مجالًا. الأدوات التجريبية موضحة بوضوح حتى تعرف مستوى جاهزية كل وظيفة.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            Row(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                CatalogMetric("الكل", total.toString())
                CatalogMetric("مستقر", stable.toString())
                CatalogMetric("تجريبي", beta.toString())
            }
            if (BuildConfig.DEBUG) {
                Surface(shape = CircleShape, color = MaterialTheme.colorScheme.tertiaryContainer) {
                    Text(
                        "نسخة اختبار · ${BuildConfig.VERSION_NAME}",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onTertiaryContainer
                    )
                }
            }
        }
    }
}

@Composable
private fun CatalogMetric(label: String, value: String) {
    Surface(
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.72f)
    ) {
        Column(
            Modifier.padding(horizontal = 13.dp, vertical = 9.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(label, style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
private fun CatalogFeatureCard(feature: RawafidFeature, onOpen: () -> Unit) {
    val beta = feature.status == "beta"
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onOpen,
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(
            containerColor = if (feature.id == "life_inbox") {
                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.62f)
            } else {
                MaterialTheme.colorScheme.surface
            }
        )
    ) {
        Column(
            Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
            verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xxs)) {
                    Text(feature.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    if (feature.id == "life_inbox") {
                        Text("مدخل موحد", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                    }
                }
                Surface(
                    shape = CircleShape,
                    color = if (beta) MaterialTheme.colorScheme.tertiaryContainer else MaterialTheme.colorScheme.secondaryContainer
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            if (beta) Icons.Default.Lock else Icons.Default.HealthAndSafety,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(if (beta) "تجريبي" else "مستقر", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
            Text(feature.subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("فتح الأداة", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
        }
    }
}
