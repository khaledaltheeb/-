package org.healthrenewal.rawafid;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Debug-only smoke-test surface. It deliberately bypasses the user schedule and asks
 * the production notification path to post one Rafiqa message, so CI can prove that
 * notification delivery still works after the foreground UI process has been killed.
 * This class is compiled only into debug builds and is absent from release builds.
 */
public final class CompanionTestReceiver extends BroadcastReceiver {
    public static final String ACTION_SEND_TEST="org.healthrenewal.rawafid.debug.SEND_COMPANION_TEST";

    @Override public void onReceive(Context context, Intent intent){
        if(intent==null || !ACTION_SEND_TEST.equals(intent.getAction())) return;
        CompanionScheduler.sendNow(context.getApplicationContext());
    }
}
