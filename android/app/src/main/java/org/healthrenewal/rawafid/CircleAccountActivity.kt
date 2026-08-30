package org.healthrenewal.rawafid

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.LayoutDirection
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class CircleAccountActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) { CircleAccountScreen(onDone = { finish() }) }
                }
            }
        }
    }
}

@Composable
private fun CircleAccountScreen(onDone: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var sessionVersion by remember { mutableIntStateOf(0) }
    var mode by rememberSaveable { mutableStateOf("signup") }
    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var passwordConfirmation by rememberSaveable { mutableStateOf("") }
    var passwordVisible by rememberSaveable { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf("") }
    var error by remember { mutableStateOf("") }
    var mfaFactors by remember { mutableStateOf<List<CircleMfaFactor>>(emptyList()) }
    var mfaRequired by remember { mutableStateOf(false) }
    var challengeId by remember { mutableStateOf<String?>(null) }
    var mfaCode by rememberSaveable { mutableStateOf("") }
    val signedIn = remember(sessionVersion) { RawafidCircleApi.hasSession(context) }
    val passwordRequirements = remember(password) { CirclePasswordPolicy.requirements(password) }
    val passwordMatches = password.isNotBlank() && password == passwordConfirmation

    fun runTask(block: () -> Unit) {
        if (busy) return
        scope.launch {
            busy = true
            error = ""
            status = ""
            runCatching { withContext(Dispatchers.IO) { block() } }
                .onFailure { error = it.message ?: "حدث خطأ غير متوقع." }
            busy = false
        }
    }

    LaunchedEffect(sessionVersion, signedIn) {
        if (!signedIn) {
            mfaFactors = emptyList()
            mfaRequired = false
            challengeId = null
            return@LaunchedEffect
        }
        runCatching {
            withContext(Dispatchers.IO) {
                val factors = RawafidCircleApi.currentUserFactors(context).filter { it.status == "verified" && it.factorType == "totp" }
                val required = factors.isNotEmpty() && RawafidCircleApi.needsMfa(context)
                factors to required
            }
        }.onSuccess {
            mfaFactors = it.first
            mfaRequired = it.second
        }.onFailure {
            error = it.message ?: "تعذر التحقق من حماية الحساب."
        }
    }

    LazyColumn(
        contentPadding = PaddingValues(RawafidSpacing.ScreenHorizontal),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                Text("حساب روافد ورقمي", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("هذا هو الحساب الذي يمنحك معرّف RFD الثابت ويتيح ربط «دائرتي» بين الأجهزة. معرفة المعرّف وحدها لا تكشف رقم هاتفك أو بياناتك الصحية.")
            }
        }

        if (signedIn) {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        Text("تم تسجيل الدخول", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        val accountEmail = RawafidCircleApi.sessionEmail(context)
                        if (accountEmail.isNotBlank()) Text(accountEmail)
                        if (mfaRequired) {
                            Text("هذا الحساب محمي بتحقق بخطوتين. أكمل الرمز قبل استخدام بيانات الدائرة.", fontWeight = FontWeight.SemiBold)
                            if (challengeId == null) {
                                Button(
                                    enabled = !busy && mfaFactors.isNotEmpty(),
                                    onClick = {
                                        val factor = mfaFactors.firstOrNull() ?: return@Button
                                        runTask { challengeId = RawafidCircleApi.startMfaChallenge(context, factor.id) }
                                    }
                                ) { Text("إرسال طلب التحقق") }
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
                                            RawafidCircleApi.verifyMfa(context, factor.id, challenge, mfaCode)
                                            CircleNotificationScheduler.checkNow(context)
                                            mfaCode = ""
                                            challengeId = null
                                            sessionVersion++
                                        }
                                    }
                                ) { Text("تحقق") }
                            }
                        } else {
                            Text("الحساب جاهز. ارجع إلى «دائرتي» لعرض رقم RFD والـQR وإرسال أو قبول طلبات الربط.")
                            Button(onClick = onDone) { Text("العودة إلى دائرتي وعرض رقمي") }
                        }
                        OutlinedButton(
                            enabled = !busy,
                            onClick = { runTask { RawafidCircleApi.signOut(context); sessionVersion++ } }
                        ) { Text("تسجيل الخروج") }
                    }
                }
            }
        } else {
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                        Text("لأول مرة؟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("1) أنشئ حسابًا.  2) راجع بريدك لتأكيد الحساب إذا طُلب.  3) إذا لم تجد رسالة التأكيد في الوارد، افحص «الرسائل غير المرغوب فيها / Spam / Junk».  4) افتح رابط التأكيد ثم سجّل الدخول.  5) ارجع إلى «دائرتي» وسيظهر رقم RFD الخاص بك.")
                    }
                }
            }
            item {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                    FilterChip(
                        selected = mode == "signup",
                        onClick = {
                            mode = "signup"
                            error = ""
                            status = ""
                        },
                        label = { Text("إنشاء حساب جديد") }
                    )
                    FilterChip(
                        selected = mode == "login",
                        onClick = {
                            mode = "login"
                            error = ""
                            status = ""
                        },
                        label = { Text("لدي حساب — تسجيل الدخول") }
                    )
                }
            }
            item {
                Card {
                    Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)) {
                        if (mode == "signup") {
                            Text("إنشاء حساب روافد", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            Text("استخدم بريدًا يمكنك الوصول إليه. قد تحتاج إلى تأكيد الحساب من رسالة بريد؛ إذا لم تصل إلى الوارد فتحقق من Spam / Junk / الرسائل غير المرغوب فيها.")
                            Text("كلمة المرور المطلوبة: 10 أحرف على الأقل، وحرف إنجليزي كبير، وحرف صغير، ورقم، ورمز خاص. ستظهر علامة ✓ أمام كل شرط عند تحققه.", fontWeight = FontWeight.SemiBold)
                            OutlinedTextField(
                                value = name,
                                onValueChange = { name = it.take(120) },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("الاسم الظاهر") },
                                singleLine = true
                            )
                        } else {
                            Text("تسجيل الدخول", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        }

                        OutlinedTextField(
                            value = email,
                            onValueChange = { email = it.take(254) },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("البريد الإلكتروني") },
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = password,
                            onValueChange = { password = it.take(128) },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("كلمة المرور") },
                            singleLine = true,
                            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation()
                        )
                        TextButton(onClick = { passwordVisible = !passwordVisible }) {
                            Text(if (passwordVisible) "إخفاء كلمة المرور" else "إظهار كلمة المرور")
                        }

                        if (mode == "signup") {
                            Card {
                                Column(Modifier.padding(RawafidSpacing.CardContent), verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Xs)) {
                                    Text("شروط كلمة المرور", fontWeight = FontWeight.Bold)
                                    passwordRequirements.forEach { requirement ->
                                        Text(
                                            text = (if (requirement.met) "✓ " else "○ ") + requirement.label,
                                            color = if (requirement.met) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    Text("لا تستخدم كلمة المرور نفسها في خدمات أخرى، ولا ترسلها لأي شخص.", style = MaterialTheme.typography.bodySmall)
                                }
                            }
                            OutlinedTextField(
                                value = passwordConfirmation,
                                onValueChange = { passwordConfirmation = it.take(128) },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("تأكيد كلمة المرور") },
                                singleLine = true,
                                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation()
                            )
                            if (passwordConfirmation.isNotBlank()) {
                                Text(
                                    if (passwordMatches) "✓ كلمتا المرور متطابقتان" else "كلمتا المرور غير متطابقتين",
                                    color = if (passwordMatches) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
                                    style = MaterialTheme.typography.bodySmall
                                )
                            }
                        }

                        val canSubmit = if (mode == "login") {
                            !busy && email.contains('@') && password.isNotBlank()
                        } else {
                            !busy &&
                                name.isNotBlank() &&
                                email.contains('@') &&
                                CirclePasswordPolicy.isValid(password) &&
                                passwordMatches
                        }
                        Button(
                            enabled = canSubmit,
                            onClick = {
                                runTask {
                                    if (mode == "login") {
                                        RawafidCircleApi.signIn(context, email, password)
                                        CircleNotificationScheduler.checkNow(context)
                                        sessionVersion++
                                    } else {
                                        val created = RawafidCircleApi.signUp(context, name, email, password)
                                        if (RawafidCircleApi.hasSession(context)) {
                                            CircleNotificationScheduler.checkNow(context)
                                            sessionVersion++
                                        } else if (created) {
                                            status = "تم إنشاء الحساب. راجع بريدك لتأكيد الحساب إذا طُلب. إذا لم تجد رسالة التأكيد في الوارد، افحص الرسائل غير المرغوب فيها / Spam / Junk، ثم افتح رابط التأكيد وسجّل الدخول. بعد ذلك سيظهر رقم RFD في «دائرتي»."
                                            mode = "login"
                                            passwordConfirmation = ""
                                        }
                                    }
                                }
                            }
                        ) {
                            Text(
                                if (busy) "جارٍ التحقق..."
                                else if (mode == "login") "دخول"
                                else "إنشاء الحساب والحصول على رقم RFD"
                            )
                        }

                        if (mode == "login") {
                            OutlinedButton(
                                enabled = !busy && email.contains('@'),
                                onClick = { runTask { RawafidCircleApi.sendPasswordRecovery(email); status = "تم طلب رسالة استعادة كلمة المرور لهذا البريد." } }
                            ) { Text("نسيت كلمة المرور") }
                        }
                    }
                }
            }
        }

        if (status.isNotBlank()) item { Text(status, color = MaterialTheme.colorScheme.primary) }
        if (error.isNotBlank()) item { Text(error, color = MaterialTheme.colorScheme.error) }
    }
}
