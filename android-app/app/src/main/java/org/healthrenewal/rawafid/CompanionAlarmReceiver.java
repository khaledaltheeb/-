package org.healthrenewal.rawafid;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class CompanionAlarmReceiver extends BroadcastReceiver {
    public static final String ACTION_COMPANION_ALARM="org.healthrenewal.rawafid.COMPANION_ALARM";

    @Override public void onReceive(Context context,Intent intent){
        if(intent==null || !ACTION_COMPANION_ALARM.equals(intent.getAction())) return;
        Context app=context.getApplicationContext();
        CompanionWorker.sendAuto(app);
        CompanionScheduler.scheduleNext(app);
    }
}
