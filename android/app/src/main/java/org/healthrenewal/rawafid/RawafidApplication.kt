package org.healthrenewal.rawafid

import android.app.Activity
import android.app.Application
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager

class RawafidApplication : Application(), Application.ActivityLifecycleCallbacks {
    override fun onCreate() {
        super.onCreate()
        registerActivityLifecycleCallbacks(this)
        createPrivacyFirstWomenChannels()
        CirclePushRegistration.registerCurrentToken(this)
    }

    private fun isWomenSensitive(activity: Activity): Boolean =
        activity is WomenActivity ||
            activity is WomenCalendarActivity ||
            activity is WomenCarePlannerActivity ||
            activity is WomenVisitPrepActivity ||
            activity is WomenPrivacySettingsActivity

    private fun targetFor(activity: Activity): String = when (activity) {
        is WomenCalendarActivity -> WomenPrivacyGate.TARGET_CALENDAR
        is WomenCarePlannerActivity -> WomenPrivacyGate.TARGET_PLANNER
        is WomenVisitPrepActivity -> WomenPrivacyGate.TARGET_VISIT_PREP
        is WomenPrivacySettingsActivity -> WomenPrivacyGate.TARGET_SETTINGS
        else -> WomenPrivacyGate.TARGET_COMPANION
    }

    /**
     * Apply the women-sector privacy contract before a sensitive Activity can
     * render a usable frame. The same check is repeated on resume so an expired
     * local privacy session cannot be bypassed by leaving an Activity in the
     * task stack and returning to it later.
     */
    private fun enforceWomenPrivacy(activity: Activity): Boolean {
        if (!isWomenSensitive(activity) || activity.isFinishing) return false

        val enabled = WomenPrivacyStore.enabled(activity)
        if (enabled) {
            activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        } else {
            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        }

        if (enabled && !WomenPrivacyStore.sessionUnlocked(activity)) {
            activity.startActivity(WomenPrivacyGate.intent(activity, targetFor(activity)))
            activity.finish()
            return true
        }
        return false
    }

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
        enforceWomenPrivacy(activity)
    }

    override fun onActivityResumed(activity: Activity) {
        if (enforceWomenPrivacy(activity)) return

        if (activity is WomenActivity && !WomenPrivacyStore.setupSeen(activity)) {
            activity.startActivity(Intent(activity, WomenPrivacySettingsActivity::class.java))
        }
    }

    private fun createPrivacyFirstWomenChannels() {
        val manager = getSystemService(NotificationManager::class.java) ?: return
        listOf(
            NotificationChannel("rawafid_women_companion", "رفيقة روافد", NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = "رسائل رفيقة روافد الاختيارية"
                lockscreenVisibility = Notification.VISIBILITY_PRIVATE
            },
            NotificationChannel("rawafid_women_care_planner", "خطة العناية النسائية", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "مواعيد العناية والفحوصات والمتابعات المحفوظة محليًا"
                lockscreenVisibility = Notification.VISIBILITY_PRIVATE
            }
        ).forEach(manager::createNotificationChannel)
    }

    override fun onActivityStarted(activity: Activity) = Unit
    override fun onActivityPaused(activity: Activity) = Unit
    override fun onActivityStopped(activity: Activity) = Unit
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) = Unit
    override fun onActivityDestroyed(activity: Activity) = Unit
}
