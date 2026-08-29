package org.healthrenewal.rawafid

import android.app.Activity
import android.app.Application
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Bundle
import android.view.WindowManager

class RawafidApplication : Application(), Application.ActivityLifecycleCallbacks {
    override fun onCreate() {
        super.onCreate()
        registerActivityLifecycleCallbacks(this)
        createPrivacyFirstWomenChannels()
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

    override fun onActivityResumed(activity: Activity) {
        if (!isWomenSensitive(activity)) return

        if (WomenPrivacyStore.enabled(activity)) {
            activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        } else {
            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        }

        if (WomenPrivacyStore.enabled(activity) && !WomenPrivacyStore.sessionUnlocked(activity)) {
            activity.startActivity(WomenPrivacyGate.intent(activity, targetFor(activity)))
            activity.finish()
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

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) = Unit
    override fun onActivityStarted(activity: Activity) = Unit
    override fun onActivityPaused(activity: Activity) = Unit
    override fun onActivityStopped(activity: Activity) = Unit
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) = Unit
    override fun onActivityDestroyed(activity: Activity) = Unit
}
