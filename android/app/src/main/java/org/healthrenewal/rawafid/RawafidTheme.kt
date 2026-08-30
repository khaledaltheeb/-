package org.healthrenewal.rawafid

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.LocalMinimumInteractiveComponentSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp

private val LightColors = lightColorScheme(
    primary = Color(0xFF00696B),
    onPrimary = Color.White,
    primaryContainer = Color(0xFF9CF1F1),
    onPrimaryContainer = Color(0xFF002020),
    secondary = Color(0xFF466564),
    onSecondary = Color.White,
    background = Color(0xFFF6FAF9),
    onBackground = Color(0xFF171D1D),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF171D1D),
    surfaceVariant = Color(0xFFDAE5E3),
    onSurfaceVariant = Color(0xFF3F4948),
    outline = Color(0xFF6F7978),
    error = Color(0xFFBA1A1A),
    onError = Color.White
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF80D5D6),
    onPrimary = Color(0xFF003738),
    primaryContainer = Color(0xFF005051),
    onPrimaryContainer = Color(0xFF9CF1F1),
    secondary = Color(0xFFB0CCCA),
    onSecondary = Color(0xFF1B3534),
    background = Color(0xFF0E1515),
    onBackground = Color(0xFFDEE4E3),
    surface = Color(0xFF121B1B),
    onSurface = Color(0xFFDEE4E3),
    surfaceVariant = Color(0xFF3F4948),
    onSurfaceVariant = Color(0xFFBEC9C7),
    outline = Color(0xFF899391),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005)
)

private val HighContrastLight = lightColorScheme(
    primary = Color(0xFF004B4C),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD7FFFF),
    onPrimaryContainer = Color.Black,
    secondary = Color(0xFF213F3F),
    onSecondary = Color.White,
    background = Color.White,
    onBackground = Color.Black,
    surface = Color.White,
    onSurface = Color.Black,
    surfaceVariant = Color(0xFFE8EEEE),
    onSurfaceVariant = Color.Black,
    outline = Color(0xFF242424),
    error = Color(0xFF9B0000),
    onError = Color.White
)

private val HighContrastDark = darkColorScheme(
    primary = Color(0xFFB9FFFF),
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF006466),
    onPrimaryContainer = Color.White,
    secondary = Color(0xFFD8FFFF),
    onSecondary = Color.Black,
    background = Color.Black,
    onBackground = Color.White,
    surface = Color(0xFF090909),
    onSurface = Color.White,
    surfaceVariant = Color(0xFF202020),
    onSurfaceVariant = Color.White,
    outline = Color(0xFFD9D9D9),
    error = Color(0xFFFFB4AB),
    onError = Color.Black
)

val LocalRawafidAccessibility = staticCompositionLocalOf { AccessibilityProfile() }

private fun scaledTypography(scale: Float): Typography {
    val base = Typography()
    fun androidx.compose.ui.text.TextStyle.scaled() = copy(fontSize = fontSize * scale, lineHeight = lineHeight * scale)
    return base.copy(
        displayLarge = base.displayLarge.scaled(),
        displayMedium = base.displayMedium.scaled(),
        displaySmall = base.displaySmall.scaled(),
        headlineLarge = base.headlineLarge.scaled(),
        headlineMedium = base.headlineMedium.scaled(),
        headlineSmall = base.headlineSmall.scaled(),
        titleLarge = base.titleLarge.scaled(),
        titleMedium = base.titleMedium.scaled(),
        titleSmall = base.titleSmall.scaled(),
        bodyLarge = base.bodyLarge.scaled(),
        bodyMedium = base.bodyMedium.scaled(),
        bodySmall = base.bodySmall.scaled(),
        labelLarge = base.labelLarge.scaled(),
        labelMedium = base.labelMedium.scaled(),
        labelSmall = base.labelSmall.scaled()
    )
}

@Composable
fun RawafidTheme(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val accessibility = AccessibilityProfileStore.load(context)
    val dark = isSystemInDarkTheme()
    val colors = when {
        accessibility.highContrast && dark -> HighContrastDark
        accessibility.highContrast -> HighContrastLight
        dark -> DarkColors
        else -> LightColors
    }
    val minimumTargetSize = if (accessibility.largeTargets) 56.dp else 48.dp

    CompositionLocalProvider(
        LocalRawafidAccessibility provides accessibility,
        LocalMinimumInteractiveComponentSize provides minimumTargetSize
    ) {
        MaterialTheme(
            colorScheme = colors,
            typography = scaledTypography(accessibility.textScale),
            content = content
        )
    }
}
