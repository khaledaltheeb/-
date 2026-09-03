package org.healthrenewal.rawafid

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

class InteractiveUtilityActivity : ComponentActivity() {
    companion object { const val EXTRA_TOOL_ID = "interactive_tool_id" }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val toolId = intent.getStringExtra(EXTRA_TOOL_ID) ?: "one_minute"
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { InteractiveUtilityScreen(toolId) }
                }
            }
        }
    }
}

@Composable
private fun InteractiveUtilityScreen(toolId: String) {
    when (toolId) {
        "breathing" -> BreathingMinuteScreen()
        "screen_rest" -> ScreenRestSession()
        else -> OneMinuteInteractiveScreen()
    }
}

@Composable
private fun InteractiveHeader(title: String, subtitle: String) {
    Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
        Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun OneMinuteInteractiveScreen() {
    val context = LocalContext.current
    var choice by rememberSaveable { mutableStateOf("تنفس") }
    var remaining by rememberSaveable { mutableIntStateOf(60) }
    var running by rememberSaveable { mutableStateOf(false) }
    var completionPlayed by rememberSaveable { mutableStateOf(false) }
    val choices = listOf("تنفس", "تمدد", "ماء", "صمت", "مشي", "كتابة")

    LaunchedEffect(running, remaining) {
        if (running && remaining > 0) {
            delay(1000)
            remaining -= 1
        } else if (remaining == 0) {
            running = false
            if (!completionPlayed) {
                completionPlayed = true
                CompletionCue.play(context)
            }
        }
    }

    LazyColumn(contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)) {
        item { InteractiveHeader("دقيقة لي", "اختر ما تحتاجه ثم ابدأ. سيصدر تنبيه صوتي عند انتهاء الدقيقة.") }
        item {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                choices.forEach { option ->
                    FilterChip(selected = choice == option, onClick = { if (!running) choice = option }, label = { Text(option) })
                }
            }
        }
        item { TimerCard(remaining, 60, if (remaining == 0) "اكتملت الدقيقة" else choice, oneMinuteGuidance(choice, remaining)) }
        item {
            TimerControls(
                running = running,
                finished = remaining == 0,
                onToggle = { running = !running },
                onReset = { running = false; remaining = 60; completionPlayed = false }
            )
        }
    }
}

private fun oneMinuteGuidance(choice: String, remaining: Int): String = when {
    remaining == 0 -> "انتهت الدقيقة. يمكنك التوقف هنا أو اختيار دقيقة أخرى فقط إذا أردت."
    choice == "تنفس" -> "تنفس بهدوء دون إجبار. اجعل الزفير أطول قليلًا إن كان ذلك مريحًا."
    choice == "تمدد" -> "حرّك الكتفين والذراعين والرقبة بلطف ضمن قدرتك."
    choice == "ماء" -> "خذ وقتك واشرب ماءً إذا كان مناسبًا لحالتك وتعليماتك الصحية."
    choice == "صمت" -> "ضع الهاتف جانبًا للحظة واترك الدقيقة بلا مهمة أخرى."
    choice == "مشي" -> "تحرك في مكان آمن وبسرعة مريحة لك."
    else -> "اكتب ما يدور في ذهنك بلا تنقيح. الهدف إخراجه من رأسك لا صياغته بشكل مثالي."
}

@Composable
private fun BreathingMinuteScreen() {
    val context = LocalContext.current
    var remaining by rememberSaveable { mutableIntStateOf(60) }
    var running by rememberSaveable { mutableStateOf(false) }
    var completionPlayed by rememberSaveable { mutableStateOf(false) }
    val reduceMotion = LocalRawafidAccessibility.current.reduceMotion
    val elapsed = 60 - remaining
    val cycleSecond = elapsed % 10
    val inhale = cycleSecond < 4
    val phaseSecond = if (inhale) cycleSecond + 1 else cycleSecond - 4 + 1
    val phaseTotal = if (inhale) 4 else 6
    val phase = if (inhale) "شهيق" else "زفير"

    LaunchedEffect(running, remaining) {
        if (running && remaining > 0) {
            delay(1000)
            remaining -= 1
        } else if (remaining == 0) {
            running = false
            if (!completionPlayed) {
                completionPlayed = true
                CompletionCue.play(context)
            }
        }
    }

    LazyColumn(contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Lg)) {
        item { InteractiveHeader("تنفس دقيقة", "إيقاع بصري بسيط: 4 ثوانٍ شهيق و6 ثوانٍ زفير. سيصدر تنبيه صوتي عند انتهاء الدقيقة.") }
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(RawafidSpacing.Xl),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
                ) {
                    val circleSize = breathingCircleSize(inhale, phaseSecond, phaseTotal, reduceMotion)
                    Box(modifier = Modifier.size(230.dp), contentAlignment = Alignment.Center) {
                        Box(
                            modifier = Modifier.size(circleSize).background(MaterialTheme.colorScheme.primaryContainer, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                if (remaining == 0) "تم" else phase,
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }
                    if (remaining > 0) Text("$phase · $phaseSecond / $phaseTotal", style = MaterialTheme.typography.titleMedium)
                    else Text("اكتملت الدقيقة", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
                    Text(formatSeconds(remaining), style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                    Text(
                        if (reduceMotion) "تقليل الحركة مفعّل: يتغير النص والزمن دون تمدد بصري للحلقة." else "اتبع اتساع الدائرة في الشهيق وانكماشها في الزفير.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
        item {
            TimerControls(
                running = running,
                finished = remaining == 0,
                onToggle = { running = !running },
                onReset = { running = false; remaining = 60; completionPlayed = false }
            )
        }
    }
}

private fun breathingCircleSize(inhale: Boolean, second: Int, total: Int, reduceMotion: Boolean): Dp {
    if (reduceMotion) return 160.dp
    val fraction = second.toFloat() / total.toFloat()
    val min = 120f
    val max = 205f
    val value = if (inhale) min + ((max - min) * fraction) else max - ((max - min) * fraction)
    return value.dp
}

@Composable
private fun ScreenRestSession() {
    val context = LocalContext.current
    var tenthsRemaining by rememberSaveable { mutableIntStateOf(300) }
    var running by rememberSaveable { mutableStateOf(false) }
    var completionPlayed by rememberSaveable { mutableStateOf(false) }
    val reduceMotion = LocalRawafidAccessibility.current.reduceMotion
    val elapsedTenths = 300 - tenthsRemaining
    val secondsRemaining = (tenthsRemaining + 9) / 10
    val phase = when {
        elapsedTenths < 50 -> "ارمش ببطء"
        elapsedTenths < 250 -> "انظر إلى نقطة بعيدة"
        else -> "أرخِ الكتفين والرقبة"
    }
    val guidance = when (phase) {
        "ارمش ببطء" -> "اتبع الدائرة مرة واحدة ثم ارمش عدة مرات دون شد العين."
        "انظر إلى نقطة بعيدة" -> "اترك الشاشة وانظر إلى شيء بعيد قدر الإمكان حتى يتغير المؤقت."
        else -> "حرّك الكتفين والرقبة بلطف وخذ وضعية أكثر راحة."
    }

    LaunchedEffect(running, tenthsRemaining) {
        if (running && tenthsRemaining > 0) {
            delay(100)
            tenthsRemaining -= 1
        } else if (tenthsRemaining == 0) {
            running = false
            if (!completionPlayed) {
                completionPlayed = true
                CompletionCue.play(context)
            }
        }
    }

    LazyColumn(contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Lg)) {
        item { InteractiveHeader("راحة الشاشة", "جلسة رمش ونظر بعيد وإرخاء للكتفين، مع نغمة واضحة عند انتهاء الجلسة.") }
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.fillMaxWidth().heightIn(min = 330.dp).padding(RawafidSpacing.Xl),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
                ) {
                    Box(modifier = Modifier.size(220.dp), contentAlignment = Alignment.Center) {
                        if (phase == "ارمش ببطء" && tenthsRemaining > 0) {
                            val cueSize = blinkCueSize(elapsedTenths.coerceIn(0, 50), reduceMotion)
                            Box(modifier = Modifier.size(cueSize).background(MaterialTheme.colorScheme.tertiaryContainer, CircleShape))
                        } else {
                            CircularProgressIndicator(
                                progress = { tenthsRemaining / 300f },
                                modifier = Modifier.size(150.dp),
                                color = MaterialTheme.colorScheme.primary,
                                trackColor = MaterialTheme.colorScheme.surfaceVariant
                            )
                        }
                        Text(if (tenthsRemaining == 0) "تم" else phase, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    }
                    Text(formatSeconds(secondsRemaining), style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                    Text(guidance, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        item {
            TimerControls(
                running = running,
                finished = tenthsRemaining == 0,
                onToggle = { running = !running },
                onReset = { running = false; tenthsRemaining = 300; completionPlayed = false }
            )
        }
    }
}

private fun blinkCueSize(elapsedTenths: Int, reduceMotion: Boolean): Dp {
    if (reduceMotion) return 130.dp
    val fraction = elapsedTenths.coerceIn(0, 50) / 50f
    return (210f - (125f * fraction)).dp
}

@Composable
private fun TimerCard(remainingSeconds: Int, totalSeconds: Int, title: String, guidance: String) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(RawafidSpacing.Xl),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
        ) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            CircularProgressIndicator(
                progress = { if (totalSeconds == 0) 0f else remainingSeconds.toFloat() / totalSeconds.toFloat() },
                modifier = Modifier.size(140.dp),
                strokeWidth = 9.dp,
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
            Text(formatSeconds(remainingSeconds), style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
            Text(guidance, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun TimerControls(running: Boolean, finished: Boolean, onToggle: () -> Unit, onReset: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
        Button(onClick = onToggle, enabled = !finished, modifier = Modifier.weight(1f)) { Text(if (running) "إيقاف مؤقت" else "ابدأ") }
        OutlinedButton(onClick = onReset, modifier = Modifier.weight(1f)) { Text("إعادة") }
    }
}

private fun formatSeconds(seconds: Int): String {
    val safe = seconds.coerceAtLeast(0)
    return "%d:%02d".format(safe / 60, safe % 60)
}