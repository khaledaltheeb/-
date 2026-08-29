package org.healthrenewal.rawafid;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import androidx.core.content.ContextCompat;
import java.util.List;

/** Executes a pre-authorized SOS shortcut without requiring the user to navigate through the app. */
public final class EmergencyActionDispatcher {
    private EmergencyActionDispatcher(){}

    public static void dispatch(Context context,String source){
        Context app=context.getApplicationContext();
        SecurePrefs prefs=new SecurePrefs(app);
        EmergencyNotifier.showTriggered(app,source);

        if(!prefs.hasEmergencyPlan()){
            openCenter(app,true);
            return;
        }

        if(!prefs.isEmergencyShortcutImmediate()){
            showCard(app,source);
            return;
        }

        String action=SafetyTriggerConfig.normalizeAction(prefs.getEmergencyShortcutAction());
        if(SafetyTriggerConfig.ACTION_CENTER.equals(action)){
            openCenter(app,true);
            return;
        }
        if(SafetyTriggerConfig.ACTION_CALL_PRIMARY.equals(action)){
            if(callPrimary(app,prefs)) return;
        }
        showCard(app,source);
    }

    private static boolean callPrimary(Context context,SecurePrefs prefs){
        if(ContextCompat.checkSelfPermission(context,Manifest.permission.CALL_PHONE)!=PackageManager.PERMISSION_GRANTED) return false;
        List<EmergencyPlan.Contact> contacts=prefs.getEmergencyContacts();
        int preferred=prefs.getEmergencyPrimaryContactIndex();
        EmergencyPlan.Contact contact=null;
        if(preferred>=0&&preferred<contacts.size()&&!contacts.get(preferred).phone.isEmpty()) contact=contacts.get(preferred);
        if(contact==null){
            for(EmergencyPlan.Contact candidate:contacts){
                if(candidate!=null&&!candidate.phone.isEmpty()){ contact=candidate; break; }
            }
        }
        if(contact==null) return false;
        try {
            Intent call=new Intent(Intent.ACTION_CALL,Uri.parse("tel:"+Uri.encode(contact.phone)));
            call.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(call);
            return true;
        } catch(Exception ignored){ return false; }
    }

    public static void showCard(Context context,String source){
        Intent card=new Intent(context,EmergencyCardActivity.class);
        card.putExtra(EmergencyCardActivity.EXTRA_SOURCE,source==null?"":source);
        card.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);
        try { context.startActivity(card); }
        catch(Exception ignored){ openCenter(context,false); }
    }

    public static void openCenter(Context context,boolean triggered){
        Intent center=new Intent(context,EmergencyActivity.class);
        center.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
        try { context.startActivity(center); } catch(Exception ignored){}
    }
}