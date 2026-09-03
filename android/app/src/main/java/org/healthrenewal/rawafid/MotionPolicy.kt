package org.healthrenewal.rawafid

object MotionPolicy {
    const val VENT_FADE_MILLIS = 700

    fun durationMillis(
        reduceMotion: Boolean,
        standardMillis: Int = VENT_FADE_MILLIS
    ): Int = if (reduceMotion) 0 else standardMillis.coerceAtLeast(0)
}
