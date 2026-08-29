package org.healthrenewal.rawafid;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;

/** Lock-screen-friendly SOS notification. It does not expose more than the user opted to store. */
public final class EmergencyNotifier {
    private static final int NOTIFICATION_ID=7901;
    private EmergencyNotifier(){}

    public static void showTriggered(Context context,String source){
        NotificationManager nm=context.getSystemService(NotificationManager.class);
        if(nm==null) return;
        SecurePrefs prefs=new SecurePrefs(context);
        Intent card=new Intent(context,EmergencyCardActivity.class);
        card.putExtra(EmergencyCardActivity.EXTRA_SOURCE,source==null?"":source);
        card.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int flags=PendingIntent.FLAG_UPDATE_CURRENT;
        if(Build.VERSION.SDK_INT>=23) flags|=PendingIntent.FLAG_IMMUTABLE;
        PendingIntent content=PendingIntent.getActivity(context,7901,card,flags);

        String title=prefs.getEmergencyCondition().trim();
        if(title.isEmpty()) title="معلومات طوارئ";
        String text=prefs.getEmergencyCardNote().trim();
        if(text.isEmpty()) text=prefs.getEmergencyMessage();
        if(text.length()>180) text=text.substring(0,180)+"…";

        NotificationCompat.Builder b=new NotificationCompat.Builder(context,RawafidApp.CHANNEL_EMERGENCY)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(false)
                .setOngoing(false)
                .setContentIntent(content)
                .setOnlyAlertOnce(false)
                .setVibrate(new long[]{0,250,120,250});
        try { nm.notify(NOTIFICATION_ID,b.build()); } catch(SecurityException ignored){}
    }

    public static void cancel(Context context){
        NotificationManager nm=context.getSystemService(NotificationManager.class);
        if(nm!=null) nm.cancel(NOTIFICATION_ID);
    }
}