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
import androidx.compose.material3.OutlinedButton
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
import org.json.JSONArray

data class WhatNowScenario(
    val id: String,
    val title: String,
    val summary: String,
    val now: List<String>,
    val watch: List<String>,
    val urgent: List<String>,
    val dont: List<String>,
    val source: String
)

object WhatNowCatalog {
    private const val ASSET = "what_now_scenarios.json"
    @Volatile private var cache: List<WhatNowScenario>? = null

    fun all(context: android.content.Context): List<WhatNowScenario> = cache ?: synchronized(this) {
        cache ?: runCatching {
            val raw = context.assets.open(ASSET).bufferedReader(Charsets.UTF_8).use { it.readText() }
            val a = JSONArray(raw)
            buildList {
                for (i in 0 until a.length()) {
                    val o = a.getJSONObject(i)
                    fun strings(key: String): List<String> {
                        val array = o.optJSONArray(key) ?: JSONArray()
                        return buildList { for (j in 0 until array.length()) add(array.optString(j)) }
                    }
                    add(WhatNowScenario(o.getString("id"), o.getString("title"), o.optString("summary"), strings("now"), strings("watch"), strings("urgent"), strings("dont"), o.optString("source")))
                }
            }
        }.getOrDefault(emptyList()).also { cache = it }
    }
}

class WhatNowActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { WhatNowScreen() }
                }
            }
        }
    }
}

@Composable
private fun WhatNowScreen() {
    val context = LocalContext.current
    val scenarios = remember { WhatNowCatalog.all(context) }
    var selected by remember { mutableStateOf<WhatNowScenario?>(null) }

    if (selected == null) {
        LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("ماذا أفعل الآن؟", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text("اختر الموقف الأقرب. المسارات قصيرة وتعمل Offline ولا تحاول تشخيص السبب.")
                }
            }
            scenarios.forEach { scenario ->
                item(key = scenario.id) {
                    Card(modifier = Modifier.fillMaxWidth(), onClick = { selected = scenario }) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                            Text(scenario.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text(scenario.summary, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
            item {
                Card {
                    Text("إذا كان الموقف يهدد الحياة أو يتدهور بسرعة، استخدم خدمات الطوارئ المحلية بدل انتظار مسار داخل التطبيق.", Modifier.padding(16.dp), color = MaterialTheme.colorScheme.error)
                }
            }
        }
    } else {
        val scenario = selected!!
        LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            item { OutlinedButton(onClick = { selected = null }) { Text("العودة للمواقف") } }
            item {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(scenario.title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                    Text(scenario.summary)
                }
            }
            item { StepsCard("الآن", scenario.now) }
            item { StepsCard("ما الذي أراقبه؟", scenario.watch) }
            item { StepsCard("متى لا أنتظر؟", scenario.urgent, urgent = true) }
            item { StepsCard("ماذا لا أفعل؟", scenario.dont) }
            item {
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                        Text("المصدر المرجعي", fontWeight = FontWeight.Bold)
                        Text(scenario.source)
                        Text("النص مختصر للعمل Offline؛ لا يحل محل الإسعافات الأولية المعتمدة أو المختص أو خدمات الطوارئ.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
            item {
                val help = FeatureCatalog.visible(context).firstOrNull { it.id == "help_now" }
                if (help != null) Button(modifier = Modifier.fillMaxWidth(), onClick = { FeatureRouter.open(context, help) }) { Text("افتح ساعدني الآن") }
            }
        }
    }
}

@Composable
private fun StepsCard(title: String, steps: List<String>, urgent: Boolean = false) {
    if (steps.isEmpty()) return
    Card {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = if (urgent) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface)
            steps.forEach { Text("• $it") }
        }
    }
}
