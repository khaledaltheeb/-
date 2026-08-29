package org.healthrenewal.rawafid

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
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
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

class WomenPrivacySettingsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                Surface(Modifier.fillMaxSize()) { WomenPrivacySettingsScreen() }
            }
        }
    }
}

@Composable
private fun WomenPrivacySettingsScreen() {
    val context = LocalContext.current
    var version by remember { mutableIntStateOf(0) }
    val enabled = remember(version) { WomenPrivacyStore.enabled(context) }
    val secure = remember(version) { WomenPrivacyStore.canUseDeviceLock(context) }
    val timeout = remember(version) { WomenPrivacyStore.timeoutMinutes(context) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Text("خصوصية قطاع المرأة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("تحكمي في حماية رفيقة روافد، تقويم المرأة، خطة العناية وملخص الزيارة على هذا الهاتف.")
        }

        item {
            Card {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("قفل قطاع المرأة بقفل الهاتف", fontWeight = FontWeight.Bold)
                    Text("يستخدم بصمة/وجه/رمز الجهاز وفق إعداد هاتفك، ولا ينشئ روافد كلمة مرور جديدة.", style = MaterialTheme.typography.bodySmall)
                    Switch(
                        checked = enabled,
                        onCheckedChange = { checked ->
                            if (!checked) {
                                WomenPrivacyStore.setEnabled(context, false)
                                version++
                            } else if (WomenPrivacyStore.canUseDeviceLock(context)) {
                                WomenPrivacyStore.setEnabled(context, true)
                                WomenPrivacyStore.markUnlocked(context)
                                version++
                            }
                        },
                        enabled = secure || enabled
                    )
                    if (!secure && !enabled) {
                        Text("فعّلي قفل شاشة آمنًا على الهاتف أولًا، ثم عودي لتفعيل حماية القطاع.", color = MaterialTheme.colorScheme.error)
                        OutlinedButton(onClick = { context.startActivity(Intent(Settings.ACTION_SECURITY_SETTINGS)) }) {
                            Text("فتح إعدادات أمان الهاتف")
                        }
                    }
                }
            }
        }

        if (enabled) {
            item {
                Card {
                    Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("مهلة إعادة القفل", fontWeight = FontWeight.Bold)
                        Text("بعد مغادرة القسم ومرور هذه المدة، سيطلب روافد قفل الهاتف مرة أخرى عند العودة.", style = MaterialTheme.typography.bodySmall)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(1, 5, 15, 30).forEach { minutes ->
                                FilterChip(
                                    selected = timeout == minutes,
                                    onClick = { WomenPrivacyStore.setTimeoutMinutes(context, minutes); version++ },
                                    label = { Text(if (minutes == 1) "دقيقة" else "$minutes د") }
                                )
                            }
                        }
                    }
                }
            }

            item {
                Card {
                    Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("خصوصية الإشعارات", fontWeight = FontWeight.Bold)
                        Text("قنوات إشعارات رفيقة روافد وخطة العناية مضبوطة بخصوصية شاشة قفل أعلى. التحكم التفصيلي بمعاينة كل نوع إشعار سيُربط لاحقًا بعد ربط بنك الرسائل الكبير بالكامل.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            item {
                Button(
                    onClick = {
                        WomenPrivacyStore.lockNow(context)
                        context.startActivity(WomenPrivacyGate.intent(context, WomenPrivacyGate.TARGET_COMPANION))
                        (context as? ComponentActivity)?.finish()
                    },
                    modifier = Modifier.fillMaxWidth()
                ) { Text("قفل قطاع المرأة الآن") }
            }
        }

        item {
            Text(
                "بيانات قطاع المرأة تبقى محلية في هذه المرحلة. تفعيل القفل لا يغيّر قواعد المشاركة: لا تخرج بيانات الزيارة أو التقويم إلا بفعل صريح منك.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
