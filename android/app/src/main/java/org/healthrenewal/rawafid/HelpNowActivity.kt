package org.healthrenewal.rawafid

import android.content.Intent
import android.net.Uri
import android.os.Bundle
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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection

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
    var version by remember { mutableIntStateOf(0) }
    var showAddContact by remember { mutableStateOf(false) }
    var name by rememberSaveable { mutableStateOf("") }
    var relation by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    val emergencyPeople = remember(version) { MyCircleStore.forPermission(context, CirclePermission.EMERGENCY) }

    LazyColumn(
        contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("ساعدني الآن", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                Text("اختر الإجراء الأقرب لما تحتاجه الآن. أزرار الاتصال تستخدم الأشخاص الذين تحددهم أنت كجهات طوارئ.")
            }
        }

        if (emergencyPeople.isNotEmpty()) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("اتصال سريع", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("هذه الأرقام أضفتها أنت وحددت أنها جهات موثوقة للطوارئ.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        emergencyPeople.take(4).forEach { person ->
                            Button(
                                modifier = Modifier.fillMaxWidth(),
                                enabled = person.phone.isNotBlank(),
                                onClick = { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${Uri.encode(person.phone)}"))) }
                            ) {
                                Text("اتصل بـ ${person.name}${if (person.relation.isNotBlank()) " — ${person.relation}" else ""}")
                            }
                        }
                    }
                }
            }
        }

        item {
            OutlinedButton(modifier = Modifier.fillMaxWidth(), onClick = { showAddContact = !showAddContact }) {
                Text(if (showAddContact) "إخفاء إضافة جهة الطوارئ" else "إضافة رقم شخص للطوارئ")
            }
        }

        if (showAddContact) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("جهة طوارئ موثوقة", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("سيظهر هذا الشخص في أعلى «ساعدني الآن». لا يتم الاتصال أو الإرسال إليه دون إجراء منك في هذه الشاشة.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        OutlinedTextField(name, { name = it.take(80) }, label = { Text("الاسم") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                        OutlinedTextField(relation, { relation = it.take(80) }, label = { Text("العلاقة — مثال: ابن، زوج، مقدم رعاية") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                        OutlinedTextField(phone, { phone = it.take(40) }, label = { Text("رقم الهاتف") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                        Button(
                            modifier = Modifier.fillMaxWidth(),
                            enabled = name.isNotBlank() && phone.isNotBlank(),
                            onClick = {
                                val people = MyCircleStore.people(context)
                                MyCircleStore.save(
                                    context,
                                    people + CirclePerson(
                                        id = System.currentTimeMillis(),
                                        name = name.trim(),
                                        relation = relation.trim(),
                                        phone = phone.trim(),
                                        permissions = setOf(CirclePermission.EMERGENCY)
                                    )
                                )
                                name = ""; relation = ""; phone = ""; showAddContact = false; version++
                            }
                        ) { Text("حفظ كجهة طوارئ") }
                    }
                }
            }
        }

        item {
            BigSafetyAction(
                title = "طوارئ الهاتف",
                subtitle = "يفتح لوحة الاتصال. استخدم رقم خدمات الطوارئ المحلي إذا كانت الحالة مهددة للحياة."
            ) { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:"))) }
        }
        item {
            BigSafetyAction(
                title = "ماذا أفعل الآن؟",
                subtitle = "خطوات واضحة Offline لمواقف عاجلة شائعة، مع ما تفعله الآن ومتى تطلب المساعدة."
            ) { context.startActivity(Intent(context, WhatNowActivity::class.java)) }
        }
        item {
            BigSafetyAction(
                title = "بطاقة حياتي",
                subtitle = "اعرض المعلومات التي اخترت السماح بها أو جهّز QR لشخص يساعدك."
            ) { context.startActivity(Intent(context, LifeCardActivity::class.java)) }
        }
        item {
            BigSafetyAction(
                title = "دائرتي",
                subtitle = if (emergencyPeople.isEmpty()) "أدر الأشخاص الموثوقين وصلاحية كل شخص." else "إدارة ${emergencyPeople.size} جهة/جهات طوارئ وبقية الأشخاص الموثوقين."
            ) { context.startActivity(Intent(context, MyCircleActivity::class.java)) }
        }
        item {
            Text(
                "إذا كانت الحالة مهددة للحياة، اتصل بخدمات الطوارئ المحلية فورًا. أدوات روافد تساعد في التواصل والتنظيم ولا تستبدل الاستجابة الطارئة.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.error
            )
        }
    }
}

@Composable
private fun BigSafetyAction(title: String, subtitle: String, onClick: () -> Unit) {
    Button(modifier = Modifier.fillMaxWidth(), onClick = onClick) {
        Column(Modifier.fillMaxWidth().padding(vertical = RawafidSpacing.Xs), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xxs)) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(subtitle, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
