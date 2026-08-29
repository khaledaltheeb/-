package org.healthrenewal.rawafid;

import android.Manifest;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.view.Gravity;
import android.view.View;
import android.widget.*;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.google.android.material.materialswitch.MaterialSwitch;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

/** Local-only emergency center. It prepares communication in user-selected apps; it never sends silently. */
public final class EmergencyActivity extends AppCompatActivity {
    private static final int LOCATION_REQUEST=611;
    private SecurePrefs prefs;
    private LinearLayout root;
    private EditText messageInput;
    private MaterialSwitch locationSwitch;
    private LinearLayout contactsContainer;
    private final List<EmergencyPlan.Contact> contacts=new ArrayList<>();
    private int red=Color.rgb(177,45,52),teal=Color.rgb(11,107,103),bg=Color.rgb(250,248,247);

    @Override protected void onCreate(@Nullable Bundle state){
        super.onCreate(state);
        prefs=new SecurePrefs(this);
        contacts.addAll(prefs.getEmergencyContacts());
        render();
    }

    private void render(){
        ScrollView scroll=new ScrollView(this); scroll.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root=new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); root.setGravity(Gravity.START); root.setPadding(dp(18),dp(18),dp(18),dp(36)); root.setBackgroundColor(bg); scroll.addView(root);

        root.addView(text("مركز الطوارئ",28,true,red));
        root.addView(text("خطة محلية مشفرة تساعدك على تجهيز رسالة وموقعك وجهات الاتصال بسرعة. التطبيق لا يرسل أي رسالة أو يجري اتصالًا بصمت؛ أنت تؤكد الإرسال أو الاتصال في التطبيق المناسب.",14,false,Color.DKGRAY));

        Button use=button("استخدام خطة الطوارئ الآن",red); use.setTextSize(18); use.setOnClickListener(v->startEmergency()); root.addView(use);
        Button card=button("عرض بطاقة الطوارئ",Color.rgb(91,80,74)); card.setOnClickListener(v->showEmergencyCard()); root.addView(card);

        section("رسالة الطوارئ","اكتب نصًا واضحًا يفهمه من يستلم الرسالة. مثال: أنا مصاب بالزهايمر وقد أحتاج للمساعدة. يرجى الاتصال بعائلتي على الرقم المسجل.");
        messageInput=new EditText(this); messageInput.setMinLines(4); messageInput.setMaxLines(8); messageInput.setText(prefs.getEmergencyMessage()); messageInput.setHint("اكتب رسالة الطوارئ هنا"); rtl(messageInput); root.addView(messageInput,new LinearLayout.LayoutParams(-1,-2));

        locationSwitch=new MaterialSwitch(this); locationSwitch.setText("إرفاق موقعي الحالي عند استخدام الخطة"); locationSwitch.setChecked(prefs.isEmergencyLocationEnabled()); rtl(locationSwitch); root.addView(locationSwitch);
        root.addView(text("لن يطلب روافد موقعك أثناء التصفح. يُطلب إذن الموقع فقط عندما تستخدم خطة الطوارئ إذا كان هذا الخيار مفعّلًا.",13,false,Color.GRAY));

        section("جهات الطوارئ","يمكنك إضافة أكثر من شخص وأكثر من وسيلة تواصل لكل شخص. أدخل أرقام الهاتف بصيغة دولية عند استخدام WhatsApp مثل 9627XXXXXXXX.");
        contactsContainer=new LinearLayout(this); contactsContainer.setOrientation(LinearLayout.VERTICAL); contactsContainer.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); root.addView(contactsContainer); renderContacts();
        Button add=button("+ إضافة جهة طوارئ",teal); add.setOnClickListener(v->showContactDialog()); root.addView(add);

        Button save=button("حفظ خطة الطوارئ",teal); save.setOnClickListener(v->{ savePlan(); Toast.makeText(this,"تم حفظ خطة الطوارئ مشفرة على هذا الجهاز",Toast.LENGTH_LONG).show(); }); root.addView(save);
        Button clear=button("حذف خطة الطوارئ من الجهاز",Color.rgb(115,90,90)); clear.setOnClickListener(v->confirmClear()); root.addView(clear);

        root.addView(text("تنبيه: هذه الميزة وسيلة مساعدة وليست بديلًا عن خدمات الطوارئ الرسمية. توفر SMS وWhatsApp والبريد يعتمد على التطبيقات والخدمة والاتصال المتاح على جهازك.",13,false,Color.GRAY));
        setContentView(scroll);
    }

    private void showContactDialog(){
        LinearLayout box=new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setPadding(dp(18),0,dp(18),0); box.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        EditText name=new EditText(this); name.setHint("الاسم أو الصفة: ابنتي، أخي، مقدم الرعاية"); rtl(name); box.addView(name);
        EditText phone=new EditText(this); phone.setHint("رقم الهاتف مع رمز الدولة"); phone.setInputType(android.text.InputType.TYPE_CLASS_PHONE); rtl(phone); box.addView(phone);
        EditText email=new EditText(this); email.setHint("البريد الإلكتروني - اختياري"); email.setInputType(android.text.InputType.TYPE_CLASS_TEXT|android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS); rtl(email); box.addView(email);
        CheckBox call=new CheckBox(this); call.setText("اتصال هاتفي"); call.setChecked(true); rtl(call); box.addView(call);
        CheckBox sms=new CheckBox(this); sms.setText("SMS"); rtl(sms); box.addView(sms);
        CheckBox wa=new CheckBox(this); wa.setText("WhatsApp"); rtl(wa); box.addView(wa);
        CheckBox mail=new CheckBox(this); mail.setText("بريد إلكتروني"); rtl(mail); box.addView(mail);

        new AlertDialog.Builder(this).setTitle("إضافة جهة طوارئ").setView(box).setNegativeButton("إلغاء",null).setPositiveButton("إضافة",(d,w)->{
            EmergencyPlan.Contact c=new EmergencyPlan.Contact(name.getText().toString(),phone.getText().toString(),email.getText().toString(),call.isChecked(),sms.isChecked(),wa.isChecked(),mail.isChecked());
            if(!c.hasAnyAction()) { Toast.makeText(this,"أضف رقمًا أو بريدًا وفعّل وسيلة تواصل واحدة على الأقل",Toast.LENGTH_LONG).show(); return; }
            if(c.emailEnabled&&!c.email.isEmpty()&&!EmergencyPlan.looksLikeEmail(c.email)){ Toast.makeText(this,"صيغة البريد الإلكتروني غير صحيحة",Toast.LENGTH_LONG).show(); return; }
            if(contacts.size()>=EmergencyPlan.MAX_CONTACTS){ Toast.makeText(this,"وصلت للحد الأقصى من جهات الطوارئ",Toast.LENGTH_LONG).show(); return; }
            contacts.add(c); renderContacts(); savePlan();
        }).show();
    }

    private void renderContacts(){
        contactsContainer.removeAllViews();
        if(contacts.isEmpty()){ contactsContainer.addView(text("لم تضف جهة طوارئ بعد.",14,false,Color.GRAY)); return; }
        for(int i=0;i<contacts.size();i++){
            int index=i; EmergencyPlan.Contact c=contacts.get(i);
            LinearLayout row=new LinearLayout(this); row.setOrientation(LinearLayout.VERTICAL); row.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); row.setPadding(dp(14),dp(10),dp(14),dp(10)); row.setBackgroundColor(Color.WHITE);
            row.addView(text(c.name.isEmpty()?"جهة طوارئ":c.name,17,true,teal));
            if(!c.phone.isEmpty()) row.addView(text("الهاتف: "+c.phone,14,false,Color.DKGRAY));
            if(!c.email.isEmpty()) row.addView(text("البريد: "+c.email,14,false,Color.DKGRAY));
            StringBuilder channels=new StringBuilder(); if(c.callEnabled) channels.append("اتصال  "); if(c.smsEnabled) channels.append("SMS  "); if(c.whatsappEnabled) channels.append("WhatsApp  "); if(c.emailEnabled) channels.append("Email");
            row.addView(text("الوسائل: "+channels.toString().trim(),13,false,Color.GRAY));
            Button remove=button("حذف هذه الجهة",Color.rgb(125,105,105)); remove.setOnClickListener(v->{ contacts.remove(index); renderContacts(); savePlan(); }); row.addView(remove);
            LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2); p.setMargins(0,0,0,dp(10)); contactsContainer.addView(row,p);
        }
    }

    private void savePlan(){
        if(messageInput!=null) prefs.setEmergencyMessage(messageInput.getText().toString());
        if(locationSwitch!=null) prefs.setEmergencyLocationEnabled(locationSwitch.isChecked());
        prefs.setEmergencyContacts(contacts);
    }

    private void startEmergency(){
        savePlan();
        if(contacts.isEmpty()){ Toast.makeText(this,"أضف جهة طوارئ واحدة على الأقل أولًا",Toast.LENGTH_LONG).show(); return; }
        if(!prefs.isEmergencyLocationEnabled()){ showActions(""); return; }
        if(ContextCompat.checkSelfPermission(this,Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED && ContextCompat.checkSelfPermission(this,Manifest.permission.ACCESS_COARSE_LOCATION)!=PackageManager.PERMISSION_GRANTED){
            ActivityCompat.requestPermissions(this,new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},LOCATION_REQUEST); return;
        }
        obtainLocationThenShowActions();
    }

    @Override public void onRequestPermissionsResult(int requestCode,String[] permissions,int[] grantResults){
        super.onRequestPermissionsResult(requestCode,permissions,grantResults);
        if(requestCode==LOCATION_REQUEST){
            boolean granted=false; for(int g:grantResults) if(g==PackageManager.PERMISSION_GRANTED) granted=true;
            if(granted) obtainLocationThenShowActions();
            else { Toast.makeText(this,"سيتم تجهيز رسالة الطوارئ بدون الموقع",Toast.LENGTH_LONG).show(); showActions(""); }
        }
    }

    @SuppressWarnings("deprecation")
    private void obtainLocationThenShowActions(){
        LocationManager lm=(LocationManager)getSystemService(LOCATION_SERVICE);
        if(lm==null){ showActions(""); return; }
        try {
            String provider=lm.isProviderEnabled(LocationManager.GPS_PROVIDER)?LocationManager.GPS_PROVIDER:LocationManager.NETWORK_PROVIDER;
            Location last=lm.getLastKnownLocation(provider);
            if(last!=null && System.currentTimeMillis()-last.getTime()<15*60*1000L){ showActions(locationUrl(last)); return; }
            if(Build.VERSION.SDK_INT>=30){
                lm.getCurrentLocation(provider,new CancellationSignal(),getMainExecutor(),location->showActions(location==null?"":locationUrl(location)));
            } else {
                Toast.makeText(this,"جارٍ تحديد الموقع…",Toast.LENGTH_SHORT).show();
                lm.requestSingleUpdate(provider,location->showActions(location==null?"":locationUrl(location)),null);
                root.postDelayed(()->showActions(""),8000);
            }
        } catch(SecurityException|IllegalArgumentException e){ showActions(""); }
    }

    private String locationUrl(Location l){ return "https://maps.google.com/?q="+l.getLatitude()+","+l.getLongitude(); }

    private void showActions(String locationUrl){
        String message=EmergencyPlan.buildMessage(prefs.getEmergencyMessage(),locationUrl);
        LinearLayout box=new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); box.setPadding(dp(16),0,dp(16),0);
        TextView preview=text(message,14,false,Color.DKGRAY); preview.setTextIsSelectable(true); box.addView(preview);
        for(EmergencyPlan.Contact c:contacts){
            box.addView(text(c.name.isEmpty()?"جهة طوارئ":c.name,16,true,teal));
            if(c.callEnabled&&!c.phone.isEmpty()) actionButton(box,"اتصال بـ "+c.phone,v->dial(c.phone));
            if(c.smsEnabled&&!c.phone.isEmpty()) actionButton(box,"إرسال SMS",v->sms(c.phone,message));
            if(c.whatsappEnabled&&!c.phone.isEmpty()) actionButton(box,"فتح WhatsApp",v->whatsapp(c.phone,message));
            if(c.emailEnabled&&EmergencyPlan.looksLikeEmail(c.email)) actionButton(box,"إرسال بريد إلكتروني",v->email(c.email,message));
        }
        ScrollView scroll=new ScrollView(this); scroll.addView(box);
        new AlertDialog.Builder(this).setTitle("اختر طريقة التواصل").setView(scroll).setNegativeButton("إغلاق",null).show();
    }

    private void actionButton(LinearLayout box,String label,View.OnClickListener listener){ Button b=button(label,red); b.setOnClickListener(listener); box.addView(b); }
    private void dial(String phone){ open(new Intent(Intent.ACTION_DIAL,Uri.parse("tel:"+Uri.encode(phone)))); }
    private void sms(String phone,String message){ Intent i=new Intent(Intent.ACTION_SENDTO,Uri.parse("smsto:"+Uri.encode(phone))); i.putExtra("sms_body",message); open(i); }
    private void whatsapp(String phone,String message){
        String number=EmergencyPlan.whatsappNumber(phone); if(number.isEmpty()) return;
        try {
            String encoded=URLEncoder.encode(message,"UTF-8").replace("+","%20");
            open(new Intent(Intent.ACTION_VIEW,Uri.parse("https://wa.me/"+number+"?text="+encoded)));
        } catch(java.io.UnsupportedEncodingException ignored){
            Toast.makeText(this,"تعذر تجهيز رسالة WhatsApp على هذا الجهاز",Toast.LENGTH_LONG).show();
        }
    }
    private void email(String email,String message){
        Uri uri=Uri.parse("mailto:"+Uri.encode(email)+"?subject="+Uri.encode("رسالة طوارئ من روافد")+"&body="+Uri.encode(message)); open(new Intent(Intent.ACTION_SENDTO,uri));
    }
    private void open(Intent i){ try { startActivity(i); } catch(ActivityNotFoundException e){ Toast.makeText(this,"لا يوجد تطبيق مناسب لهذه الوسيلة على الجهاز",Toast.LENGTH_LONG).show(); } }

    private void showEmergencyCard(){
        savePlan();
        StringBuilder card=new StringBuilder(prefs.getEmergencyMessage());
        for(EmergencyPlan.Contact c:contacts){ if(!c.phone.isEmpty()) card.append("\n\n").append(c.name.isEmpty()?"جهة الطوارئ":c.name).append(": ").append(c.phone); }
        TextView v=text(card.toString(),20,true,Color.rgb(45,45,45)); v.setTextIsSelectable(true); v.setPadding(dp(20),dp(20),dp(20),dp(20));
        new AlertDialog.Builder(this).setTitle("بطاقة الطوارئ").setView(v).setPositiveButton("إغلاق",null).show();
    }

    private void confirmClear(){ new AlertDialog.Builder(this).setTitle("حذف خطة الطوارئ؟").setMessage("سيتم حذف الرسالة وجهات الطوارئ من هذا الجهاز نهائيًا.").setNegativeButton("إلغاء",null).setPositiveButton("حذف",(d,w)->{ prefs.clearEmergencyPlan(); contacts.clear(); render(); }).show(); }
    private void section(String title,String body){ TextView h=text(title,20,true,teal); h.setPadding(0,dp(18),0,0); root.addView(h); root.addView(text(body,14,false,Color.DKGRAY)); }
    private TextView text(String value,int sp,boolean bold,int color){ TextView t=new TextView(this); t.setText(value); t.setTextSize(sp); t.setTextColor(color); rtl(t); if(bold)t.setTypeface(t.getTypeface(),android.graphics.Typeface.BOLD); t.setLineSpacing(0,1.15f); t.setPadding(0,dp(5),0,dp(5)); return t; }
    private void rtl(TextView t){ t.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); t.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); t.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START); t.setGravity(Gravity.START|Gravity.CENTER_VERTICAL); }
    private Button button(String label,int color){ Button b=new Button(this); b.setText(label); b.setTextSize(16); b.setAllCaps(false); b.setTextColor(Color.WHITE); b.setBackgroundColor(color); b.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(56)); p.setMargins(0,dp(6),0,dp(6)); b.setLayoutParams(p); return b; }
    private int dp(int v){ return (int)(v*getResources().getDisplayMetrics().density); }
}
