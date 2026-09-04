import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.gms.google-services")
}

android {
    namespace = "org.healthrenewal.rawafid"
    compileSdk = 36

    defaultConfig {
        applicationId = "org.healthrenewal.rawafid"
        minSdk = 26
        targetSdk = 36
        versionCode = 4
        versionName = "0.4.0-beta01"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        debug {
            // Debug remains the same package until a dedicated Firebase Android app/config exists.
            // Supabase is intentionally fail-closed so local/beta builds cannot touch production by default.
            buildConfigField("String", "RAWAFID_ENV", "\"debug-isolated\"")
            buildConfigField("boolean", "RAWAFID_BACKEND_ENABLED", "false")
            buildConfigField("String", "RAWAFID_SUPABASE_URL", "\"\"")
            buildConfigField("String", "RAWAFID_SUPABASE_PUBLISHABLE_KEY", "\"\"")
        }
        release {
            isMinifyEnabled = true
            buildConfigField("String", "RAWAFID_ENV", "\"production\"")
            buildConfigField("boolean", "RAWAFID_BACKEND_ENABLED", "true")
            buildConfigField("String", "RAWAFID_SUPABASE_URL", "\"https://ghljwfwqsyfnthvlzxjy.supabase.co\"")
            buildConfigField("String", "RAWAFID_SUPABASE_PUBLISHABLE_KEY", "\"sb_publishable__GMG8aQnofuk_6RLm3UfUg_fIzuSzSs\"")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2026.06.01")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    val firebaseBom = platform("com.google.firebase:firebase-bom:34.18.0")
    implementation(firebaseBom)
    implementation("com.google.firebase:firebase-messaging")

    implementation("androidx.core:core-ktx:1.17.0")
    implementation("androidx.activity:activity-compose:1.13.0")
    implementation("androidx.fragment:fragment-ktx:1.8.9")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.10.0")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    debugImplementation("androidx.compose.ui:ui-tooling")
    implementation("androidx.work:work-runtime-ktx:2.11.2")
    implementation("androidx.webkit:webkit:1.17.0")
    implementation("androidx.health.connect:connect-client:1.1.0")
    implementation("com.google.android.gms:play-services-location:21.4.0")
    implementation("com.google.android.gms:play-services-code-scanner:16.1.0")
    implementation("com.google.zxing:core:3.5.4")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.3.0")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.7.0")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
