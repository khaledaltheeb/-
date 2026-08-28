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
    private LinearLayout root; private SecurePrefs prefs; private boolean atHome=true;
    private final int teal=Color.rgb(11,107,103), rose=Color.rgb(200,75,123), lilac=Color.rgb(125,91,166), bg=Color.rgb(255,248,246);
    private static final LinkedHashMap<String,String> SECTORS=new LinkedHashMap<>();
    static {
        SECTORS.put("الصحة النفسية","/sectors/psychology"); SECTORS.put("التربية الدامجة والاحتياجات الخاصة","/sectors/special-needs");
        SECTORS.put("التعافي من الإدمان","/sectors/addiction-recovery"); SECTORS.put("الصرع","/sectors/epilepsy");
        SECTORS.put("الإرشاد والأسرة","/sectors/family"); SECTORS.put("الأبحاث والدراسات","/research");
        SECTORS.put("اختبر نفسك","/assessments"); SECTORS.put("الموسوعات","/sectors/short-encyclopedia");
    }
    @Override protected void onCreate(@Nullable Bundle state){
        super.onCreate(state); prefs=new SecurePrefs(this); requestNotifications();
        getOnBackPressedDispatcher().addCallback(this,new OnBackPressedCallback(true){
            @Override public void handleOnBackPressed(){
                if(atHome){ setEnabled(false); getOnBackPressedDispatcher().onBackPressed(); }
                else showHome();
            }
        });
        showHome(); handleIntent(getIntent());
    }
    @Override protected void onNewIntent(Intent intent){ super.onNewIntent(intent); handleIntent(intent); }
    private void shell(String title){
        ScrollView sc=new ScrollView(this); root=new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setPadding(dp(18),dp(14),dp(18),dp(24)); root.setBackgroundColor(bg); sc.addView(root);
        TextView brand=text("منصة روافد",28,true,teal); brand.setGravity(Gravity.END); root.addView(brand);
        TextView sub=text(title,18,true,Color.rgb(45,45,52)); sub.setPadding(0,0,0,dp(12)); sub.setGravity(Gravity.END); root.addView(sub); setContentView(sc);
    }
    private void showHome(){ atHome=true; shell("معرفة موثوقة، وأدوات تهتم بك كل يوم");
        card("رفيقة روافد 💗","مساحة يومية أنيقة للاهتمام والمزاج والثقة بالنفس ورسائل باسمكِ.",rose,v->showCompanion());
        card("تقويم المرأة 🌷","سجلي دورتكِ وتابعي التوقعات والأعراض والمزاج محليًا على جهازكِ.",lilac,v->showCalendar());
        card("اختاري ما يهمك 🔔","تابعي أكثر من قطاع، وسيخبرك التطبيق عندما يظهر محتوى جديد.",teal,v->showSectors());
        card("استكشفي منصة روافد 🌐","كل تحديث منشور على الموقع متاح في التطبيق مباشرة.",Color.rgb(39,111,159),v->openWeb("https://healthrenewal.org"));
        card("اختبر نفسك 🧠","أدوات فحص ذاتي تثقيفية لا تستبدل التشخيص المتخصص.",Color.rgb(99,88,160),v->openWeb("https://healthrenewal.org/assessments"));
        card("الموسوعة والأدلة 📚","وصول مباشر إلى محتوى روافد العربي المتجدد.",Color.rgb(94,125,89),v->openWeb("https://healthrenewal.org/sectors/short-encyclopedia"));
    }
    private void showCompanion(){ atHome=false; shell("رفيقة روافد 💗");
        TextView intro=text("أنا هنا لأهتم بكِ دون أحكام أو ضغط. اختاري الاسم الذي تحبين أن أناديكِ به.",17,false,Color.DKGRAY); root.addView(intro);
        EditText name=new EditText(this); name.setHint("اسمكِ الأول أو الاسم الذي تفضلينه"); name.setText(prefs.getName()); name.setTextDirection(View.TEXT_DIRECTION_RTL); root.addView(name,new LinearLayout.LayoutParams(-1,dp(58)));
        Button save=button("احفظي اسمي 💗",rose); save.setOnClickListener(v->{ prefs.setName(name.getText().toString()); Toast.makeText(this,"تم الحفظ بأمان على جهازكِ",Toast.LENGTH_SHORT).show(); }); root.addView(save);
        moodButton("😊 مرتاحة", "جميل. احتفظي بهذه المساحة لنفسكِ اليوم."); moodButton("🙂 مستقرة", "يوم هادئ يستحق أن تعيشيه دون ضغط إضافي."); moodButton("😔 متعبة", "خففي التوقعات قليلًا. ما تحتاجينه الآن أهم من إثبات أي شيء."); moodButton("😣 مثقلة", "لا تحاولي حل كل شيء الآن. اختاري خطوة صغيرة أو راحة قصيرة.");
        Button test=button("أرسلي لي رسالة عناية الآن",lilac); test.setOnClickListener(v->CompanionScheduler.sendNow(this)); root.addView(test);
        TextView note=text("رفيقة روافد تقدم دعمًا عامًا وأدوات عناية ذاتية، وليست خدمة تشخيص أو علاج أو طوارئ.",13,false,Color.GRAY); root.addView(note);
    }
    private void moodButton(String label,String reply){ Button b=button(label,Color.WHITE); b.setTextColor(Color.DKGRAY); b.setOnClickListener(v->Toast.makeText(this,reply,Toast.LENGTH_LONG).show()); root.addView(b); }
    private void showCalendar(){ atHome=false; shell("تقويم المرأة 🌷");
        TextView privacy=text("بيانات الدورة محفوظة مشفرة على جهازكِ. التوقعات تقديرية ولا تستخدم كوسيلة لمنع الحمل أو كتشخيص طبي.",14,false,Color.DKGRAY); root.addView(privacy);
        TextView status=text(cycleSummary(),17,true,rose); root.addView(status);
        Button start=button("تسجيل أول يوم من آخر دورة",rose); start.setOnClickListener(v->{ Calendar c=Calendar.getInstance(); DatePickerDialog d=new DatePickerDialog(this,(view,y,m,day)->{ Calendar s=Calendar.getInstance(); s.set(y,m,day,12,0,0); prefs.saveCycle(s.getTimeInMillis(),prefs.getCycleLength(),prefs.getPeriodLength()); status.setText(cycleSummary()); },c.get(Calendar.YEAR),c.get(Calendar.MONTH),c.get(Calendar.DAY_OF_MONTH)); d.show(); }); root.addView(start);
        addNumberSetting("متوسط طول الدورة",21,45,prefs.getCycleLength(),true,status); addNumberSetting("متوسط أيام الحيض",2,10,prefs.getPeriodLength(),false,status);
        TextView check=text("تسجيل اليوم: كيف تشعرين؟",18,true,lilac); root.addView(check); moodButton("😊 جيدة","سجلنا انطباعكِ لهذا اليوم في تجربتكِ المحلية."); moodButton("😐 عادية","شكرًا. الاستمرار بالتسجيل يساعدكِ على فهم نمطك الشخصي."); moodButton("😔 منخفضة","كوني ألطف مع نفسكِ اليوم، وراقبي ما تحتاجينه دون افتراض السبب.");
    }
    private void addNumberSetting(String title,int min,int max,int current,boolean cycle,TextView status){ TextView t=text(getString(R.string.setting_value,title,current),15,false,Color.DKGRAY); SeekBar s=new SeekBar(this); s.setMax(max-min); s.setProgress(current-min); s.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){ public void onProgressChanged(SeekBar b,int p,boolean f){ int val=p+min; t.setText(getString(R.string.setting_value,title,val)); if(f){ if(cycle)prefs.saveCycle(prefs.getLastPeriod(),val,prefs.getPeriodLength()); else prefs.saveCycle(prefs.getLastPeriod(),prefs.getCycleLength(),val); status.setText(cycleSummary()); }} public void onStartTrackingTouch(SeekBar b){} public void onStopTrackingTouch(SeekBar b){} }); root.addView(t); root.addView(s); }
    private String cycleSummary(){ long last=prefs.getLastPeriod(); if(last==0L) return "ابدئي بتسجيل أول يوم من آخر دورة."; LocalDate start=Instant.ofEpochMilli(last).atZone(ZoneId.systemDefault()).toLocalDate(); int cycle=prefs.getCycleLength(); LocalDate next=start.plusDays(cycle); LocalDate ovulation=start.plusDays(Math.max(1,cycle-14)); long days=ChronoUnit.DAYS.between(LocalDate.now(),next); return "آخر دورة: "+start+"\nالدورة التالية تقديريًا: "+next+" (بعد "+days+" يوم)\nالإباضة التقديرية: "+ovulation+"\nهذه تقديرات شخصية وليست تشخيصًا أو وسيلة منع حمل."; }
    private void showSectors(){ atHome=false; shell("القطاعات والتنبيهات 🔔"); String selected=prefs.getSectors(); List<CheckBox> boxes=new ArrayList<>(); for(Map.Entry<String,String> e:SECTORS.entrySet()){ CheckBox c=new CheckBox(this); c.setText(e.getKey()); c.setTextSize(16); c.setTextDirection(View.TEXT_DIRECTION_RTL); c.setTag(e.getValue()); c.setChecked(selected.contains(e.getValue())); boxes.add(c); root.addView(c); } Button save=button("حفظ اختياراتي",teal); save.setOnClickListener(v->{ StringBuilder s=new StringBuilder(); for(CheckBox c:boxes) if(c.isChecked()){ if(s.length()>0)s.append(','); s.append(c.getTag()); } prefs.setSectors(s.toString()); Toast.makeText(this,"تم حفظ القطاعات. سنراقب الجديد تلقائيًا.",Toast.LENGTH_SHORT).show(); }); root.addView(save); }
    @SuppressLint("SetJavaScriptEnabled")
    private void openWeb(String url){ atHome=false; WebView w=new WebView(this); WebSettings s=w.getSettings(); s.setJavaScriptEnabled(true); s.setJavaScriptCanOpenWindowsAutomatically(false); s.setSupportMultipleWindows(false); s.setDomStorageEnabled(true); s.setAllowFileAccess(false); s.setAllowContentAccess(false); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW); w.setWebViewClient(new WebViewClient(){ @Override public boolean shouldOverrideUrlLoading(WebView view,android.webkit.WebResourceRequest req){ Uri u=req.getUrl(); String h=u.getHost(); if("healthrenewal.org".equals(h)||"www.healthrenewal.org".equals(h)) return false; startActivity(new Intent(Intent.ACTION_VIEW,u)); return true; }}); w.loadUrl(url); setContentView(w); }
    private void handleIntent(Intent i){ if(i!=null && i.getData()!=null) openWeb(i.getData().toString()); }
    private void requestNotifications(){ if(Build.VERSION.SDK_INT>=33 && ContextCompat.checkSelfPermission(this,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) ActivityCompat.requestPermissions(this,new String[]{Manifest.permission.POST_NOTIFICATIONS},400); }
    private void card(String title,String body,int accent,View.OnClickListener click){ MaterialCardView c=new MaterialCardView(this); c.setRadius(dp(22)); c.setCardBackgroundColor(Color.WHITE); c.setStrokeColor(Color.argb(45,Color.red(accent),Color.green(accent),Color.blue(accent))); c.setStrokeWidth(dp(1)); c.setCardElevation(dp(2)); LinearLayout box=new LinearLayout(this); box.setPadding(dp(18),dp(16),dp(18),dp(16)); box.setOrientation(LinearLayout.VERTICAL); TextView t=text(title,19,true,accent); TextView b=text(body,14,false,Color.DKGRAY); box.addView(t); box.addView(b); c.addView(box); c.setOnClickListener(click); LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2); p.setMargins(0,0,0,dp(12)); root.addView(c,p); }
    private TextView text(String s,int sp,boolean bold,int color){ TextView t=new TextView(this); t.setText(s); t.setTextSize(sp); t.setTextColor(color); t.setTextDirection(View.TEXT_DIRECTION_RTL); t.setGravity(Gravity.END); if(bold)t.setTypeface(t.getTypeface(),Typeface.BOLD); t.setLineSpacing(0,1.15f); t.setPadding(0,dp(5),0,dp(5)); return t; }
    private Button button(String s,int color){ Button b=new Button(this); b.setText(s); b.setTextSize(16); b.setAllCaps(false); if(color!=Color.WHITE){ b.setBackgroundColor(color); b.setTextColor(Color.WHITE);} LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(56)); p.setMargins(0,dp(6),0,dp(6)); b.setLayoutParams(p); return b; }
    private int dp(int v){ return (int)(v*getResources().getDisplayMetrics().density); }
}
