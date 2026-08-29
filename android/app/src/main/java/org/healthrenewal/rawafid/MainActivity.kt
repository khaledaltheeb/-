package org.healthrenewal.rawafid

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(24), dp(52), dp(24), dp(24))
            setBackgroundColor(Color.rgb(247, 251, 249))
        }

        root.addView(TextView(this).apply {
            text = "روافد"
            textSize = 38f
            setTextColor(Color.rgb(7, 95, 97))
            gravity = Gravity.CENTER
        }, params(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))

        root.addView(TextView(this).apply {
            text = "معرفة موثوقة، أدوات يومية، ودعم شخصي يحترم الخصوصية"
            textSize = 17f
            setTextColor(Color.rgb(38, 50, 56))
            gravity = Gravity.CENTER
            setPadding(0, dp(12), 0, dp(30))
        }, params(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))

        root.addView(actionButton("فتح منصة روافد") {
            startActivity(Intent(this, WebActivity::class.java))
        })

        root.addView(actionButton("التذكيرات والدعم اليومي") {
            startActivity(Intent(this, ReminderActivity::class.java))
        })

        root.addView(actionButton("تقويم المرأة") {
            startActivity(Intent(this, WebActivity::class.java).putExtra(WebActivity.EXTRA_URL, "https://healthrenewal.org/sectors/calendars/women"))
        })

        setContentView(root)
    }

    private fun actionButton(label: String, action: () -> Unit): Button = Button(this).apply {
        text = label
        textSize = 17f
        setOnClickListener { action() }
        isAllCaps = false
        setTextColor(Color.WHITE)
        setBackgroundColor(Color.rgb(7, 95, 97))
        val p = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(58)).apply {
            bottomMargin = dp(14)
        }
        layoutParams = p
    }

    private fun params(width: Int, height: Int) = LinearLayout.LayoutParams(width, height)
    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
}
