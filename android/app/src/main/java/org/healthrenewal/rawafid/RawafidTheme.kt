package org.healthrenewal.rawafid

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LocalMinimumInteractiveComponentSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object RawafidSpacing {
    val Xxs = 4.dp
    val Xs = 8.dp
    val Sm = 12.dp
    val Md = 16.dp
    val Lg = 20.dp
    val Xl = 24.dp
    val Xxl = 32.dp
    val Xxxl = 40.dp
    val ScreenHorizontal = 20.dp
    val ScreenVertical = 18.dp
    val CardContent = 18.dp
    val SectionGap = 24.dp
}

object RawafidSemanticColors {
    val Success = Color(0xFF1C6B4A)
    val SuccessContainer = Color(0xFFD8F4E4)
    val OnSuccessContainer = Color(0xFF082719)
    val Warning = Color(0xFF8A6200)
    val WarningContainer = Color(0xFFFFE2A8)
    val OnWarningContainer = Color(0xFF2B1D00)
    val Calm = Color(0xFF386A8C)
    val CalmContainer = Color(0xFFD0E7FA)
    val OnCalmContainer = Color(0xFF071E2C)
}

private val RawafidShapes = Shapes(
    extraSmall = RoundedCornerShape(10.dp),
    small = RoundedCornerShape(14.dp),
    medium = RoundedCornerShape(20.dp),
    large = RoundedCornerShape(28.dp),
    extraLarge = RoundedCornerShape(36.dp)
)

private val LightColors = lightColorScheme(
    primary = Color(0xFF006A6B), onPrimary = Color.White,
    primaryContainer = Color(0xFFC5F3F0), onPrimaryContainer = Color(0xFF002020),
    secondary = Color(0xFF4A635F), onSecondary = Color.White,
    secondaryContainer = Color(0xFFCDE8E2), onSecondaryContainer = Color(0xFF06201D),
    tertiary = Color(0xFF805600), onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFDEA5), onTertiaryContainer = Color(0xFF291800),
    background = Color(0xFFF7FAF8), onBackground = Color(0xFF151D1B),
    surface = Color.White, onSurface = Color(0xFF151D1B),
    surfaceVariant = Color(0xFFDDE5E2), onSurfaceVariant = Color(0xFF3F4946),
    outline = Color(0xFF6F7976), outlineVariant = Color(0xFFBEC9C5),
    error = Color(0xFFBA1A1A), onError = Color.White,
    errorContainer = Color(0xFFFFDAD6), onErrorContainer = Color(0xFF410002)
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF7FD8D7), onPrimary = Color(0xFF003738),
    primaryContainer = Color(0xFF005051), onPrimaryContainer = Color(0xFF9CF1F0),
    secondary = Color(0xFFB1CCC6), onSecondary = Color(0xFF1C3531),
    secondaryContainer = Color(0xFF334B47), onSecondaryContainer = Color(0xFFCDE8E2),
    tertiary = Color(0xFFF6BE4F), onTertiary = Color(0xFF443000),
    tertiaryContainer = Color(0xFF624600), onTertiaryContainer = Color(0xFFFFDEA5),
    background = Color(0xFF0E1513), onBackground = Color(0xFFDEE4E1),
    surface = Color(0xFF121A18), onSurface = Color(0xFFDEE4E1),
    surfaceVariant = Color(0xFF3F4946), onSurfaceVariant = Color(0xFFBEC9C5),
    outline = Color(0xFF89938F), outlineVariant = Color(0xFF3F4946),
    error = Color(0xFFFFB4AB), onError = Color(0xFF690005),
    errorContainer = Color(0xFF93000A), onErrorContainer = Color(0xFFFFDAD6)
)

private val HighContrastLight = lightColorScheme(
    primary = Color(0xFF004B4C), onPrimary = Color.White,
    primaryContainer = Color(0xFFD7FFFF), onPrimaryContainer = Color.Black,
    secondary = Color(0xFF213F3B), onSecondary = Color.White,
    secondaryContainer = Color(0xFFE0FFF8), onSecondaryContainer = Color.Black,
    tertiary = Color(0xFF5B3B00), onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFE7BE), onTertiaryContainer = Color.Black,
    background = Color.White, onBackground = Color.Black,
    surface = Color.White, onSurface = Color.Black,
    surfaceVariant = Color(0xFFE8EEEE), onSurfaceVariant = Color.Black,
    outline = Color(0xFF242424), outlineVariant = Color(0xFF535353),
    error = Color(0xFF9B0000), onError = Color.White,
    errorContainer = Color(0xFFFFE2DF), onErrorContainer = Color.Black
)

private val HighContrastDark = darkColorScheme(
    primary = Color(0xFFB9FFFF), onPrimary = Color.Black,
    primaryContainer = Color(0xFF006466), onPrimaryContainer = Color.White,
    secondary = Color(0xFFD8FFF6), onSecondary = Color.Black,
    secondaryContainer = Color(0xFF365650), onSecondaryContainer = Color.White,
    tertiary = Color(0xFFFFD77C), onTertiary = Color.Black,
    tertiaryContainer = Color(0xFF745300), onTertiaryContainer = Color.White,
    background = Color.Black, onBackground = Color.White,
    surface = Color(0xFF090909), onSurface = Color.White,
    surfaceVariant = Color(0xFF202020), onSurfaceVariant = Color.White,
    outline = Color(0xFFD9D9D9), outlineVariant = Color(0xFFAAAAAA),
    error = Color(0xFFFFB4AB), onError = Color.Black,
    errorContainer = Color(0xFF7F0008), onErrorContainer = Color.White
)

val LocalRawafidAccessibility = staticCompositionLocalOf { AccessibilityProfile() }

private fun baseTypography(): Typography {
    val material = Typography()
    return material.copy(
        headlineLarge = material.headlineLarge.copy(fontSize = 32.sp, lineHeight = 40.sp, fontWeight = FontWeight.Bold),
        headlineMedium = material.headlineMedium.copy(fontSize = 27.sp, lineHeight = 35.sp, fontWeight = FontWeight.Bold),
        headlineSmall = material.headlineSmall.copy(fontSize = 23.sp, lineHeight = 31.sp, fontWeight = FontWeight.SemiBold),
        titleLarge = material.titleLarge.copy(fontSize = 21.sp, lineHeight = 29.sp, fontWeight = FontWeight.Bold),
        titleMedium = material.titleMedium.copy(fontSize = 17.sp, lineHeight = 25.sp, fontWeight = FontWeight.SemiBold),
        titleSmall = material.titleSmall.copy(fontSize = 15.sp, lineHeight = 23.sp, fontWeight = FontWeight.SemiBold),
        bodyLarge = material.bodyLarge.copy(fontSize = 17.sp, lineHeight = 28.sp),
        bodyMedium = material.bodyMedium.copy(fontSize = 15.sp, lineHeight = 24.sp),
        bodySmall = material.bodySmall.copy(fontSize = 13.sp, lineHeight = 20.sp),
        labelLarge = material.labelLarge.copy(fontSize = 15.sp, lineHeight = 22.sp, fontWeight = FontWeight.SemiBold),
        labelMedium = material.labelMedium.copy(fontSize = 13.sp, lineHeight = 19.sp, fontWeight = FontWeight.Medium),
        labelSmall = material.labelSmall.copy(fontSize = 11.sp, lineHeight = 17.sp, fontWeight = FontWeight.Medium)
    )
}

private fun scaledTypography(scale: Float): Typography {
    val base = baseTypography()
    fun androidx.compose.ui.text.TextStyle.scaled() = copy(fontSize = fontSize * scale, lineHeight = lineHeight * scale)
    return base.copy(
        displayLarge = base.displayLarge.scaled(), displayMedium = base.displayMedium.scaled(), displaySmall = base.displaySmall.scaled(),
        headlineLarge = base.headlineLarge.scaled(), headlineMedium = base.headlineMedium.scaled(), headlineSmall = base.headlineSmall.scaled(),
        titleLarge = base.titleLarge.scaled(), titleMedium = base.titleMedium.scaled(), titleSmall = base.titleSmall.scaled(),
        bodyLarge = base.bodyLarge.scaled(), bodyMedium = base.bodyMedium.scaled(), bodySmall = base.bodySmall.scaled(),
        labelLarge = base.labelLarge.scaled(), labelMedium = base.labelMedium.scaled(), labelSmall = base.labelSmall.scaled()
    )
}

private fun paletteColors(dark: Boolean, palette: String) = when (palette) {
    "ocean" -> if (dark) DarkColors.copy(primary = Color(0xFF91CAF4), primaryContainer = Color(0xFF174A67), tertiary = Color(0xFFFFC857))
    else LightColors.copy(primary = Color(0xFF2C6483), primaryContainer = Color(0xFFD0E8F8), tertiary = Color(0xFF7D5900))
    "sage" -> if (dark) DarkColors.copy(primary = Color(0xFFA4D8A7), primaryContainer = Color(0xFF315A39), tertiary = Color(0xFFECC76E))
    else LightColors.copy(primary = Color(0xFF3E7047), primaryContainer = Color(0xFFD8EFD9), tertiary = Color(0xFF775A00))
    "rose" -> if (dark) DarkColors.copy(primary = Color(0xFFF2B7C2), primaryContainer = Color(0xFF6B3945), tertiary = Color(0xFFFFC15B))
    else LightColors.copy(primary = Color(0xFF965365), primaryContainer = Color(0xFFFFD9E1), tertiary = Color(0xFF7B5700))
    else -> if (dark) DarkColors else LightColors
}

private fun personalizedColors(dark: Boolean, appearance: AppPersonalization, highContrast: Boolean) = when {
    highContrast && dark -> HighContrastDark
    highContrast -> HighContrastLight
    else -> {
        val base = paletteColors(dark, appearance.palette)
        val background = if (dark) {
            when (appearance.backgroundTone) {
                "pure" -> Color(0xFF080B0B)
                "warm" -> Color(0xFF171411)
                else -> base.background
            }
        } else {
            when (appearance.backgroundTone) {
                "pure" -> Color.White
                "warm" -> Color(0xFFFFF9F0)
                else -> base.background
            }
        }
        val surface = if (dark) {
            when (appearance.backgroundTone) {
                "pure" -> Color(0xFF101212)
                "warm" -> Color(0xFF211C17)
                else -> base.surface
            }
        } else {
            when (appearance.backgroundTone) {
                "pure" -> Color.White
                "warm" -> Color(0xFFFFFCF7)
                else -> base.surface
            }
        }
        val onSurface = if (dark) {
            when (appearance.textTone) {
                "soft" -> Color(0xFFC9D0CD)
                else -> Color(0xFFF1F5F3)
            }
        } else {
            when (appearance.textTone) {
                "strong" -> Color(0xFF080B0A)
                "soft" -> Color(0xFF39423F)
                else -> base.onSurface
            }
        }
        base.copy(
            background = background,
            surface = surface,
            onBackground = onSurface,
            onSurface = onSurface
        )
    }
}

@Composable
fun RawafidTheme(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val accessibility = AccessibilityProfileStore.load(context)
    val appearance = AppPersonalizationStore.observe(context)
    val systemDark = isSystemInDarkTheme()
    val dark = when (appearance.themeMode) {
        "light" -> false
        "dark" -> true
        else -> systemDark
    }
    val colors = personalizedColors(dark, appearance, accessibility.highContrast)
    val minimumTargetSize = if (accessibility.largeTargets) 56.dp else 48.dp

    CompositionLocalProvider(
        LocalRawafidAccessibility provides accessibility,
        LocalMinimumInteractiveComponentSize provides minimumTargetSize
    ) {
        MaterialTheme(
            colorScheme = colors,
            typography = scaledTypography(accessibility.textScale),
            shapes = RawafidShapes,
            content = content
        )
    }
}
