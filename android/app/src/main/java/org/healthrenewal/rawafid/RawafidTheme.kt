package org.healthrenewal.rawafid

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

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

@Composable
fun RawafidTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) DarkColors else LightColors,
        typography = Typography(),
        content = content
    )
}
