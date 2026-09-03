package org.healthrenewal.rawafid

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class RawafidWidgetProvider : AppWidgetProvider() {
    companion object {
        private const val ACTION_WATER = "org.healthrenewal.rawafid.widget.WATER"

        fun updateAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val component = ComponentName(context, RawafidWidgetProvider::class.java)
            val ids = manager.getAppWidgetIds(component)
            ids.forEach { updateWidget(context, manager, it) }
        }

        private fun updateWidget(context: Context, manager: AppWidgetManager, id: Int) {
            val views = RemoteViews(context.packageName, R.layout.rawafid_widget)
            views.setTextViewText(R.id.widget_status, "ماء اليوم: ${LocalStore.waterCountToday(context)}")

            val tools = PendingIntent.getActivity(
                context,
                id * 10 + 1,
                Intent(context, ToolCatalogActivity::class.java),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            val safe = PendingIntent.getActivity(
                context,
                id * 10 + 2,
                Intent(context, SafeArrivalActivity::class.java),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            val water = PendingIntent.getBroadcast(
                context,
                id * 10 + 3,
                Intent(context, RawafidWidgetProvider::class.java).setAction(ACTION_WATER),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_tools, tools)
            views.setOnClickPendingIntent(R.id.widget_safe, safe)
            views.setOnClickPendingIntent(R.id.widget_water, water)
            manager.updateAppWidget(id, views)
        }
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        appWidgetIds.forEach { updateWidget(context, appWidgetManager, it) }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_WATER) {
            LocalStore.recordWater(context)
            updateAll(context)
        }
    }
}
