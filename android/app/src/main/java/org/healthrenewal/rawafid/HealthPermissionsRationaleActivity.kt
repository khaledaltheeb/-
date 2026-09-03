package org.healthrenewal.rawafid

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity

class HealthPermissionsRationaleActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        startActivity(
            Intent(this, WebActivity::class.java)
                .putExtra(WebActivity.EXTRA_URL, "https://healthrenewal.org/privacy")
        )
        finish()
    }
}
