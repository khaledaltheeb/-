package org.healthrenewal.basira.voice

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.core.content.ContextCompat

sealed interface VoiceCommand {
    data object DescribeAhead : VoiceCommand
    data object RepeatGuidance : VoiceCommand
    data object Remaining : VoiceCommand
    data object Stop : VoiceCommand
    data object StartLive : VoiceCommand
    data class NavigateTo(val destination: String) : VoiceCommand
    data object Yes : VoiceCommand
    data object No : VoiceCommand
    data object Unknown : VoiceCommand
}

object ArabicVoiceCommandInterpreter {
    fun interpret(raw: String): VoiceCommand {
        val text = normalize(raw)
        if (text.isBlank()) return VoiceCommand.Unknown
        val commandText = removeWakeWord(text)

        if (commandText in STOP_COMMANDS) return VoiceCommand.Stop
        if (commandText in START_LIVE_COMMANDS) return VoiceCommand.StartLive
        if (commandText in DESCRIBE_COMMANDS) return VoiceCommand.DescribeAhead
        if (commandText in REPEAT_COMMANDS) return VoiceCommand.RepeatGuidance
        if (commandText in REMAINING_COMMANDS) return VoiceCommand.Remaining
        if (commandText in YES_COMMANDS) return VoiceCommand.Yes
        if (commandText in NO_COMMANDS) return VoiceCommand.No
        extractDestination(commandText)?.let { return VoiceCommand.NavigateTo(it) }
        return VoiceCommand.Unknown
    }

    private fun extractDestination(text: String): String? {
        KNOWN_DESTINATION_ALIASES[text]?.let { return it }

        val prefixes = listOf(
            "خذني ", "وديني ", "وصلني ", "وجهني ", "روح بي ", "روح ",
            "اذهب ", "اريد الذهاب ", "اريد اروح ", "المسار "
        )
        val rawDestination = prefixes.firstNotNullOfOrNull { prefix ->
            text.takeIf { it.startsWith(prefix) }?.removePrefix(prefix)?.trim()
        } ?: return null

        val destination = stripDestinationConnector(rawDestination)
        if (destination.length !in 2..50) return null
        return KNOWN_DESTINATION_ALIASES[destination] ?: destination
    }

    private fun stripDestinationConnector(value: String): String {
        var text = value.trim()
        listOf("الى ", "الي ", "على ", "علي ", "نحو ").firstOrNull { text.startsWith(it) }?.let {
            text = text.removePrefix(it).trim()
        }
        if (text.startsWith("لل") && text.length > 2) text = "ال" + text.drop(2)
        else if (text.startsWith("ل") && text.length > 2) text = text.drop(1)
        return text.trim()
    }

    private fun removeWakeWord(text: String): String {
        val prefixes = listOf("يا بصيره ", "بصيره ", "بصيره، ")
        return prefixes.firstNotNullOfOrNull { prefix ->
            text.takeIf { it.startsWith(prefix) }?.removePrefix(prefix)?.trim()
        } ?: text
    }

    fun normalize(value: String): String = value.lowercase()
        .replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
        .replace("ة", "ه").replace("ى", "ي")
        .replace(Regex("[ًٌٍَُِّْـ]"), "")
        .replace(Regex("[^\\p{L}\\p{N} ]"), " ")
        .replace(Regex("\\s+"), " ")
        .trim()

    private val STOP_COMMANDS = setOf(
        "توقف", "توقف الان", "قف", "قف الان", "وقف", "اوقف", "اوقف الان",
        "اوقف الوضع الحي", "اوقف الملاحة", "انهاء الوضع الحي", "انهي الملاحة",
        "سكر الوضع الحي", "وقف الملاحة"
    )

    private val START_LIVE_COMMANDS = setOf(
        "فعل الوضع الحي", "شغل الوضع الحي", "شغلي الوضع الحي", "ابدأ الوضع الحي", "ابدا الوضع الحي",
        "ابدئي الوضع الحي", "الوضع الحي", "شغل الكاميرا", "شغلي الكاميرا", "ابدأ الكاميرا",
        "الوضع المباشر", "شغل الوضع المباشر"
    )

    private val DESCRIBE_COMMANDS = setOf(
        "صف امامي", "صف ما امامي", "ماذا امامي", "ما امامي", "اوصف امامي", "شو امامي", "ماذا يوجد امامي"
    )
    private val REPEAT_COMMANDS = setOf("كرر", "اعد", "اعاده", "كرر التعليمات", "اعد التعليمات", "احكي مره ثانيه")
    private val REMAINING_COMMANDS = setOf("كم باقي", "كم تبقي", "المتبقي", "المسافه المتبقيه", "باقي كام", "قديش باقي")
    private val YES_COMMANDS = setOf("نعم", "ايوه", "اجل", "موافق", "نعم استخدم", "نعم استعمل", "استخدم النسخه", "استعمل النسخه")
    private val NO_COMMANDS = setOf("لا", "الغاء", "لا اريد", "ليس الان", "لا ليس الان")

    private val KNOWN_DESTINATION_ALIASES = mapOf(
        "الحمام" to "الحمام", "حمام" to "الحمام", "دوره المياه" to "الحمام", "دورة المياه" to "الحمام", "التواليت" to "الحمام",
        "المطبخ" to "المطبخ", "مطبخ" to "المطبخ",
        "غرفه النوم" to "غرفة النوم", "غرفة النوم" to "غرفة النوم", "النوم" to "غرفة النوم",
        "غرفه المعيشه" to "غرفة المعيشة", "غرفة المعيشة" to "غرفة المعيشة", "الصاله" to "غرفة المعيشة", "الصالة" to "غرفة المعيشة",
        "المدخل" to "المدخل", "مدخل" to "المدخل", "الباب الرئيسي" to "المدخل",
        "المخرج" to "المخرج", "مخرج" to "المخرج"
    ).mapKeys { normalize(it.key) }
}

// These error codes were added as named SpeechRecognizer constants in API 31.
// Using their stable documented integer values keeps the same behavior on API 24-30
// without referencing API-31-only fields at runtime or suppressing lint.
private const val ERROR_TOO_MANY_REQUESTS_COMPAT = 10
private const val ERROR_SERVER_DISCONNECTED_COMPAT = 11
private const val ERROR_LANGUAGE_NOT_SUPPORTED_COMPAT = 12
private const val ERROR_LANGUAGE_UNAVAILABLE_COMPAT = 13

/**
 * Resilient session-based Arabic command recognizer.
 *
 * SpeechRecognizer is not a true always-on streaming API, so every recognition
 * window is treated as disposable. The controller backs off when the provider
 * becomes busy, retries after normal no-match/timeouts, prefers on-device speech
 * recognition when available, and falls back to the installed system recognizer
 * when the local Arabic model is unavailable or repeatedly fails.
 */
class OnDeviceVoiceCommands(
    context: Context,
    private val onCommand: (VoiceCommand, String) -> Unit,
    private val onStatus: (String) -> Unit = {}
) : RecognitionListener {
    private val appContext = context.applicationContext
    private val main = Handler(Looper.getMainLooper())
    private var recognizer: SpeechRecognizer? = null
    private var active = false
    private var listening = false
    private var restartScheduled = false
    private var usingOnDevice = false
    private var forceSystemRecognizer = false
    private var consecutiveErrors = 0
    private var languageTag = "ar-JO"
    private var lastEmergencyAt = Long.MIN_VALUE

    val available: Boolean
        get() {
            if (ContextCompat.checkSelfPermission(appContext, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) return false
            val localAvailable = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                SpeechRecognizer.isOnDeviceRecognitionAvailable(appContext)
            return localAvailable || SpeechRecognizer.isRecognitionAvailable(appContext)
        }

    fun start() {
        if (!available) {
            onStatus("التعرف الصوتي غير متاح أو إذن الميكروفون غير ممنوح.")
            return
        }
        active = true
        restartListening()
    }

    fun restartListening() {
        if (!available) {
            active = false
            onStatus("لا يمكن تشغيل الاستماع: تحقق من إذن الميكروفون وخدمة التعرف الصوتي في الهاتف.")
            return
        }
        active = true
        restartScheduled = false
        listening = false
        main.removeCallbacksAndMessages(null)
        runCatching { recognizer?.cancel() }

        if (!ensureRecognizer()) {
            active = false
            onStatus("تعذر إنشاء خدمة التعرف الصوتي. تحقق من وجود خدمة تعرف صوتي مفعلة في الهاتف.")
            return
        }
        onStatus("تشغيل الاستماع الصوتي…")
        main.postDelayed({ listenNow() }, 180L)
    }

    private fun ensureRecognizer(): Boolean {
        if (recognizer != null) return true
        return runCatching {
            val localAvailable = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                SpeechRecognizer.isOnDeviceRecognitionAvailable(appContext)
            usingOnDevice = !forceSystemRecognizer && localAvailable
            recognizer = if (usingOnDevice && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                SpeechRecognizer.createOnDeviceSpeechRecognizer(appContext)
            } else {
                SpeechRecognizer.createSpeechRecognizer(appContext)
            }.also { it.setRecognitionListener(this) }
            true
        }.getOrElse {
            onStatus("فشل إنشاء محرك الاستماع: ${it.javaClass.simpleName}")
            false
        }
    }

    private fun recreateRecognizer(useSystem: Boolean) {
        runCatching { recognizer?.cancel() }
        runCatching { recognizer?.destroy() }
        recognizer = null
        listening = false
        forceSystemRecognizer = useSystem
        ensureRecognizer()
    }

    fun suspendForSpeech(durationMs: Long = 450L) {
        if (!active) return
        restartScheduled = true
        main.removeCallbacksAndMessages(null)
        listening = false
        runCatching { recognizer?.cancel() }
        main.postDelayed({
            restartScheduled = false
            listenNow()
        }, durationMs.coerceIn(250L, 1_200L))
    }

    fun stop() {
        active = false
        restartScheduled = false
        listening = false
        main.removeCallbacksAndMessages(null)
        runCatching { recognizer?.cancel() }
    }

    fun close() {
        stop()
        runCatching { recognizer?.destroy() }
        recognizer = null
    }

    private fun listenNow() {
        if (!active || !available || listening) return
        if (!ensureRecognizer()) {
            scheduleRestart(1_000L)
            return
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, languageTag)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 6)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, usingOnDevice)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 800L)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 500L)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 300L)
        }

        runCatching {
            recognizer?.startListening(intent)
            listening = true
        }.onFailure {
            listening = false
            onStatus("تعذر بدء الاستماع؛ تتم إعادة المحاولة تلقائيًا.")
            scheduleRestart(900L)
        }
    }

    private fun scheduleRestart(delayMs: Long = 450L) {
        if (!active || restartScheduled) return
        restartScheduled = true
        main.postDelayed({
            restartScheduled = false
            listenNow()
        }, delayMs)
    }

    private fun emitIfEmergency(texts: List<String>): Boolean {
        val selected = texts.firstOrNull {
            ArabicVoiceCommandInterpreter.interpret(it) is VoiceCommand.Stop
        } ?: return false
        val now = SystemClock.elapsedRealtime()
        if (lastEmergencyAt != Long.MIN_VALUE && now - lastEmergencyAt < 1_200L) return true
        lastEmergencyAt = now
        onCommand(VoiceCommand.Stop, selected)
        return true
    }

    private fun speechErrorLabel(error: Int): String = when (error) {
        SpeechRecognizer.ERROR_AUDIO -> "خطأ في الميكروفون/الصوت"
        SpeechRecognizer.ERROR_CLIENT -> "توقفت جلسة الاستماع"
        SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "إذن الميكروفون غير متاح"
        SpeechRecognizer.ERROR_NETWORK -> "تعذر الوصول لخدمة التعرف الصوتي"
        SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "انتهت مهلة خدمة التعرف الصوتي"
        SpeechRecognizer.ERROR_NO_MATCH -> "لم أفهم العبارة"
        SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "محرك الصوت مشغول"
        SpeechRecognizer.ERROR_SERVER -> "خدمة التعرف الصوتي غير جاهزة"
        ERROR_SERVER_DISCONNECTED_COMPAT -> "انقطع الاتصال بمحرك التعرف الصوتي"
        ERROR_TOO_MANY_REQUESTS_COMPAT -> "محرك الصوت طلب تهدئة إعادة الاستماع"
        SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "لم أسمع كلامًا"
        ERROR_LANGUAGE_NOT_SUPPORTED_COMPAT -> "اللغة العربية غير مدعومة في محرك الاستماع الحالي"
        ERROR_LANGUAGE_UNAVAILABLE_COMPAT -> "حزمة اللغة العربية غير متاحة في محرك الاستماع الحالي"
        else -> "خطأ تعرف صوتي رقم $error"
    }

    override fun onReadyForSpeech(params: Bundle?) {
        listening = true
        onStatus(
            if (usingOnDevice) "أستمع الآن • التعرف المحلي"
            else "أستمع الآن • خدمة التعرف الصوتي في الهاتف"
        )
    }

    override fun onBeginningOfSpeech() {
        onStatus("أسمعك الآن…")
    }

    override fun onRmsChanged(rmsdB: Float) = Unit
    override fun onBufferReceived(buffer: ByteArray?) = Unit

    override fun onEndOfSpeech() {
        listening = false
        onStatus("جاري فهم الأمر…")
    }

    override fun onError(error: Int) {
        listening = false
        consecutiveErrors += 1
        onStatus(speechErrorLabel(error))

        if (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) {
            active = false
            return
        }

        val languageUnavailable = error == ERROR_LANGUAGE_NOT_SUPPORTED_COMPAT ||
            error == ERROR_LANGUAGE_UNAVAILABLE_COMPAT
        val localRepeatedFailure = usingOnDevice && consecutiveErrors >= 3

        if (usingOnDevice && (languageUnavailable || localRepeatedFailure)) {
            languageTag = "ar"
            recreateRecognizer(useSystem = true)
            onStatus("تم التحويل تلقائيًا إلى خدمة التعرف الصوتي في الهاتف لدعم العربية.")
            scheduleRestart(350L)
            return
        }

        if (
            error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY ||
            error == SpeechRecognizer.ERROR_CLIENT ||
            error == ERROR_SERVER_DISCONNECTED_COMPAT
        ) {
            recreateRecognizer(useSystem = forceSystemRecognizer)
        }

        val delay = when (error) {
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> 900L
            SpeechRecognizer.ERROR_NO_MATCH, SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> 250L
            SpeechRecognizer.ERROR_NETWORK, SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> 1_200L
            ERROR_TOO_MANY_REQUESTS_COMPAT -> 4_000L
            ERROR_SERVER_DISCONNECTED_COMPAT -> 1_500L
            else -> 550L
        }
        scheduleRestart(delay)
    }

    override fun onResults(results: Bundle?) {
        listening = false
        consecutiveErrors = 0
        val texts = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION).orEmpty()
        if (!emitIfEmergency(texts)) {
            val selected = texts.firstOrNull {
                ArabicVoiceCommandInterpreter.interpret(it) !is VoiceCommand.Unknown
            } ?: texts.firstOrNull()

            if (selected != null) {
                val command = ArabicVoiceCommandInterpreter.interpret(selected)
                onStatus(
                    if (command is VoiceCommand.Unknown) "سمعت: $selected • لم أتعرف على الأمر"
                    else "سمعت: $selected"
                )
                onCommand(command, selected)
            } else {
                onStatus("لم يصل نص من محرك التعرف؛ تتم إعادة الاستماع.")
            }
        }
        scheduleRestart(220L)
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val texts = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION).orEmpty()
        if (emitIfEmergency(texts)) {
            listening = false
            runCatching { recognizer?.cancel() }
            scheduleRestart(250L)
        }
    }

    override fun onEvent(eventType: Int, params: Bundle?) = Unit
}
