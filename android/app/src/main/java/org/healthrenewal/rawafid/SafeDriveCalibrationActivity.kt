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
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import java.text.DateFormat
import java.util.Date
import java.util.Locale

class SafeDriveCalibrationActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { SafeDriveCalibrationScreen() }
                }
            }
        }
    }
}

@Composable
private fun SafeDriveCalibrationScreen() {
    val context = LocalContext.current
    val live by SafeDriveSensorFusionRuntime.state.collectAsState()
    val reports = remember { SafeDriveStore.reports(context) }
    val fusion = remember { SafeDriveSensorFusionStore.summaries(context).associateBy { it.reportId } }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = RawafidSpacing.ScreenHorizontal, vertical = RawafidSpacing.ScreenVertical),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("جودة قياس القيادة", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("معايرة شفافة لبيانات GPS وGyroscope. هذه الشاشة لا تغيّر درجة القيادة ولا تصف السائق؛ هدفها إظهار مدى دعم الحساسات للقياسات.")
            }
        }

        if (live.active) {
            item {
                Card {
                    Column(Modifier.fillMaxWidth().padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text("الرحلة الحالية", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text(SafeDriveSensorConfidence.liveLabel(live))
                        MetricRow("انعطافات GPS الحادة", live.gpsHardTurnCount.toString())
                        MetricRow("مدعومة بـ Gyroscope", live.gyroCorroboratedTurnCount.toString())
                        MetricRow("GPS فقط", live.gpsOnlyTurnCount.toString())
                        if (live.gyroscopeAvailable) {
                            MetricRow("أعلى حركة دورانية", oneDecimalConfidence(live.peakAngularRateDegPerSec) + "°/ث")
                        }
                    }
                }
            }
        }

        item {
            Card {
                Column(Modifier.fillMaxWidth().padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                    Text("كيف نستخدم هذه البيانات؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("• GPS يكتشف تغير اتجاه الحركة أثناء الرحلة.")
                    Text("• Gyroscope يُستخدم فقط أثناء جلسة قيادة نشطة لدعم أو عدم دعم انعطاف GPS القريب زمنيًا.")
                    Text("• حركة الهاتف وحدها لا تُسجل كحدث قيادة.")
                    Text("• لا تُخزن هذه الطبقة الموقع أو المسار.")
                    Text("• نتائج التوافق لا تدخل في الدرجة حاليًا حتى تنتهي المعايرة الميدانية على سيارات وطرق وأوضاع هاتف مختلفة.")
                }
            }
        }

        item { Text("معايرة الرحلات", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
        if (reports.isEmpty()) {
            item { Text("لا توجد رحلات محفوظة بعد.") }
        }
        items(reports.take(30), key = { it.id }) { report ->
            val summary = fusion[report.id]
            val confidence = SafeDriveSensorConfidence.evaluate(summary)
            Card {
                Column(Modifier.fillMaxWidth().padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                    Text(
                        DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(report.startedAtMs)),
                        fontWeight = FontWeight.Bold
                    )
                    Text(confidence.label, style = MaterialTheme.typography.titleMedium)
                    confidence.corroborationPercent?.let { MetricRow("توافق الانعطافات", "$it%") }
                    MetricRow("جودة GPS", report.dataQuality)
                    if (summary != null) {
                        MetricRow("انعطافات GPS الحادة", summary.gpsHardTurnCount.toString())
                        MetricRow("مدعومة بـ Gyroscope", summary.gyroCorroboratedTurnCount.toString())
                        MetricRow("GPS فقط", summary.gpsOnlyTurnCount.toString())
                        if (summary.gyroscopeAvailable) {
                            MetricRow("أعلى حركة دورانية", oneDecimalConfidence(summary.peakAngularRateDegPerSec) + "°/ث")
                        }
                    }
                    Text(confidence.explanation, style = MaterialTheme.typography.bodySmall)
                    Text("لا يؤثر هذا المؤشر في درجة ${report.score}/100.", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
                }
            }
        }

        item {
            HorizontalDivider()
            Text(
                "قبل اعتماد أي عتبات نهائية يلزم اختبار ميداني يشمل المطبات، الأنفاق، الطرق السريعة والمدينة، وتثبيت الهاتف في أكثر من موضع. اختلاف الهاتف أو موضعه قد يغيّر قراءة الحساسات.",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
private fun MetricRow(label: String, value: String) {
    androidx.compose.foundation.layout.Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label)
        Text(value, fontWeight = FontWeight.Bold)
    }
}

private fun oneDecimalConfidence(value: Double): String = String.format(Locale.US, "%.1f", value)
