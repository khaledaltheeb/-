package org.healthrenewal.rawafid;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import androidx.core.content.ContextCompat;
import java.net.URLEncoder;
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
        } else if(SafetyTriggerConfig.ACTION_SMS_PRIMARY.equals(action)){
            if(openSmsPrimary(app,prefs)) return;
        } else if(SafetyTriggerConfig.ACTION_WHATSAPP_PRIMARY.equals(action)){
            if(openWhatsAppPrimary(app,prefs)) return;
        }
        showCard(app,source);
    }

    private static EmergencyPlan.Contact primaryContact(SecurePrefs prefs){
        List<EmergencyPlan.Contact> contacts=prefs.getEmergencyContacts();
        int preferred=prefs.getEmergencyPrimaryContactIndex();
        if(preferred>=0&&preferred<contacts.size()){
            EmergencyPlan.Contact selected=contacts.get(preferred);
            if(selected!=null&&!selected.phone.isEmpty()) return selected;
        }
        for(EmergencyPlan.Contact candidate:contacts){
            if(candidate!=null&&!candidate.phone.isEmpty()) return candidate;
        }
        return null;
    }

    private static boolean callPrimary(Context context,SecurePrefs prefs){
        if(ContextCompat.checkSelfPermission(context,Manifest.permission.CALL_PHONE)!=PackageManager.PERMISSION_GRANTED) return false;
        EmergencyPlan.Contact contact=primaryContact(prefs);
        if(contact==null) return false;
        try {
            Intent call=new Intent(Intent.ACTION_CALL,Uri.parse("tel:"+Uri.encode(contact.phone)));
            call.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(call);
            return true;
        } catch(Exception ignored){ return false; }
    }

    private static boolean openSmsPrimary(Context context,SecurePrefs prefs){
        EmergencyPlan.Contact contact=primaryContact(prefs);
        if(contact==null) return false;
        try {
            Intent sms=new Intent(Intent.ACTION_SENDTO,Uri.parse("smsto:"+Uri.encode(contact.phone)));
            sms.putExtra("sms_body",shortcutMessage(prefs));
            sms.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(sms);
            return true;
        } catch(Exception ignored){ return false; }
    }

    private static boolean openWhatsAppPrimary(Context context,SecurePrefs prefs){
        EmergencyPlan.Contact contact=primaryContact(prefs);
        if(contact==null) return false;
        String number=EmergencyPlan.whatsappNumber(contact.phone);
        if(number.isEmpty()) return false;
        try {
            String encoded=URLEncoder.encode(shortcutMessage(prefs),"UTF-8").replace("+","%20");
            Intent whatsapp=new Intent(Intent.ACTION_VIEW,Uri.parse("https://wa.me/"+number+"?text="+encoded));
            whatsapp.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(whatsapp);
            return true;
        } catch(Exception ignored){ return false; }
    }

    private static String shortcutMessage(SecurePrefs prefs){
        String condition=prefs.getEmergencyCondition().trim();
        String note=prefs.getEmergencyCardNote().trim();
        String base=prefs.getEmergencyMessage().trim();
        StringBuilder message=new StringBuilder();
        if(!condition.isEmpty()) message.append("حالة طارئة: ").append(condition);
        if(!note.isEmpty()){
            if(message.length()>0) message.append('\n');
            message.append(note);
        }
        if(!base.isEmpty()){
            if(message.length()>0) message.append("\n\n");
            message.append(base);
        }
        if(message.length()==0) message.append(EmergencyPlan.DEFAULT_MESSAGE);
        return message.toString();
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