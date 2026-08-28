package org.healthrenewal.rawafid;

import android.content.Context;

public final class CompanionScheduler {
    private CompanionScheduler(){}
    public static void sendNow(Context context){ CompanionWorker.send(context); }
}
