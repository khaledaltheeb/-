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
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
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
    var selected by remember { mutableStateOf("all") }
    val labels = mapOf(
        "all" to "الكل",
        "daily" to "يومي",
        "wellbeing" to "هدوء ودعم",
        "health" to "صحة",
        "safety" to "أمان",
        "accessibility" to "وصولية",
        "women" to "المرأة",
        "memory" to "ذاكرة",
        "planning" to "تنظيم",
        "social" to "تواصل",
        "knowledge" to "الموقع والمعرفة"
    )
    val visible = remember(selected, features) {
        if (selected == "all") features else features.filter { it.category == selected }
    }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("أدوات روافد", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("قدرات كثيرة دون ازدحام: اختر الفئة التي تحتاجها الآن. ترتيب الأدوات وتعريفها يأتي من كتالوج مستقل قابل للتوسعة.")
            }
        }
        item {
            androidx.compose.foundation.lazy.LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(categories.size) { index ->
                    val category = categories[index]
                    FilterChip(
                        selected = selected == category,
                        onClick = { selected = category },
                        label = { Text(labels[category] ?: category) }
                    )
                }
            }
        }
        items(visible.size, key = { visible[it].id }) { index ->
            val feature = visible[index]
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
