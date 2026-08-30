package org.healthrenewal.rawafid

data class CirclePasswordRequirement(
    val label: String,
    val met: Boolean
)

object CirclePasswordPolicy {
    const val MIN_LENGTH = 10

    private val symbolRegex = Regex("[!@#$%^&*()_+\\-=\\[\\]{};'\\\\:\"|<>?,./`~]")

    fun requirements(password: String): List<CirclePasswordRequirement> = listOf(
        CirclePasswordRequirement("10 أحرف على الأقل", password.length >= MIN_LENGTH),
        CirclePasswordRequirement("حرف إنجليزي كبير واحد على الأقل A-Z", password.any { it in 'A'..'Z' }),
        CirclePasswordRequirement("حرف إنجليزي صغير واحد على الأقل a-z", password.any { it in 'a'..'z' }),
        CirclePasswordRequirement("رقم واحد على الأقل 0-9", password.any(Char::isDigit)),
        CirclePasswordRequirement("رمز خاص واحد على الأقل مثل ! @ # $ %", symbolRegex.containsMatchIn(password))
    )

    fun isValid(password: String): Boolean = requirements(password).all { it.met }
}
