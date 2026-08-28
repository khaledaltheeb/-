plugins { id("com.android.application") }

android {
    namespace = "org.healthrenewal.rawafid"
    compileSdk = 36

    defaultConfig {
        applicationId = "org.healthrenewal.rawafid"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
        vectorDrawables.useSupportLibrary = true
    }

    signingConfigs {
        create("release") {
            val storeFilePath = System.getenv("RAWAFID_KEYSTORE_PATH")
            if (!storeFilePath.isNullOrBlank()) {
                storeFile = file(storeFilePath)
                storePassword = System.getenv("RAWAFID_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("RAWAFID_KEY_ALIAS")
                keyPassword = System.getenv("RAWAFID_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isDebuggable = false
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            if (!System.getenv("RAWAFID_KEYSTORE_PATH").isNullOrBlank()) signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures { buildConfig = true }
    packaging { resources.excludes += "/META-INF/{AL2.0,LGPL2.1}" }

    lint {
        // API 36 is the current Play target required for this release. The CI SDK repository
        // does not yet expose android-37, so version-advisory checks are intentionally muted.
        disable += setOf("OldTargetApi", "GradleDependency")
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.8.0")
    implementation("com.google.android.material:material:1.14.0")
    implementation("androidx.work:work-runtime:2.11.2")
    implementation("androidx.security:security-crypto:1.1.0")
    compileOnly("com.google.code.findbugs:jsr305:3.0.2")
}
