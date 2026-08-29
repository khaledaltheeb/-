package org.healthrenewal.rawafid

import android.net.Uri
import android.os.Bundle
import com.google.androidbrowserhelper.trusted.LauncherActivity

class WebActivity : LauncherActivity() {
    companion object {
        const val EXTRA_URL = "rawafid_url"
    }

    private var launchUrl: Uri = Uri.parse("https://healthrenewal.org/")

    override fun onCreate(savedInstanceState: Bundle?) {
        intent.getStringExtra(EXTRA_URL)?.let { raw ->
            val parsed = runCatching { Uri.parse(raw) }.getOrNull()
            if (parsed?.scheme == "https" && parsed.host == "healthrenewal.org") {
                launchUrl = parsed
            }
        }
        super.onCreate(savedInstanceState)
    }

    override fun getLaunchingUrl(): Uri = launchUrl
}
