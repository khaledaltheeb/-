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

    testOptions {
        unitTests {
            isReturnDefaultValues = true
        }
    }

    lint {
        disable += setOf("OldTargetApi", "GradleDependency")
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.8.0")
    implementation("com.google.android.material:material:1.14.0")
    implementation("androidx.work:work-runtime:2.11.2")
    compileOnly("com.google.code.findbugs:jsr305:3.0.2")

    testImplementation("junit:junit:4.13.2")
    // Android's local JVM provides non-functional framework stubs for org.json.
    // Use the reference implementation so serialization/parser unit tests execute
    // the same JSON behavior that is available on real Android devices.
    testImplementation("org.json:json:20240303")
}
