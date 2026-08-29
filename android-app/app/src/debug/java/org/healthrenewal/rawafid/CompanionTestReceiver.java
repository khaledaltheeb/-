package org.healthrenewal.rawafid;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Debug-only receiver used by emulator smoke to prove a real Rafiqa notification can be posted from a cold process. */
public final class CompanionTestReceiver extends BroadcastReceiver {
    public static final String ACTION_SEND_TEST="org.healthrenewal.rawafid.debug.SEND_COMPANION_TEST";

    @Override public void onReceive(Context context, Intent intent){
        if(intent==null || !ACTION_SEND_TEST.equals(intent.getAction())) return;
        CompanionScheduler.sendNow(context.getApplicationContext());
    }
}
