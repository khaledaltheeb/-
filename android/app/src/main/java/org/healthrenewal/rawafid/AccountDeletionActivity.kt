package org.healthrenewal.rawafid

import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteForever
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.LayoutDirection
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

enum class AccountDeletionStage { REAUTH, MFA, CONFIRM, DONE }

class AccountDeletionActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) {
                        AccountDeletionScreen(
                            onClose = { finish() },
                            onDeleted = {
                                startActivity(
                                    Intent(this, MainActivity::class.java)
                                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                                )
                                finish()
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AccountDeletionScreen(onClose: () -> Unit, onDeleted: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val accountEmail = remember { RawafidCircleApi.sessionEmail(context) }
    var stage by rememberSaveable { mutableStateOf(AccountDeletionStage.REAUTH) }
    var password by remember { mutableStateOf("") }
    var mfaFactors by remember { mutableStateOf<List<CircleMfaFactor>>(emptyList()) }
    var challengeId by remember { mutableStateOf<String?>(null) }
    var mfaCode by remember { mutableStateOf("") }
    var typedEmail by rememberSaveable { mutableStateOf("") }
    var typedPhrase by rememberSaveable { mutableStateOf("") }
    var acknowledged by rememberSaveable { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }

    fun runTask(block: suspend () -> Unit) {
        if (busy) return
        scope.launch {
            busy = true
            error = ""
            runCatching { block() }
                .onFailure { error = it.message ?: "تعذر إكمال العملية بأمان." }
            busy = false
        }
    }

    LazyColumn(
        contentPadding = PaddingValues(
            horizontal = RawafidSpacing.ScreenHorizontal,
            vertical = RawafidSpacing.ScreenVertical
        ),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.SectionGap)
    ) {
        item { AccountDeletionHero(stage = stage, onClose = onClose) }

        when (stage) {
            AccountDeletionStage.REAUTH -> item {
                Card(shape = MaterialTheme.shapes.extraLarge) {
                    Column(
                        Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
                        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
                    ) {
                        Text("تحقق من هويتك أولًا", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text(
                            "حذف الحساب عملية نهائية. نطلب تسجيل دخول جديد حتى لا يستطيع شخص يحمل جلسة قديمة حذف حسابك.",
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        if (accountEmail.isNotBlank()) {
                            Surface(shape = CircleShape, color = MaterialTheme.colorScheme.surfaceVariant) {
                                Text(accountEmail, modifier = Modifier.padding(horizontal = RawafidSpacing.Sm, vertical = RawafidSpacing.Xs))
                            }
                        }
                        OutlinedTextField(
                            value = password,
                            onValueChange = { password = it.take(128) },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("كلمة المرور الحالية") },
                            singleLine = true,
                            visualTransformation = PasswordVisualTransformation()
                        )
                        Button(
                            enabled = !busy && accountEmail.isNotBlank() && password.isNotBlank(),
                            onClick = {
                                runTask {
                                    val nextStage = withContext(Dispatchers.IO) {
                                        RawafidCircleApi.signIn(context, accountEmail, password)
                                        val factors = RawafidCircleApi.currentUserFactors(context)
                                            .filter { it.status == "verified" && it.factorType in setOf("totp", "phone") }
                                        mfaFactors = factors
                                        if (RawafidCircleApi.needsMfa(context)) AccountDeletionStage.MFA else AccountDeletionStage.CONFIRM
                                    }
                                    password = ""
                                    stage = nextStage
                                }
                            }
                        ) { Text(if (busy) "جارٍ التحقق..." else "متابعة") }
                    }
                }
            }

            AccountDeletionStage.MFA -> item {
                Card(shape = MaterialTheme.shapes.extraLarge) {
                    Column(
                        Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
                        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
                    ) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Text("التحقق بخطوتين مطلوب", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("حسابك محمي بعامل إضافي. أكمله قبل الوصول إلى التأكيد النهائي للحذف.")
                        if (challengeId == null) {
                            Button(
                                enabled = !busy && mfaFactors.isNotEmpty(),
                                onClick = {
                                    val factor = mfaFactors.firstOrNull() ?: return@Button
                                    runTask {
                                        challengeId = withContext(Dispatchers.IO) {
                                            RawafidCircleApi.startMfaChallenge(context, factor.id)
                                        }
                                    }
                                }
                            ) { Text("بدء التحقق") }
                        } else {
                            OutlinedTextField(
                                value = mfaCode,
                                onValueChange = { mfaCode = it.filter(Char::isDigit).take(8) },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("رمز التحقق") },
                                singleLine = true
                            )
                            Button(
                                enabled = !busy && mfaCode.length >= 6,
                                onClick = {
                                    val factor = mfaFactors.firstOrNull() ?: return@Button
                                    val challenge = challengeId ?: return@Button
                                    runTask {
                                        withContext(Dispatchers.IO) {
                                            RawafidCircleApi.verifyMfa(context, factor.id, challenge, mfaCode)
                                        }
                                        mfaCode = ""
                                        challengeId = null
                                        stage = AccountDeletionStage.CONFIRM
                                    }
                                }
                            ) { Text("تحقق وانتقل للتأكيد") }
                        }
                    }
                }
            }

            AccountDeletionStage.CONFIRM -> item {
                Card(
                    shape = MaterialTheme.shapes.extraLarge,
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                ) {
                    Column(
                        Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
                        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
                    ) {
                        Icon(Icons.Default.DeleteForever, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                        Text(
                            "التأكيد النهائي",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        Text(
                            "سيُحذف حساب روافد السحابي نهائيًا، بما يشمل رقم RFD وروابط دائرتك ورسائلها وصلاحياتها وملفك المهني/المجتمعي المرتبط والملفات التي رفعتها إلى الحساب.",
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        Text(
                            "المعلومات الصحية والشخصية التي خزنتها محليًا فقط على هذا الهاتف لا تُرفع إلى الحساب، لذلك لا نمسحها تلقائيًا مع حذف الحساب. يمكنك حذف بيانات التطبيق من إعدادات Android إذا أردت مسحها أيضًا.",
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        OutlinedTextField(
                            value = typedEmail,
                            onValueChange = { typedEmail = it.take(254) },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("اكتب بريد الحساب للتأكيد") },
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = typedPhrase,
                            onValueChange = { typedPhrase = it.take(40) },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("اكتب: حذف حسابي نهائيًا") },
                            singleLine = true
                        )
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                            verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(checked = acknowledged, onCheckedChange = { acknowledged = it })
                            Text("أفهم أن الحذف نهائي ولا يمكن التراجع عنه.")
                        }
                        Button(
                            enabled = !busy &&
                                acknowledged &&
                                typedEmail.trim().equals(accountEmail.trim(), ignoreCase = true) &&
                                typedPhrase.trim() == "حذف حسابي نهائيًا",
                            onClick = {
                                runTask {
                                    withContext(Dispatchers.IO) {
                                        RawafidAccountDeletionApi.deleteCurrentAccount(context, accountEmail)
                                    }
                                    stage = AccountDeletionStage.DONE
                                }
                            }
                        ) { Text(if (busy) "جارٍ الحذف النهائي..." else "حذف حسابي وبياناته") }
                        OutlinedButton(enabled = !busy, onClick = onClose) { Text("إلغاء والاحتفاظ بالحساب") }
                    }
                }
            }

            AccountDeletionStage.DONE -> item {
                Card(
                    shape = MaterialTheme.shapes.extraLarge,
                    colors = CardDefaults.cardColors(containerColor = RawafidSemanticColors.SuccessContainer)
                ) {
                    Column(
                        Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
                        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
                    ) {
                        Text("تم حذف الحساب", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("أزيلت جلسة الحساب من هذا الجهاز ولم يعد رقم RFD مرتبطًا بحساب نشط.")
                        Button(onClick = onDeleted) { Text("العودة إلى روافد") }
                    }
                }
            }
        }

        if (error.isNotBlank()) {
            item {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)) {
                    Text(
                        error,
                        modifier = Modifier.fillMaxWidth().padding(RawafidSpacing.Lg),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
        }
    }
}

@Composable
private fun AccountDeletionHero(stage: AccountDeletionStage, onClose: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(MaterialTheme.shapes.extraLarge)
            .background(
                Brush.linearGradient(
                    listOf(
                        MaterialTheme.colorScheme.surfaceVariant,
                        MaterialTheme.colorScheme.errorContainer
                    )
                )
            )
            .padding(RawafidSpacing.Xl)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
            Text("روافد · أمان الحساب", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.error)
            Text("حذف الحساب والبيانات", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text(
                when (stage) {
                    AccountDeletionStage.REAUTH -> "تحقق من هويتك قبل أي خطوة نهائية."
                    AccountDeletionStage.MFA -> "أكمل عامل الحماية الإضافي للحساب."
                    AccountDeletionStage.CONFIRM -> "راجع ما سيُحذف ثم أكد بوضوح."
                    AccountDeletionStage.DONE -> "اكتملت عملية الحذف."
                },
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (stage != AccountDeletionStage.DONE) {
                TextButton(onClick = onClose) { Text("رجوع دون حذف") }
            }
        }
    }
}
