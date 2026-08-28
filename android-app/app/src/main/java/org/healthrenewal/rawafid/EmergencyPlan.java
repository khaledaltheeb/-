package org.healthrenewal.rawafid;

import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Pure model/serialization helpers for the local-only emergency plan. */
public final class EmergencyPlan {
    public static final int MAX_CONTACTS=20;
    public static final String DEFAULT_MESSAGE="أحتاج مساعدة. يرجى التواصل مع جهة الطوارئ المسجلة لدي.";

    private EmergencyPlan(){}

    public static final class Contact {
        public final String name;
        public final String phone;
        public final String email;
        public final boolean callEnabled;
        public final boolean smsEnabled;
        public final boolean whatsappEnabled;
        public final boolean emailEnabled;

        public Contact(String name,String phone,String email,boolean callEnabled,boolean smsEnabled,boolean whatsappEnabled,boolean emailEnabled){
            this.name=clean(name,80);
            this.phone=clean(phone,40);
            this.email=clean(email,160);
            this.callEnabled=callEnabled;
            this.smsEnabled=smsEnabled;
            this.whatsappEnabled=whatsappEnabled;
            this.emailEnabled=emailEnabled;
        }

        public boolean hasAnyAction(){
            return (callEnabled||smsEnabled||whatsappEnabled)&&!phone.isEmpty() || emailEnabled&&!email.isEmpty();
        }
    }

    public static String encodeContacts(List<Contact> contacts){
        JSONArray arr=new JSONArray();
        if(contacts==null) return arr.toString();
        int count=0;
        for(Contact c:contacts){
            if(c==null || !c.hasAnyAction()) continue;
            if(count++>=MAX_CONTACTS) break;
            JSONObject o=new JSONObject();
            try {
                o.put("name",c.name);
                o.put("phone",c.phone);
                o.put("email",c.email);
                o.put("call",c.callEnabled);
                o.put("sms",c.smsEnabled);
                o.put("whatsapp",c.whatsappEnabled);
                o.put("email_enabled",c.emailEnabled);
                arr.put(o);
            } catch(Exception ignored){}
        }
        return arr.toString();
    }

    public static List<Contact> decodeContacts(String raw){
        if(raw==null || raw.trim().isEmpty()) return Collections.emptyList();
        ArrayList<Contact> out=new ArrayList<>();
        try {
            JSONArray arr=new JSONArray(raw);
            for(int i=0;i<arr.length() && out.size()<MAX_CONTACTS;i++){
                JSONObject o=arr.optJSONObject(i); if(o==null) continue;
                Contact c=new Contact(
                        o.optString("name",""),
                        o.optString("phone",""),
                        o.optString("email",""),
                        o.optBoolean("call",false),
                        o.optBoolean("sms",false),
                        o.optBoolean("whatsapp",false),
                        o.optBoolean("email_enabled",false));
                if(c.hasAnyAction()) out.add(c);
            }
        } catch(Exception ignored){ return Collections.emptyList(); }
        return out;
    }

    public static String buildMessage(String customMessage,String locationUrl){
        String base=clean(customMessage,2000);
        if(base.isEmpty()) base=DEFAULT_MESSAGE;
        String location=clean(locationUrl,500);
        return location.isEmpty()?base:base+"\n\nموقعي الحالي: "+location;
    }

    /** WhatsApp wa.me accepts digits only, including the country code. */
    public static String whatsappNumber(String phone){
        if(phone==null) return "";
        StringBuilder out=new StringBuilder();
        for(int i=0;i<phone.length();i++){
            char c=phone.charAt(i);
            if(c>='0'&&c<='9') out.append(c);
        }
        return out.toString();
    }

    public static boolean looksLikeEmail(String email){
        if(email==null) return false;
        String v=email.trim();
        int at=v.indexOf('@');
        return at>0 && at<v.length()-3 && v.indexOf('.',at)>at+1 && v.indexOf(' ')==-1;
    }

    private static String clean(String value,int max){
        if(value==null) return "";
        String v=value.trim();
        if(v.length()>max) v=v.substring(0,max);
        return v;
    }
}
