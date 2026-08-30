package org.healthrenewal.rawafid

import android.content.Intent
import android.net.Uri
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
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp

class HelpNowActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { HelpNowScreen() }
                }
            }
        }
    }
}

@Composable
private fun HelpNowScreen() {
    val context = LocalContext.current
    val emergencyPeople = remember { MyCircleStore.forPermission(context, CirclePermission.EMERGENCY) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("ساعدني الآن", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                Text("واجهة قليلة الخيارات للحظة التي لا تريد فيها قوائم كثيرة.")
            }
        }
        item {
            BigSafetyAction(
                title = "طوارئ الهاتف",
                subtitle = "يفتح واجهة الاتصال لتختار رقم الطوارئ المحلي المناسب. روافد لا يفترض رقمًا عالميًا واحدًا."
            ) {
                context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:")))
            }
        }
        item {
            BigSafetyAction(
                title = "ماذا أفعل الآن؟",
                subtitle = "مسارات قصيرة Offline للتشنج، فقدان الوعي، القلق الشديد، حرارة الطفل وغيرها."
            ) { context.startActivity(Intent(context, WhatNowActivity::class.java)) }
        }
        item {
            BigSafetyAction(
                title = "بطاقة حياتي",
                subtitle = "اعرض أو جهّز QR بمعلومات المساعدة التي سمحت بها أنت."
            ) { context.startActivity(Intent(context, LifeCardActivity::class.java)) }
        }
        item {
            BigSafetyAction(
                title = "دائرتي",
                subtitle = if (emergencyPeople.isEmpty()) "أضف أشخاصًا موثوقين وحدد من تعتمد عليه في الطوارئ." else "لديك ${emergencyPeople.size} شخص/أشخاص محددون للطوارئ."
            ) { context.startActivity(Intent(context, MyCircleActivity::class.java)) }
        }
        if (emergencyPeople.isNotEmpty()) {
            item {
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("أشخاص الطوارئ", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        emergencyPeople.take(4).forEach { person ->
                            OutlinedButton(
                                modifier = Modifier.fillMaxWidth(),
                                enabled = person.phone.isNotBlank(),
                                onClick = { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${Uri.encode(person.phone)}"))) }
                            ) { Text("اتصل بـ ${person.name}") }
                        }
                    }
                }
            }
        }
        item {
            Text(
                "روافد لا يراقبك تلقائيًا ولا يرسل إنذارًا صامتًا من هذه الشاشة. إذا كانت الحالة مهددة للحياة، استخدم خدمات الطوارئ المحلية فورًا.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.error
            )
        }
    }
}

@Composable
private fun BigSafetyAction(title: String, subtitle: String, onClick: () -> Unit) {
    Button(modifier = Modifier.fillMaxWidth(), onClick = onClick) {
        Column(Modifier.fillMaxWidth().padding(vertical = 10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(subtitle, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
