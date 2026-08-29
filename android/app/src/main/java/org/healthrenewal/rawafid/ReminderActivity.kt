package org.healthrenewal.rawafid

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class ReminderActivity : AppCompatActivity() {
    private lateinit var status: TextView

    private val notificationPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) ReminderScheduler.enable(this) else ReminderScheduler.disable(this)
        renderStatus()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(24), dp(44), dp(24), dp(24))
            setBackgroundColor(Color.rgb(247, 251, 249))
        }
        root.addView(TextView(this).apply {
            text = "الدعم اليومي"
            textSize = 30f
            gravity = Gravity.CENTER
            setTextColor(Color.rgb(7, 95, 97))
        })
        root.addView(TextView(this).apply {
            text = "أربع وقفات محلية تقريبًا عند 08:00، 12:00، 16:00 و20:00. لا يتم إرسال طلب إلى Supabase أو Cloudflare، ولا تُرفع استجاباتك أو بياناتك إلى الخادم."
            textSize = 16f
            gravity = Gravity.CENTER
            setPadding(0, dp(16), 0, dp(22))
        })
        status = TextView(this).apply {
            textSize = 17f
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, dp(18))
        }
        root.addView(status)
        root.addView(Button(this).apply {
            text = "تفعيل التذكيرات"
            isAllCaps = false
            setOnClickListener { enableReminders() }
            layoutParams = rowParams()
        })
        root.addView(Button(this).apply {
            text = "إيقاف التذكيرات"
            isAllCaps = false
            setOnClickListener {
                ReminderScheduler.disable(this@ReminderActivity)
                renderStatus()
            }
            layoutParams = rowParams()
        })
        root.addView(TextView(this).apply {
            text = "هذه الرسائل دعم عام وليست تشخيصًا أو علاجًا. يمكن إيقافها في أي وقت من هنا أو من إعدادات إشعارات Android."
            textSize = 14f
            setPadding(0, dp(24), 0, 0)
        })
        setContentView(root)
        renderStatus()
    }

    private fun enableReminders() {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            ReminderScheduler.enable(this)
            renderStatus()
        }
    }

    private fun renderStatus() {
        status.text = if (ReminderScheduler.isEnabled(this)) "الحالة: مفعّلة على هذا الهاتف" else "الحالة: متوقفة"
    }

    private fun rowParams() = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(56)).apply { bottomMargin = dp(12) }
    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
}
