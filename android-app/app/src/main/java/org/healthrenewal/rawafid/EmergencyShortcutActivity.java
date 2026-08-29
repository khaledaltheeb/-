package org.healthrenewal.rawafid;

import android.Manifest;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.accessibility.AccessibilityManager;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.google.android.material.card.MaterialCardView;
import java.util.ArrayList;
import java.util.List;

/** User-facing setup for the optional hardware SOS shortcut. */
public final class EmergencyShortcutActivity extends AppCompatActivity {
    private static final int CALL_PERMISSION=731;
    private static final int NOTIFICATION_PERMISSION=732;
    private SecurePrefs prefs;
    private LinearLayout root;
    private EditText conditionInput,noteInput;
    private Spinner contactSpinner,patternSpinner,pressSpinner,windowSpinner,actionSpinner;
    private Switch enabledSwitch,immediateSwitch;
    private TextView serviceState,patternHelp,actionHelp;
    private Button callPermissionButton;
    private List<EmergencyPlan.Contact> contacts;
    private final int teal=Color.rgb(11,107,103),danger=Color.rgb(154,55,66),ink=Color.rgb(22,33,30),muted=Color.rgb(74,90,85),bg=Color.rgb(246,249,248);

    @Override protected void onCreate(@Nullable Bundle state){ super.onCreate(state); prefs=new SecurePrefs(this); render(); }
    @Override protected void onResume(){ super.onResume(); if(serviceState!=null) refreshServiceState(); }

    private void render(){
        ScrollView scroll=new ScrollView(this); scroll.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); scroll.setFillViewport(true); scroll.setBackgroundColor(bg);
        root=new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); root.setGravity(Gravity.START); root.setPadding(dp(18),dp(18),dp(18),dp(36)); scroll.addView(root);
        root.addView(text("SOS السريع",28,true,danger));
        root.addView(text("اضبط استجابة يمكن تشغيلها من مفاتيح الصوت دون فتح روافد أولًا. الإعدادات محفوظة مشفّرة على الجهاز.",14,false,muted));

        infoCard("لماذا لا نستخدم زر التشغيل؟","Android والشركات المصنّعة تحجز زر التشغيل واختصاراته لوظائف النظام، لذلك لا أعتمد عليه كمسار طوارئ يمكن ضمانه على جميع الأجهزة. روافد يستخدم مفاتيح الصوت، مع زر Quick Settings كمسار احتياطي.",Color.rgb(93,78,143));
        infoCard("الإرسال المباشر وحدوده","يمكن تنفيذ اتصال هاتفي مباشر بعد موافقة المستخدم المسبقة على إذن الاتصال. أما WhatsApp وSMS عبر تطبيقات المستخدم فتحتاج عادة ضغط الإرسال النهائي؛ روافد يستطيع فتح الجهة والرسالة جاهزتين فورًا لكنه لا يتجاوز حماية Android أو يرسل صامتًا من حسابك.",Color.rgb(31,105,138));

        section("بطاقة الحالة","اكتب ما تريد أن يراه من يساعدك بسرعة: مثل نوبة صرع، سكري، نوبة فزع، حساسية شديدة، أو تعليمات قصيرة.");
        conditionInput=input("عنوان الحالة، مثال: نوبة صرع"); conditionInput.setText(prefs.getEmergencyCondition()); root.addView(conditionInput);
        noteInput=input("تعليمات مختصرة، مثال: أبعد الأشياء الخطرة ولا تضع شيئًا في فمي. اتصل بوالدي."); noteInput.setMinLines(3); noteInput.setMaxLines(6); noteInput.setText(prefs.getEmergencyCardNote()); root.addView(noteInput);

        contacts=prefs.getEmergencyContacts();
        section("جهة الطوارئ الأساسية","تستخدم للاتصال المباشر أو لفتح رسالة الطوارئ الجاهزة عند اختيار أحد هذه الإجراءات.");
        ArrayList<String> contactLabels=new ArrayList<>();
        if(contacts.isEmpty()) contactLabels.add("لا توجد جهة اتصال — أضفها من مركز الطوارئ");
        else for(EmergencyPlan.Contact c:contacts) contactLabels.add((c.name.isEmpty()?"جهة طوارئ":c.name)+(c.phone.isEmpty()?"":" — "+c.phone));
        contactSpinner=spinner(contactLabels); if(!contacts.isEmpty()) contactSpinner.setSelection(Math.min(prefs.getEmergencyPrimaryContactIndex(),contacts.size()-1)); root.addView(contactSpinner,new LinearLayout.LayoutParams(-1,dp(56)));
        Button manage=button("إدارة جهات الطوارئ والرسالة",teal); manage.setOnClickListener(v->startActivity(new Intent(this,EmergencyActivity.class))); root.addView(manage);

        section("نمط الأزرار","اختر تسلسلًا متعمدًا لتقليل التشغيل بالخطأ. الضغط المطوّل لا يُحتسب؛ كل ضغطة منفصلة فقط.");
        String[] patterns={"رفع الصوت","خفض الصوت","رفع وخفض الصوت بالتبادل","رفع + خفض الصوت معًا"};
        patternSpinner=spinner(patterns); patternSpinner.setSelection(patternIndex(prefs.getEmergencyShortcutPattern())); root.addView(patternSpinner,new LinearLayout.LayoutParams(-1,dp(56)));
        patternHelp=text("",13,false,muted); root.addView(patternHelp);
        String[] presses={"ضغطتان","3 ضغطات","4 ضغطات","5 ضغطات","6 ضغطات"}; pressSpinner=spinner(presses); pressSpinner.setSelection(prefs.getEmergencyShortcutPresses()-2); root.addView(pressSpinner,new LinearLayout.LayoutParams(-1,dp(56)));
        String[] windows={"خلال 1.2 ثانية","خلال 1.8 ثانية","خلال 2.2 ثانية","خلال 3 ثوانٍ","خلال 4 ثوانٍ"}; windowSpinner=spinner(windows); windowSpinner.setSelection(windowIndex(prefs.getEmergencyShortcutWindowMs())); root.addView(windowSpinner,new LinearLayout.LayoutParams(-1,dp(56)));
        patternSpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener(){
            @Override public void onItemSelected(android.widget.AdapterView<?> parent,View view,int position,long id){ updatePatternControls(); }
            @Override public void onNothingSelected(android.widget.AdapterView<?> parent){}
        });
        updatePatternControls();

        enabledSwitch=new Switch(this); enabledSwitch.setText("تفعيل اختصار مفاتيح الصوت"); enabledSwitch.setTextSize(16); enabledSwitch.setChecked(prefs.isEmergencyShortcutEnabled()); rtl(enabledSwitch); root.addView(enabledSwitch);
        serviceState=text("",13,true,muted); root.addView(serviceState); refreshServiceState();
        Button accessibility=button("تفعيل خدمة اختصار SOS من إعدادات Android",Color.rgb(93,78,143)); accessibility.setOnClickListener(v->confirmAccessibilityDisclosure()); root.addView(accessibility);

        section("ماذا يحدث عند اكتمال الضغطات؟","وضع التأكيد يعرض البطاقة أولًا. الوضع الفوري ينتقل مباشرة إلى الإجراء الذي اخترته.");
        immediateSwitch=new Switch(this); immediateSwitch.setText("تنفيذ فوري — بدون شاشة تأكيد داخل روافد"); immediateSwitch.setTextSize(16); immediateSwitch.setChecked(prefs.isEmergencyShortcutImmediate()); rtl(immediateSwitch); root.addView(immediateSwitch);
        String[] actions={
                "عرض بطاقة الطوارئ فوق الشاشة",
                "فتح مركز الطوارئ",
                "اتصال مباشر بجهة الطوارئ الأساسية",
                "فتح SMS برسالة جاهزة إلى جهة الطوارئ",
                "فتح WhatsApp برسالة جاهزة إلى جهة الطوارئ"
        };
        actionSpinner=spinner(actions); actionSpinner.setSelection(actionIndex(prefs.getEmergencyShortcutAction())); root.addView(actionSpinner,new LinearLayout.LayoutParams(-1,dp(56)));
        actionHelp=text("",13,false,muted); root.addView(actionHelp);
        callPermissionButton=button("منح إذن الاتصال المباشر",danger); callPermissionButton.setOnClickListener(v->requestCallPermission()); root.addView(callPermissionButton);
        actionSpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener(){
            @Override public void onItemSelected(android.widget.AdapterView<?> parent,View view,int position,long id){ updateActionControls(); }
            @Override public void onNothingSelected(android.widget.AdapterView<?> parent){}
        });
        updateActionControls();

        section("مسار ثانٍ للطوارئ","يمكن إضافة مربع SOS روافد إلى Quick Settings من لوحة الإعدادات السريعة في Android. هذا يوفر زرًا سريعًا حتى دون فتح التطبيق.");
        Button quickSettings=button("فتح إعدادات النظام السريعة",Color.rgb(70,94,112)); quickSettings.setOnClickListener(v->openQuickSettings()); root.addView(quickSettings);

        Button save=button("حفظ إعداد SOS السريع",teal); save.setTextSize(18); save.setOnClickListener(v->save()); root.addView(save);
        Button test=button("اختبار الإجراء الآن",danger); test.setOnClickListener(v->{ save(); EmergencyActionDispatcher.dispatch(this,"settings_test"); }); root.addView(test);

        root.addView(text("تنبيه مهم: اختصار مفاتيح الصوت يعتمد على خدمة إمكانية الوصول التي يفعّلها المستخدم صراحة. قد تفرض بعض الشركات قيود بطارية أو شاشة قفل مختلفة؛ لذلك يجب اختبار الاختصار على الجهاز نفسه بعد الإعداد.",12,false,Color.GRAY));
        setContentView(scroll);
    }

    private void updatePatternControls(){
        if(patternSpinner==null||pressSpinner==null||windowSpinner==null||patternHelp==null) return;
        boolean chord=patternSpinner.getSelectedItemPosition()==3;
        pressSpinner.setVisibility(chord?View.GONE:View.VISIBLE);
        windowSpinner.setVisibility(chord?View.GONE:View.VISIBLE);
        patternHelp.setText(chord
                ? "يعمل هذا الخيار عندما يستقبل روافد مفتاحي رفع وخفض الصوت بفارق لا يتجاوز 650 مللي ثانية تقريبًا. لا يحتاج عدد ضغطات إضافيًا."
                : "حدد عدد الضغطات والمدة القصوى لإكمال التسلسل. يمكنك مثلًا اختيار 3 أو 4 ضغطات سريعة.");
    }

    private void updateActionControls(){
        if(actionSpinner==null||actionHelp==null||callPermissionButton==null) return;
        int action=actionSpinner.getSelectedItemPosition();
        callPermissionButton.setVisibility(action==2?View.VISIBLE:View.GONE);
        if(action==0) actionHelp.setText("يعرض الحالة والتعليمات وأرقام الطوارئ في بطاقة واضحة فوق الشاشة. هذا أفضل خيار عندما يحتاج من حول المستخدم إلى فهم حالته فورًا.");
        else if(action==1) actionHelp.setText("يفتح مركز الطوارئ الكامل لإتاحة الاتصال والرسائل وبقية الخيارات.");
        else if(action==2) actionHelp.setText("إذا كان «التنفيذ الفوري» مفعّلًا وإذن الاتصال ممنوحًا، يبدأ الاتصال مباشرة. عند غياب الإذن أو الرقم، تظهر بطاقة الطوارئ بدل الفشل الصامت.");
        else if(action==3) actionHelp.setText("يفتح تطبيق SMS مباشرة على جهة الطوارئ مع نص الحالة والرسالة مجهزًا. Android يترك ضغط زر الإرسال للمستخدم.");
        else actionHelp.setText("يفتح WhatsApp مباشرة على جهة الطوارئ مع نص الحالة والرسالة مجهزًا. يبقى ضغط زر الإرسال النهائي داخل WhatsApp.");
    }

    private void save(){
        prefs.setEmergencyCondition(conditionInput.getText().toString());
        prefs.setEmergencyCardNote(noteInput.getText().toString());
        if(!contacts.isEmpty()) prefs.setEmergencyPrimaryContactIndex(contactSpinner.getSelectedItemPosition());
        int patternPosition=patternSpinner.getSelectedItemPosition();
        String pattern=patternPosition==1?SafetyTriggerConfig.PATTERN_VOLUME_DOWN
                :patternPosition==2?SafetyTriggerConfig.PATTERN_ALTERNATE
                :patternPosition==3?SafetyTriggerConfig.PATTERN_VOLUME_CHORD
                :SafetyTriggerConfig.PATTERN_VOLUME_UP;
        prefs.setEmergencyShortcutPattern(pattern);
        if(!SafetyTriggerConfig.PATTERN_VOLUME_CHORD.equals(pattern)){
            prefs.setEmergencyShortcutPresses(pressSpinner.getSelectedItemPosition()+2);
            int[] windows={1200,1800,2200,3000,4000}; prefs.setEmergencyShortcutWindowMs(windows[windowSpinner.getSelectedItemPosition()]);
        }
        prefs.setEmergencyShortcutEnabled(enabledSwitch.isChecked());
        prefs.setEmergencyShortcutImmediate(immediateSwitch.isChecked());
        int actionPosition=actionSpinner.getSelectedItemPosition();
        String action=actionPosition==1?SafetyTriggerConfig.ACTION_CENTER
                :actionPosition==2?SafetyTriggerConfig.ACTION_CALL_PRIMARY
                :actionPosition==3?SafetyTriggerConfig.ACTION_SMS_PRIMARY
                :actionPosition==4?SafetyTriggerConfig.ACTION_WHATSAPP_PRIMARY
                :SafetyTriggerConfig.ACTION_CARD;
        prefs.setEmergencyShortcutAction(action);
        if(Build.VERSION.SDK_INT>=33 && ContextCompat.checkSelfPermission(this,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) ActivityCompat.requestPermissions(this,new String[]{Manifest.permission.POST_NOTIFICATIONS},NOTIFICATION_PERMISSION);
        if(enabledSwitch.isChecked()&&!isSafetyServiceEnabled()) Toast.makeText(this,"تم الحفظ. بقي تفعيل خدمة SOS من إعدادات إمكانية الوصول.",Toast.LENGTH_LONG).show();
        else Toast.makeText(this,"تم حفظ إعداد SOS السريع",Toast.LENGTH_SHORT).show();
    }

    private void requestCallPermission(){
        if(ContextCompat.checkSelfPermission(this,Manifest.permission.CALL_PHONE)==PackageManager.PERMISSION_GRANTED){ Toast.makeText(this,"إذن الاتصال المباشر مفعّل بالفعل",Toast.LENGTH_SHORT).show(); return; }
        new AlertDialog.Builder(this)
                .setTitle("السماح بالاتصال المباشر؟")
                .setMessage("يستخدم روافد الإذن فقط إذا اخترت أنت «اتصال مباشر» ضمن SOS. لن يجري التطبيق مكالمات دورية أو مخفية.")
                .setNegativeButton("إلغاء",null)
                .setPositiveButton("متابعة",(d,w)->ActivityCompat.requestPermissions(this,new String[]{Manifest.permission.CALL_PHONE},CALL_PERMISSION))
                .show();
    }

    private void confirmAccessibilityDisclosure(){
        new AlertDialog.Builder(this)
                .setTitle("تفعيل اختصار مفاتيح الصوت")
                .setMessage("لتشغيل SOS من مفاتيح الصوت خارج روافد، يحتاج Android إلى تفعيل خدمة إمكانية الوصول «SOS روافد».\n\nالخدمة تستقبل ضغطات مفاتيح رفع/خفض الصوت فقط لمطابقة التسلسل الذي تختاره. لا تقرأ محتوى الشاشة، لا تضغط أزرارًا نيابة عنك، لا تكتب نصوصًا، ولا ترسل بيانات إمكانية الوصول إلى خادم.\n\nبعد موافقتك ستفتح إعدادات Android، والتفعيل النهائي يتم بيدك من هناك.")
                .setNegativeButton("ليس الآن",null)
                .setPositiveButton("أوافق وأفتح الإعدادات",(d,w)->openAccessibilitySettings())
                .show();
    }

    private void openAccessibilitySettings(){ try { startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)); } catch(Exception ignored){} }
    private void openQuickSettings(){
        try { startActivity(new Intent("android.settings.QUICK_SETTINGS_SETTINGS")); }
        catch(Exception e){ try { startActivity(new Intent(Settings.ACTION_SETTINGS)); } catch(Exception ignored){} }
    }

    private boolean isSafetyServiceEnabled(){
        try {
            AccessibilityManager manager=(AccessibilityManager)getSystemService(ACCESSIBILITY_SERVICE); if(manager==null) return false;
            List<AccessibilityServiceInfo> services=manager.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK);
            for(AccessibilityServiceInfo info:services){
                if(info==null||info.getResolveInfo()==null||info.getResolveInfo().serviceInfo==null) continue;
                String name=info.getResolveInfo().serviceInfo.name;
                if(name!=null&&(name.equals(SafetyAccessibilityService.class.getName())||name.endsWith(".SafetyAccessibilityService"))) return true;
            }
        } catch(Exception ignored){}
        return false;
    }

    private void refreshServiceState(){ boolean on=isSafetyServiceEnabled(); serviceState.setText(on?"خدمة اختصار SOS: مفعّلة":"خدمة اختصار SOS: غير مفعّلة بعد"); serviceState.setTextColor(on?teal:danger); }
    private int patternIndex(String p){ return SafetyTriggerConfig.PATTERN_VOLUME_DOWN.equals(p)?1:SafetyTriggerConfig.PATTERN_ALTERNATE.equals(p)?2:SafetyTriggerConfig.PATTERN_VOLUME_CHORD.equals(p)?3:0; }
    private int actionIndex(String a){
        if(SafetyTriggerConfig.ACTION_CENTER.equals(a)) return 1;
        if(SafetyTriggerConfig.ACTION_CALL_PRIMARY.equals(a)) return 2;
        if(SafetyTriggerConfig.ACTION_SMS_PRIMARY.equals(a)) return 3;
        if(SafetyTriggerConfig.ACTION_WHATSAPP_PRIMARY.equals(a)) return 4;
        return 0;
    }
    private int windowIndex(int ms){ if(ms<=1400)return 0; if(ms<=2000)return 1; if(ms<=2600)return 2; if(ms<=3500)return 3; return 4; }

    @Override public void onRequestPermissionsResult(int requestCode,@NonNull String[] permissions,@NonNull int[] grantResults){ super.onRequestPermissionsResult(requestCode,permissions,grantResults); if(requestCode==CALL_PERMISSION&&grantResults.length>0) Toast.makeText(this,grantResults[0]==PackageManager.PERMISSION_GRANTED?"تم تفعيل الاتصال المباشر":"لم يتم منح إذن الاتصال",Toast.LENGTH_SHORT).show(); }

    private void section(String title,String body){ TextView h=text(title,19,true,teal); h.setPadding(0,dp(16),0,0); root.addView(h); root.addView(text(body,13,false,muted)); }
    private void infoCard(String title,String body,int accent){ MaterialCardView card=new MaterialCardView(this); card.setRadius(dp(18)); card.setCardBackgroundColor(Color.WHITE); card.setStrokeColor(Color.argb(55,Color.red(accent),Color.green(accent),Color.blue(accent))); card.setStrokeWidth(dp(1)); LinearLayout box=new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); box.setPadding(dp(15),dp(12),dp(15),dp(12)); box.addView(text(title,16,true,accent)); box.addView(text(body,13,false,muted)); card.addView(box); LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2); p.setMargins(0,dp(7),0,0); root.addView(card,p); }
    private EditText input(String hint){ EditText e=new EditText(this); e.setHint(hint); e.setTextSize(15); rtl(e); return e; }
    private Spinner spinner(List<String> values){ Spinner s=new Spinner(this); s.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); s.setAdapter(new ArrayAdapter<>(this,android.R.layout.simple_spinner_dropdown_item,values)); return s; }
    private Spinner spinner(String[] values){ Spinner s=new Spinner(this); s.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); s.setAdapter(new ArrayAdapter<>(this,android.R.layout.simple_spinner_dropdown_item,values)); return s; }
    private void rtl(TextView t){ t.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); t.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); t.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START); t.setGravity(Gravity.START|Gravity.CENTER_VERTICAL); }
    private TextView text(String value,int sp,boolean bold,int color){ TextView t=new TextView(this); t.setText(value); t.setTextSize(sp); t.setTextColor(color); rtl(t); if(bold)t.setTypeface(t.getTypeface(),android.graphics.Typeface.BOLD); t.setLineSpacing(0,1.16f); t.setPadding(0,dp(5),0,dp(5)); return t; }
    private Button button(String label,int color){ Button b=new Button(this); b.setText(label); b.setTextSize(16); b.setAllCaps(false); b.setTextColor(Color.WHITE); b.setBackgroundColor(color); b.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(56)); p.setMargins(0,dp(5),0,dp(5)); b.setLayoutParams(p); return b; }
    private int dp(int v){ return (int)(v*getResources().getDisplayMetrics().density); }
}