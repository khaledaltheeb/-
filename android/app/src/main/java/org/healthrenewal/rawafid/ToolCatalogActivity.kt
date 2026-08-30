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
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
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

@Composable
private fun ToolCatalogScreen() {
    val context = LocalContext.current
    val features = remember { FeatureCatalog.visible(context) }
    val categories = remember(features) { listOf("all") + features.map { it.category }.distinct() }
    var selected by rememberSaveable { mutableStateOf("all") }
    var query by rememberSaveable { mutableStateOf("") }
    val labels = mapOf(
        "all" to "الكل",
        "daily" to "يومي",
        "wellbeing" to "هدوء ودعم",
        "health" to "صحة",
        "family" to "الأسرة",
        "safety" to "أمان",
        "accessibility" to "وصولية",
        "women" to "المرأة",
        "memory" to "ذاكرة",
        "planning" to "تنظيم",
        "social" to "تواصل",
        "knowledge" to "الموقع والمعرفة"
    )
    val visible = remember(selected, query, features) {
        val normalizedQuery = query.trim().lowercase()
        features.filter { feature ->
            val categoryMatches = selected == "all" || feature.category == selected
            val queryMatches = normalizedQuery.isBlank() || listOf(
                feature.title,
                feature.subtitle,
                feature.id,
                feature.category,
                labels[feature.category].orEmpty()
            ).any { it.lowercase().contains(normalizedQuery) }
            categoryMatches && queryMatches
        }
    }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("أدوات روافد", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("ابحث باسم الأداة أو وظيفتها، أو اختر الفئة التي تحتاجها الآن. الكتالوج مستقل وقابل للتوسع دون ازدحام الواجهة.")
            }
        }
        item {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it.take(80) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                label = { Text("ابحث في الأدوات") },
                placeholder = { Text("مثال: دواء، أمان، نوم، أسرة") }
            )
        }
        item {
            androidx.compose.foundation.lazy.LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                categories.forEach { category ->
                    item(key = category) {
                        FilterChip(
                            selected = selected == category,
                            onClick = { selected = category },
                            label = { Text(labels[category] ?: category) }
                        )
                    }
                }
            }
        }
        if (visible.isEmpty()) {
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                        Text("لا توجد أداة مطابقة", fontWeight = FontWeight.Bold)
                        Text("غيّر عبارة البحث أو اختر «الكل» لعرض الكتالوج كاملًا.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        } else {
            visible.forEach { feature ->
                item(key = feature.id) {
                    Card(modifier = Modifier.fillMaxWidth(), onClick = { FeatureRouter.open(context, feature) }) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                            Text(feature.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text(feature.subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            if (feature.status == "beta") Text("تجريبي", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }
        }
    }
}
