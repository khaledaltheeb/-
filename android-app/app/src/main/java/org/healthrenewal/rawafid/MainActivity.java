package org.healthrenewal.rawafid;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.DatePickerDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.*;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.google.android.material.card.MaterialCardView;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;

public final class MainActivity extends AppCompatActivity {
    private static final String BASE = "https://healthrenewal.org";
    private LinearLayout root;
    private SecurePrefs prefs;
    private boolean atHome = true;
    private final int teal = Color.rgb(11,107,103), rose = Color.rgb(200,75,123), lilac = Color.rgb(125,91,166), bg = Color.rgb(248,251,250);

    private static final LinkedHashMap<String,String> FOLLOW_TOPICS = new LinkedHashMap<>();
    static {
        FOLLOW_TOPICS.put("الصحة النفسية", "/sectors/mental-health");
        FOLLOW_TOPICS.put("التربية الخاصة والدامجة", "/sectors/special-needs-inclusion");
        FOLLOW_TOPICS.put("سرطان الأطفال", "/sectors/pediatric-oncology");
        FOLLOW_TOPICS.put("الإدمان والتعافي", "/sectors/addiction-recovery");
        FOLLOW_TOPICS.put("التوحد", "/sections/autism");
        FOLLOW_TOPICS.put("صعوبات التعلم", "/sections/special-ed-learning-disabilities");
        FOLLOW_TOPICS.put("دعم الأسرة", "/sections/parenting-family");
        FOLLOW_TOPICS.put("أدلة التعامل والرعاية", "/care-guides/");
        FOLLOW_TOPICS.put("الأدلة العلمية", "/evidence-guides/");
        FOLLOW_TOPICS.put("الموسوعة", "/encyclopedia/");
        FOLLOW_TOPICS.put("الأدوات اليومية", "/daily-tools/");
        FOLLOW_TOPICS.put("المختبر المعرفي", "/cognitive-lab");
    }

    @Override protected void onCreate(@Nullable Bundle state) {
        super.onCreate(state);
        prefs = new SecurePrefs(this);
        requestNotifications();
        getOnBackPressedDispatcher().addCallback(this,new OnBackPressedCallback(true){
            @Override public void handleOnBackPressed(){
                if(atHome){ setEnabled(false); getOnBackPressedDispatcher().onBackPressed(); }
                else showHome();
            }
        });
        showHome();
        handleIntent(getIntent());
    }

    @Override protected void onNewIntent(Intent intent){ super.onNewIntent(intent); handleIntent(intent); }

    private void shell(String title){
        ScrollView sc = new ScrollView(this);
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(18),dp(14),dp(18),dp(32));
        root.setBackgroundColor(bg);
        sc.addView(root);
        TextView brand = text("روافد",30,true,teal);
        brand.setGravity(Gravity.END);
        root.addView(brand);
        TextView identity = text("منصة عربية للمعرفة الصحية والنفسية والتربوية",14,false,Color.DKGRAY);
        root.addView(identity);
        TextView sub = text(title,19,true,Color.rgb(45,45,52));
        sub.setPadding(0,dp(4),0,dp(14));
        root.addView(sub);
        setContentView(sc);
    }

    private void sectionTitle(String title,String body){
        TextView t=text(title,20,true,teal); t.setPadding(0,dp(16),0,0); root.addView(t);
        if(body!=null && !body.trim().isEmpty()) root.addView(text(body,14,false,Color.DKGRAY));
    }

    private void showHome(){
        atHome = true;
        shell("كل منصة روافد في تطبيق واحد");

        card("البحث في روافد 🔎","ابحث عن حالة، سؤال، دليل، مختص، مركز أو موضوع في مكتبة روافد.",teal,v->openWeb(BASE+"/search"));

        sectionTitle("استكشف روافد","وصول مباشر إلى المجالات والخدمات المنشورة على healthrenewal.org.");
        card("جميع القطاعات","استعرض القطاعات المعرفية المنشورة كاملة، وليس قائمة مختصرة داخل التطبيق.",Color.rgb(31,105,138),v->openWeb(BASE+"/sectors"));
        card("جميع الأقسام","تصفح الأقسام والتخصصات الفرعية في روافد.",Color.rgb(49,114,110),v->openWeb(BASE+"/sections"));
        card("أدلة التعامل والرعاية","أدلة عملية للأسرة والمريض ومقدم الرعاية حسب الحاجة والموقف.",Color.rgb(73,108,77),v->openWeb(BASE+"/care-guides/"));
        card("الأدلة العلمية","محتوى مبني على الدراسات والمصادر مع سياق علمي واضح.",Color.rgb(93,78,143),v->openWeb(BASE+"/evidence-guides/"));
        card("الموسوعة","الوصول إلى الموسوعات والمصطلحات والحالات المرجعية في روافد.",Color.rgb(130,91,54),v->openWeb(BASE+"/encyclopedia/"));
        card("الأدوات اليومية","أدوات عملية وتفاعلية منشورة ضمن المنصة.",Color.rgb(53,112,150),v->openWeb(BASE+"/daily-tools/"));
        card("المختبر المعرفي","أدوات معرفية وتفاعلية ومسارات تعلم ضمن روافد.",Color.rgb(91,83,150),v->openWeb(BASE+"/cognitive-lab"));
        card("المختصون","ابحث عن مختصين ضمن دليل روافد.",Color.rgb(86,114,92),v->openWeb(BASE+"/specialists"));
        card("المراكز","استعرض المراكز والخدمات المنشورة في الدليل.",Color.rgb(72,105,125),v->openWeb(BASE+"/centers"));

        sectionTitle("تابع ما يهمك","اختر أكثر من مجال، وسيبحث التطبيق عن المحتوى الجديد في اختياراتك.");
        card("اختياراتي والتنبيهات 🔔","حدد المجالات التي تريد متابعتها وتعديلها في أي وقت.",teal,v->showSectors());

        sectionTitle("أدواتي الشخصية","ميزات اختيارية داخل روافد وليست هوية التطبيق الأساسية.");
        card("رفيقة روافد 💗","مساحة اختيارية للعناية اليومية ورسائل الدعم العام باسم تختارينه.",rose,v->showCompanion());
        card("تقويم المرأة 🌷","أداة اختيارية لتسجيل الدورة والتوقعات التقريبية والمزاج محليًا على جهازكِ.",lilac,v->showCalendar());
    }

    private void showCompanion(){
        atHome=false;
        shell("رفيقة روافد 💗");
        root.addView(text("رفيقة روافد جزء اختياري من منصة روافد، وليست بديلًا عن المختص أو خدمة طوارئ.",15,false,Color.DKGRAY));
        EditText name=new EditText(this);
        name.setHint("الاسم الذي تفضلين أن أناديكِ به");
        name.setText(prefs.getName());
        name.setTextDirection(View.TEXT_DIRECTION_RTL);
        root.addView(name,new LinearLayout.LayoutParams(-1,dp(58)));
        Button save=button("حفظ الاسم",rose);
        save.setOnClickListener(v->{ prefs.setName(name.getText().toString()); Toast.makeText(this,"تم حفظ الاسم على جهازكِ",Toast.LENGTH_SHORT).show(); });
        root.addView(save);
        sectionTitle("كيف تشعرين الآن؟",null);
        moodButton("😊 مرتاحة", "جميل. احتفظي بهذه المساحة لنفسكِ اليوم.");
        moodButton("🙂 مستقرة", "يوم هادئ يستحق أن تعيشيه دون ضغط إضافي.");
        moodButton("😔 متعبة", "خففي التوقعات قليلًا. ما تحتاجينه الآن أهم من إثبات أي شيء.");
        moodButton("😣 مثقلة", "اختاري خطوة صغيرة الآن: ماء، راحة قصيرة، أو شخصًا تثقين به.");
        Button test=button("رسالة عناية الآن",lilac);
        test.setOnClickListener(v->CompanionScheduler.sendNow(this));
        root.addView(test);
        root.addView(text("يمكن إيقاف إشعارات رفيقة روافد من إعدادات إشعارات Android في أي وقت.",13,false,Color.GRAY));
    }

    private void moodButton(String label,String reply){
        Button b=button(label,Color.WHITE); b.setTextColor(Color.DKGRAY);
        b.setOnClickListener(v->Toast.makeText(this,reply,Toast.LENGTH_LONG).show()); root.addView(b);
    }

    private void showCalendar(){
        atHome=false;
        shell("تقويم المرأة 🌷");
        root.addView(text("بيانات الدورة محفوظة محليًا بصورة محمية. التوقعات تقريبية ولا تستخدم لمنع الحمل أو التشخيص.",14,false,Color.DKGRAY));
        TextView status=text(cycleSummary(),17,true,rose); root.addView(status);
        Button start=button("تسجيل أول يوم من آخر دورة",rose);
        start.setOnClickListener(v->{
            Calendar c=Calendar.getInstance();
            DatePickerDialog d=new DatePickerDialog(this,(view,y,m,day)->{
                Calendar s=Calendar.getInstance(); s.set(y,m,day,12,0,0);
                prefs.saveCycle(s.getTimeInMillis(),prefs.getCycleLength(),prefs.getPeriodLength()); status.setText(cycleSummary());
            },c.get(Calendar.YEAR),c.get(Calendar.MONTH),c.get(Calendar.DAY_OF_MONTH));
            d.show();
        });
        root.addView(start);
        addNumberSetting("متوسط طول الدورة",21,45,prefs.getCycleLength(),true,status);
        addNumberSetting("متوسط أيام الحيض",2,10,prefs.getPeriodLength(),false,status);
        sectionTitle("تسجيل اليوم","اختاري الانطباع الأقرب دون افتراض أن سببه الهرمونات وحدها.");
        moodButton("😊 جيدة","تم تسجيل انطباعكِ ضمن تجربتكِ المحلية.");
        moodButton("😐 عادية","الاستمرار بالتسجيل يساعدكِ على ملاحظة نمطك الشخصي.");
        moodButton("😔 منخفضة","عاملي نفسكِ بلطف اليوم، واطلبي دعمًا مهنيًا عند الحاجة.");
    }

    private void addNumberSetting(String title,int min,int max,int current,boolean cycle,TextView status){
        TextView t=text(getString(R.string.setting_value,title,current),15,false,Color.DKGRAY);
        SeekBar s=new SeekBar(this); s.setMax(max-min); s.setProgress(current-min);
        s.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){
            public void onProgressChanged(SeekBar b,int p,boolean f){
                int val=p+min; t.setText(getString(R.string.setting_value,title,val));
                if(f){
                    if(cycle)prefs.saveCycle(prefs.getLastPeriod(),val,prefs.getPeriodLength());
                    else prefs.saveCycle(prefs.getLastPeriod(),prefs.getCycleLength(),val);
                    status.setText(cycleSummary());
                }
            }
            public void onStartTrackingTouch(SeekBar b){}
            public void onStopTrackingTouch(SeekBar b){}
        });
        root.addView(t); root.addView(s);
    }

    private String cycleSummary(){
        long last=prefs.getLastPeriod();
        if(last==0L) return "ابدئي بتسجيل أول يوم من آخر دورة.";
        LocalDate start=Instant.ofEpochMilli(last).atZone(ZoneId.systemDefault()).toLocalDate();
        int cycle=prefs.getCycleLength();
        LocalDate next=start.plusDays(cycle);
        LocalDate ovulation=start.plusDays(Math.max(1,cycle-14));
        long days=ChronoUnit.DAYS.between(LocalDate.now(),next);
        return "آخر دورة: "+start+"\nالدورة التالية تقديريًا: "+next+" (بعد "+days+" يوم)\nالإباضة التقديرية: "+ovulation+"\nهذه تقديرات تقريبية وليست تشخيصًا أو وسيلة منع حمل.";
    }

    private void showSectors(){
        atHome=false;
        shell("اختياراتي والتنبيهات 🔔");
        root.addView(text("يمكنك اختيار أكثر من مجال. الاختيارات محفوظة على جهازك ويمكن تغييرها في أي وقت.",14,false,Color.DKGRAY));
        String selected=prefs.getSectors();
        List<CheckBox> boxes=new ArrayList<>();
        for(Map.Entry<String,String> e:FOLLOW_TOPICS.entrySet()){
            CheckBox c=new CheckBox(this); c.setText(e.getKey()); c.setTextSize(16); c.setTextDirection(View.TEXT_DIRECTION_RTL); c.setTag(e.getValue());
            c.setChecked(containsToken(selected,e.getValue())); boxes.add(c); root.addView(c);
        }
        Button save=button("حفظ اختياراتي",teal);
        save.setOnClickListener(v->{
            StringBuilder s=new StringBuilder();
            for(CheckBox c:boxes) if(c.isChecked()){ if(s.length()>0)s.append(','); s.append(c.getTag()); }
            prefs.setSectors(s.toString());
            Toast.makeText(this,"تم حفظ المجالات التي تتابعها.",Toast.LENGTH_SHORT).show();
        });
        root.addView(save);
        Button all=button("فتح جميع قطاعات روافد",Color.rgb(70,94,112)); all.setOnClickListener(v->openWeb(BASE+"/sectors")); root.addView(all);
    }

    private boolean containsToken(String selected,String token){
        for(String value:selected.split(",")) if(token.equals(value.trim())) return true;
        return false;
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void openWeb(String url){
        atHome=false;
        WebView w=new WebView(this);
        WebSettings s=w.getSettings();
        s.setJavaScriptEnabled(true);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setSupportMultipleWindows(false);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        w.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,android.webkit.WebResourceRequest req){
                Uri u=req.getUrl(); String h=u.getHost();
                if("healthrenewal.org".equals(h)||"www.healthrenewal.org".equals(h)) return false;
                startActivity(new Intent(Intent.ACTION_VIEW,u)); return true;
            }
        });
        w.loadUrl(url); setContentView(w);
    }

    private void handleIntent(Intent i){ if(i!=null && i.getData()!=null) openWeb(i.getData().toString()); }

    private void requestNotifications(){
        if(Build.VERSION.SDK_INT>=33 && ContextCompat.checkSelfPermission(this,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)
            ActivityCompat.requestPermissions(this,new String[]{Manifest.permission.POST_NOTIFICATIONS},400);
    }

    private void card(String title,String body,int accent,View.OnClickListener click){
        MaterialCardView c=new MaterialCardView(this); c.setRadius(dp(20)); c.setCardBackgroundColor(Color.WHITE);
        c.setStrokeColor(Color.argb(42,Color.red(accent),Color.green(accent),Color.blue(accent))); c.setStrokeWidth(dp(1)); c.setCardElevation(dp(1));
        LinearLayout box=new LinearLayout(this); box.setPadding(dp(18),dp(15),dp(18),dp(15)); box.setOrientation(LinearLayout.VERTICAL);
        TextView t=text(title,18,true,accent); TextView b=text(body,14,false,Color.DKGRAY); box.addView(t); box.addView(b); c.addView(box); c.setOnClickListener(click);
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2); p.setMargins(0,0,0,dp(10)); root.addView(c,p);
    }

    private TextView text(String s,int sp,boolean bold,int color){
        TextView t=new TextView(this); t.setText(s); t.setTextSize(sp); t.setTextColor(color); t.setTextDirection(View.TEXT_DIRECTION_RTL); t.setGravity(Gravity.END);
        if(bold)t.setTypeface(t.getTypeface(),Typeface.BOLD); t.setLineSpacing(0,1.15f); t.setPadding(0,dp(5),0,dp(5)); return t;
    }

    private Button button(String s,int color){
        Button b=new Button(this); b.setText(s); b.setTextSize(16); b.setAllCaps(false);
        if(color!=Color.WHITE){ b.setBackgroundColor(color); b.setTextColor(Color.WHITE); }
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(56)); p.setMargins(0,dp(6),0,dp(6)); b.setLayoutParams(p); return b;
    }

    private int dp(int v){ return (int)(v*getResources().getDisplayMetrics().density); }
}
