package org.healthrenewal.rawafid

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
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
import androidx.core.content.ContextCompat

class CareHubActivity : ComponentActivity() {
    private var permissionContinuation: ((Boolean) -> Unit)? = null
    private val notificationPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        permissionContinuation?.invoke(granted)
        permissionContinuation = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        FlexibleReminderScheduler.syncAll(this)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { CareHubScreen(::requestNotifications) }
                }
            }
        }
    }

    private fun requestNotifications(onResult: (Boolean) -> Unit) {
        if (Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
            onResult(true)
            return
        }
        permissionContinuation = onResult
        notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
    }
}

@Composable
private fun CareHubScreen(requestNotifications: ((Boolean) -> Unit) -> Unit) {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    val definitions = remember { FlexibleReminderCatalog.all(context) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("اهتم بي", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("كل تذكير مستقل وقابل للتعديل. التعريفات تأتي من كتالوج منفصل حتى يمكن إضافة أنواع جديدة دون إعادة بناء منطق الشاشة.")
            }
        }
        definitions.forEach { definition ->
            item(key = definition.id) {
                val enabled = remember(version) { FlexibleReminderStore.enabled(context, definition) }
                val minutes = remember(version) { FlexibleReminderStore.minutes(context, definition) }
                val max = remember(version) { FlexibleReminderStore.maxPerDay(context, definition) }
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Column(Modifier.weight(1f)) {
                                Text(definition.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                Text(definition.description, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Switch(checked = enabled, onCheckedChange = { checked ->
                                if (!checked) {
                                    FlexibleReminderStore.setEnabled(context, definition, false)
                                    FlexibleReminderScheduler.sync(context, definition)
                                    version++
                                } else requestNotifications { granted ->
                                    if (granted) {
                                        FlexibleReminderStore.setEnabled(context, definition, true)
                                        FlexibleReminderScheduler.sync(context, definition)
                                        version++
                                    }
                                }
                            })
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            intervalOptions(definition).forEach { option ->
                                FilterChip(
                                    selected = minutes == option,
                                    onClick = {
                                        FlexibleReminderStore.setMinutes(context, definition, option)
                                        FlexibleReminderScheduler.sync(context, definition)
                                        version++
                                    },
                                    label = { Text(if (option < 60) "$option د" else "${option / 60} س") }
                                )
                            }
                        }
                        Text("الحد اليومي: $max")
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { FlexibleReminderStore.setMaxPerDay(context, definition, max - 1); version++ }) { Text("−") }
                            Button(onClick = { FlexibleReminderStore.setMaxPerDay(context, definition, max + 1); version++ }) { Text("+") }
                        }
                    }
                }
            }
        }
        item {
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("ساعات الصمت", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text("يستخدم المحرك ساعات الصمت العامة الحالية: ${LocalStore.quietStart(context)}:00 — ${LocalStore.quietEnd(context)}:00")
                    Text("الهدف أن يساعدك روافد دون أن يتحول إلى عبء إشعارات.")
                }
            }
        }
    }
}

private fun intervalOptions(definition: FlexibleReminderDefinition): List<Long> {
    val base = definition.defaultMinutes.coerceAtLeast(definition.minMinutes)
    return listOf(
        definition.minMinutes,
        base,
        (base * 2).coerceAtLeast(definition.minMinutes),
        (base * 3).coerceAtLeast(definition.minMinutes)
    ).distinct().sorted().take(4)
}
