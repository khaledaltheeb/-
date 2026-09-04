package org.healthrenewal.rawafid

/**
 * Build-type-scoped backend configuration.
 *
 * Debug builds are deliberately disabled until Rawafid has dedicated non-production
 * Supabase/Firebase infrastructure. This prevents development APKs from reaching the
 * production Circle/account backend by default.
 */
object RawafidBackendConfig {
    val environment: String
        get() = BuildConfig.RAWAFID_ENV

    val isEnabled: Boolean
        get() = BuildConfig.RAWAFID_BACKEND_ENABLED

    val baseUrl: String
        get() = BuildConfig.RAWAFID_SUPABASE_URL.trim().trimEnd('/')

    val publishableKey: String
        get() = BuildConfig.RAWAFID_SUPABASE_PUBLISHABLE_KEY.trim()

    fun requireConfigured() {
        if (!isEnabled || baseUrl.isBlank() || publishableKey.isBlank()) {
            throw CircleApiException(
                "خدمات الحساب والدائرة معطلة في نسخة الاختبار الحالية لحماية بيئة الإنتاج. استخدم نسخة مهيأة لبيئة غير إنتاجية أو النسخة الرسمية."
            )
        }
    }
}
