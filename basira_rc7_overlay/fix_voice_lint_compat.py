from pathlib import Path

voice = Path("basira-rc7/app/src/main/java/org/healthrenewal/basira/voice/VoiceCommands.kt")
s = voice.read_text()
old = """        val delay = when (error) {
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> 900L
            SpeechRecognizer.ERROR_NO_MATCH, SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> 250L
            SpeechRecognizer.ERROR_NETWORK, SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> 1_200L
            ERROR_TOO_MANY_REQUESTS_COMPAT -> 4_000L
            ERROR_SERVER_DISCONNECTED_COMPAT -> 1_500L
            else -> 550L
        }
"""
new = """        val delay = if (error == ERROR_TOO_MANY_REQUESTS_COMPAT) {
            4_000L
        } else if (error == ERROR_SERVER_DISCONNECTED_COMPAT) {
            1_500L
        } else {
            when (error) {
                SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> 900L
                SpeechRecognizer.ERROR_NO_MATCH, SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> 250L
                SpeechRecognizer.ERROR_NETWORK, SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> 1_200L
                else -> 550L
            }
        }
"""
if old not in s:
    raise SystemExit("Expected RC7 recognizer delay block missing")
voice.write_text(s.replace(old, new, 1))
