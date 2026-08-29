package org.healthrenewal.rawafid;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.*;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.google.android.material.card.MaterialCardView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class MainActivity extends AppCompatActivity {
    private static final String BASE="https://healthrenewal.org";
    private static final String SECTOR_CATALOG=BASE+"/api/mobile/sectors";
    private static final int NOTIFICATION_REQUEST_CODE=400;

    private LinearLayout root;
    private SecurePrefs prefs;
    private boolean atHome=true;
    private WebView activeWebView;
    private final ExecutorService networkExecutor=Executors.newSingleThreadExecutor();
    private final int teal=Color.rgb(11,107,103), rose=Color.rgb(200,75,123), lilac=Color.rgb(125,91,166), bg=Color.rgb(248,251,250);

    private static final LinkedHashMap<String,String> FALLBACK_SECTORS=new LinkedHashMap<>();
    private static final LinkedHashMap<String,String> EXTRA_FOLLOW_PATHS=new LinkedHashMap<>();
    static {
        FALLBACK_SECTORS.put("الصحة النفسية","/sectors/mental-health");
        FALLBACK_SECTORS.put("التربية الخاصة والدامجة","/sectors/special-needs-inclusion");
        FALLBACK_SECTORS.put("سرطان الأطفال","/sectors/pediatric-oncology");
        FALLBACK_SECTORS.put("الإدمان والتعافي","/sectors/addiction-recovery");

        EXTRA_FOLLOW_PATHS.put("التوحد","/sections/autism");
        EXTRA_FOLLOW_PATHS.put("صعوبات التعلم","/sections/special-ed-learning-disabilities");
        EXTRA_FOLLOW_PATHS.put("دعم الأسرة","/sections/parenting-family");
        EXTRA_FOLLOW_PATHS.put("أدلة التعامل والرعاية","/care-guides/");
        EXTRA_FOLLOW_PATHS.put("الأدلة العلمية","/evidence-guides/");
        EXTRA_FOLLOW_PATHS.put("الموسوعة","/encyclopedia/");
        EXTRA_FOLLOW_PATHS.put("الأدوات اليومية","/daily-tools/");
        EXTRA_FOLLOW_PATHS.put("المختبر المعرفي","/cognitive-lab");
    }

    @Override protected void onCreate(@Nullable Bundle state){
        super.onCreate(state);
        prefs=new SecurePrefs(this);
        getOnBackPressedDispatcher().addCallback(this,new OnBackPressedCallback(true){
            @Override public void handleOnBackPressed(){
                if(activeWebView!=null && activeWebView.canGoBack()){
                    activeWebView.goBack();
                    return;
                }
                if(atHome){
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                } else {
                    showHome();
                }
            }
        });
        showHome();
        handleIntent(getIntent());
    }

    @Override protected void onNewIntent(Intent intent){
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    @Override public void onRequestPermissionsResult(int requestCode,@NonNull String[] permissions,@NonNull int[] grantResults){
        super.onRequestPermissionsResult(requestCode,permissions,grantResults);
        if(requestCode==NOTIFICATION_REQUEST_CODE){
            if(grantResults.length>0 && grantResults[0]==PackageManager.PERMISSION_GRANTED){
                CompanionScheduler.scheduleNext(this);
                Toast.makeText(this,"تم تفعيل إشعارات روافد",Toast.LENGTH_SHORT).show();
            } else {
                CompanionScheduler.cancel(this);
                Toast.makeText(this,"الإشعارات غير مفعلة. يمكنك تغيير ذلك لاحقًا من إعدادات التطبيق.",Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override protected void onDestroy(){
        networkExecutor.shutdownNow();
        if(activeWebView!=null){
            activeWebView.stopLoading();
            activeWebView.destroy();
            activeWebView=null;
        }
        super.onDestroy();
    }

    private void shell(String title){
        activeWebView=null;
        ScrollView sc=new ScrollView(this);
        sc.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root=new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root.setGravity(Gravity.START);
        root.setPadding(dp(18),dp(14),dp(18),dp(32));
        root.setBackgroundColor(bg);
        sc.addView(root);
        TextView brand=text("روافد",30,true,teal); root.addView(brand);
        root.addView(text("منصة عربية للمعرفة الصحية والنفسية والتربوية",14,false,Color.DKGRAY));
        TextView sub=text(title,19,true,Color.rgb(45,45,52)); sub.setPadding(0,dp(4),0,dp(14)); root.addView(sub);
        setContentView(sc);
    }

    private void sectionTitle(String title,String body){
        TextView t=text(title,20,true,teal); t.setPadding(0,dp(16),0,0); root.addView(t);
        if(body!=null && !body.trim().isEmpty()) root.addView(text(body,14,false,Color.DKGRAY));
    }

    private void showHome(){
        atHome=true;
        renderHomeFallback();
        loadDynamicHomeManifest();
    }

    private void renderHomeFallback(){
        shell("كل منصة روافد في تطبيق واحد");
        card("البحث في روافد 🔎","ابحث عن حالة، سؤال، دليل، مختص، مركز أو موضوع في مكتبة روافد.",teal,v->openWeb(BASE+"/search"));
        card("الطوارئ SOS","خطة طوارئ محلية مشفرة: رسالة مخصصة، عدة جهات اتصال، اتصال وSMS وWhatsApp وبريد مع خيار إرفاق الموقع.",Color.rgb(177,45,52),v->startActivity(new Intent(this,EmergencyActivity.class)));

        sectionTitle("استكشف روافد","وصول مباشر إلى المجالات والخدمات المنشورة على healthrenewal.org.");
        card("جميع القطاعات","استعرض القطاعات المعرفية المنشورة كاملة.",Color.rgb(31,105,138),v->openWeb(BASE+"/sectors"));
        card("جميع الأقسام","تصفح الأقسام والتخصصات الفرعية في روافد.",Color.rgb(49,114,110),v->openWeb(BASE+"/sections"));
        card("أدلة التعامل والرعاية","أدلة عملية للأسرة والمريض ومقدم الرعاية حسب الحاجة والموقف.",Color.rgb(73,108,77),v->openWeb(BASE+"/care-guides/"));
        card("الأدلة العلمية","محتوى مبني على الدراسات والمصادر مع سياق علمي واضح.",Color.rgb(93,78,143),v->openWeb(BASE+"/evidence-guides/"));
        card("الموسوعة","الموسوعات والمصطلحات والحالات المرجعية في روافد.",Color.rgb(130,91,54),v->openWeb(BASE+"/encyclopedia/"));
        card("الأدوات اليومية","أدوات عملية وتفاعلية منشورة ضمن المنصة.",Color.rgb(53,112,150),v->openWeb(BASE+"/daily-tools/"));
        card("المختبر المعرفي","أدوات معرفية وتفاعلية ومسارات تعلم ضمن روافد.",Color.rgb(91,83,150),v->openWeb(BASE+"/cognitive-lab"));
        card("المختصون","ابحث عن مختصين ضمن دليل روافد.",Color.rgb(86,114,92),v->openWeb(BASE+"/specialists"));
        card("المراكز","استعرض المراكز والخدمات المنشورة في الدليل.",Color.rgb(72,105,125),v->openWeb(BASE+"/centers"));

        sectionTitle("تابع ما يهمك","اختر أكثر من مجال واحصل على تنبيه عند ظهور محتوى جديد أو تعديل مهم في مجال تتابعه.");
        card("اختياراتي والتنبيهات 🔔","حدد المجالات التي تريد متابعتها وتعديلها في أي وقت.",teal,v->showSectors());

        sectionTitle("أدواتي الشخصية","ميزات اختيارية داخل روافد وليست هوية التطبيق الأساسية.");
        card("مكتبتي 📚","احفظ مواد روافد واقرأها لاحقًا، وافتح محفوظاتك من مكان واحد.",Color.rgb(70,94,112),v->startActivity(new Intent(this,LibraryActivity.class)));
        card("دفتر الأعراض 📝","سجل ملاحظاتك وشدة الأعراض والسياق وما ساعد، محليًا ومشفّرًا ودون تشخيص.",Color.rgb(73,108,77),v->startActivity(new Intent(this,SymptomJournalActivity.class)));
        card("رفيقة روافد 💗","مساحة اختيارية للعناية اليومية ورسائل الدعم العام باسم تختارينه.",rose,v->showCompanion());
        card("تقويم المرأة 🌷","أداة اختيارية لتسجيل الدورة والتوقعات التقريبية والمزاج محليًا على جهازكِ.",lilac,v->showCalendar());
        card("الخصوصية وبياناتي 🔐","اعرف ما يُحفظ محليًا واحذف سجل المزاج أو جميع البيانات الشخصية المحلية متى أردت.",Color.rgb(64,91,104),v->showPrivacy());
    }

    private void loadDynamicHomeManifest(){
        networkExecutor.execute(()->{
            try {
                MobileManifestClient.Manifest manifest=MobileManifestClient.fetch();
                runOnUiThread(()->{
                    if(!atHome||isFinishing()||isDestroyed()) return;
                    renderHomeFromManifest(manifest);
                });
            } catch(Exception ignored){
                // The fully functional local fallback remains visible offline or on API failure.
            }
        });
    }

    private void renderHomeFromManifest(MobileManifestClient.Manifest manifest){
        if(manifest==null) return;
        shell("كل منصة روافد في تطبيق واحد");
        card("البحث في روافد 🔎","ابحث عن حالة، سؤال، دليل، مختص، مركز أو موضوع في مكتبة روافد.",teal,v->openWeb(BASE+"/search"));

        sectionTitle("استكشف روافد","هذه الروابط تُدار من منصة روافد وتبقى متزامنة مع بنية الموقع.");
        int[] accents={Color.rgb(31,105,138),Color.rgb(49,114,110),Color.rgb(73,108,77),Color.rgb(93,78,143),Color.rgb(130,91,54),Color.rgb(53,112,150),Color.rgb(91,83,150),Color.rgb(86,114,92),Color.rgb(72,105,125)};
        int linkIndex=0;
        for(MobileManifestClient.Link link:manifest.discoverLinks){
            final String path=link.path;
            int accent=accents[linkIndex%accents.length];
            linkIndex++;
            card(link.title,"افتح هذا المسار من روافد؛ محتواه يأتي مباشرة من الموقع المنشور.",accent,v->openWeb(BASE+path));
        }

        sectionTitle("أدوات روافد","لا تظهر هنا إلا الأدوات المفعلة والمتوافقة مع هذه النسخة من التطبيق.");
        for(MobileManifestClient.Tool tool:manifest.tools) renderManifestTool(tool);
    }

    private void renderManifestTool(MobileManifestClient.Tool tool){
        if(tool==null) return;
        int accent=teal;
        if("emergency_center".equals(tool.id)) accent=Color.rgb(177,45,52);
        else if("companion".equals(tool.id)) accent=rose;
        else if("women_calendar".equals(tool.id)) accent=lilac;
        else if("privacy_center".equals(tool.id)) accent=Color.rgb(64,91,104);
        final MobileManifestClient.Tool selected=tool;
        card(tool.name,tool.description,accent,v->openManifestTool(selected));
    }

    private void openManifestTool(MobileManifestClient.Tool tool){
        if(tool==null) return;
        String route=tool.nativeRoute==null?"":tool.nativeRoute;
        if("emergency".equals(route)) startActivity(new Intent(this,EmergencyActivity.class));
        else if("follow_topics".equals(route)) showSectors();
        else if("companion".equals(route)) showCompanion();
        else if("women_calendar".equals(route)) showCalendar();
        else if("privacy".equals(route)) showPrivacy();
        else if("library".equals(route)) startActivity(new Intent(this,LibraryActivity.class));
        else if("symptom_journal".equals(route)) startActivity(new Intent(this,SymptomJournalActivity.class));
        else if(tool.webPath!=null&&!tool.webPath.isEmpty()&&tool.webPath.startsWith("/")&&!tool.webPath.startsWith("//")) openWeb(BASE+tool.webPath);
    }

    private void showCompanion(){
        atHome=false;
        shell("رفيقة روافد 💗");
        root.addView(text("رفيقة روافد جزء اختياري من منصة روافد، وليست بديلًا عن المختص أو خدمة طوارئ.",15,false,Color.DKGRAY));

        EditText name=new EditText(this);
        name.setHint("الاسم الذي تفضلين أن أناديكِ به");
        name.setText(prefs.getName());
        applyRtl(name);
        root.addView(name,new LinearLayout.LayoutParams(-1,dp(58)));
        Button saveName=button("حفظ الاسم",rose);
        saveName.setOnClickListener(v->{ prefs.setName(name.getText().toString()); Toast.makeText(this,"تم حفظ الاسم على جهازكِ",Toast.LENGTH_SHORT).show(); });
        root.addView(saveName);

        sectionTitle("إشعارات رفيقة روافد","حددي بنفسكِ عدد الرسائل، ساعات عملها، والفاصل بين الرسائل.");
        Switch enabled=new Switch(this);
        enabled.setText("تفعيل رسائل رفيقة روافد"); enabled.setTextSize(16); applyRtl(enabled); enabled.setChecked(prefs.isCompanionEnabled()); root.addView(enabled);

        final int[] dailyLimit={prefs.getCompanionDailyLimit()};
        final int[] intervalHours={prefs.getCompanionIntervalHours()};
        final int[] startHour={prefs.getCompanionStartHour()};
        final int[] endHour={prefs.getCompanionEndHour()};

        TextView dailyLabel=text("الحد الأقصى اليومي: "+dailyLimit[0]+" إشعارات",15,true,Color.DKGRAY); root.addView(dailyLabel);
        SeekBar dailySeek=new SeekBar(this); dailySeek.setMax(11); dailySeek.setProgress(dailyLimit[0]-1);
        dailySeek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){
            @Override public void onProgressChanged(SeekBar seekBar,int progress,boolean fromUser){ dailyLimit[0]=progress+1; dailyLabel.setText("الحد الأقصى اليومي: "+dailyLimit[0]+" إشعارات"); }
            @Override public void onStartTrackingTouch(SeekBar seekBar){} @Override public void onStopTrackingTouch(SeekBar seekBar){}
        }); root.addView(dailySeek);

        TextView intervalLabel=text("الفاصل الأدنى: كل "+intervalHours[0]+" ساعات",15,true,Color.DKGRAY); root.addView(intervalLabel);
        SeekBar intervalSeek=new SeekBar(this); intervalSeek.setMax(11); intervalSeek.setProgress(intervalHours[0]-1);
        intervalSeek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){
            @Override public void onProgressChanged(SeekBar seekBar,int progress,boolean fromUser){ intervalHours[0]=progress+1; intervalLabel.setText("الفاصل الأدنى: كل "+intervalHours[0]+" ساعات"); }
            @Override public void onStartTrackingTouch(SeekBar seekBar){} @Override public void onStopTrackingTouch(SeekBar seekBar){}
        }); root.addView(intervalSeek);

        TextView windowLabel=text(companionWindowLabel(startHour[0],endHour[0]),15,true,Color.DKGRAY); root.addView(windowLabel);
        LinearLayout timeRow=new LinearLayout(this); timeRow.setOrientation(LinearLayout.HORIZONTAL); timeRow.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); timeRow.setGravity(Gravity.CENTER);
        Button startButton=button("من "+formatHour(startHour[0]),lilac); Button endButton=button("إلى "+formatHour(endHour[0]),lilac);
        LinearLayout.LayoutParams timeParams=new LinearLayout.LayoutParams(0,dp(56),1f); timeParams.setMargins(dp(4),dp(4),dp(4),dp(4));
        startButton.setLayoutParams(timeParams); endButton.setLayoutParams(new LinearLayout.LayoutParams(timeParams)); timeRow.addView(startButton); timeRow.addView(endButton); root.addView(timeRow);
        startButton.setOnClickListener(v->new TimePickerDialog(this,(view,hour,minute)->{ startHour[0]=hour; startButton.setText("من "+formatHour(hour)); windowLabel.setText(companionWindowLabel(startHour[0],endHour[0])); },startHour[0],0,true).show());
        endButton.setOnClickListener(v->new TimePickerDialog(this,(view,hour,minute)->{ endHour[0]=hour; endButton.setText("إلى "+formatHour(hour)); windowLabel.setText(companionWindowLabel(startHour[0],endHour[0])); },endHour[0],0,true).show());
        root.addView(text("إذا كان وقت البداية والنهاية متساويين، تعتبر النافذة طوال اليوم. قد يؤخر Android بعض الإشعارات قليلًا بسبب إدارة البطارية.",13,false,Color.GRAY));

        Button saveSchedule=button("حفظ إعدادات الإشعارات",rose);
        saveSchedule.setOnClickListener(v->{
            prefs.saveCompanionSchedule(enabled.isChecked(),dailyLimit[0],startHour[0],endHour[0],intervalHours[0]);
            if(enabled.isChecked()) requestNotificationsContextually();
            Toast.makeText(this,"تم حفظ جدول رفيقة روافد",Toast.LENGTH_SHORT).show();
        }); root.addView(saveSchedule);

        addMoodModule("تسجيل مزاجي","سجلي انطباعًا بسيطًا. تُحفظ التسجيلات محليًا ومشفرة، ويحتاج التطبيق بيانات متكررة قبل عرض أي نمط.");

        Button test=button("رسالة عناية الآن",lilac);
        test.setOnClickListener(v->{
            if(hasNotificationPermission()) CompanionScheduler.sendNow(this);
            else { requestNotificationsContextually(); Toast.makeText(this,"امنحي روافد إذن الإشعارات ثم جرّبي مرة أخرى.",Toast.LENGTH_LONG).show(); }
        }); root.addView(test);
        root.addView(text("النص الشخصي مخفي افتراضيًا على شاشة القفل. طلب رسالة يدويًا لا يُحتسب من الحد اليومي.",13,false,Color.GRAY));
    }

    private String companionWindowLabel(int startHour,int endHour){ return startHour==endHour?"ساعات العمل: طوال اليوم":"ساعات العمل: من "+formatHour(startHour)+" إلى "+formatHour(endHour); }
    private String formatHour(int hour){ return String.format(Locale.US,"%02d:00",hour); }

    private void addMoodModule(String title,String body){
        sectionTitle(title,body);
        TextView insight=text(currentMoodInsight(),14,false,Color.DKGRAY); root.addView(insight);
        moodRecordButton("😄 رائعة",5,"سجلنا أن مزاجكِ جيد جدًا اليوم.",insight);
        moodRecordButton("🙂 جيدة",4,"سجلنا أن مزاجكِ جيد اليوم.",insight);
        moodRecordButton("😐 مستقرة",3,"سجلنا أن مزاجكِ مستقر أو محايد اليوم.",insight);
        moodRecordButton("😔 متعبة",2,"سجلنا أن مزاجكِ منخفض اليوم. راقبي ما تحتاجينه دون افتراض سبب واحد.",insight);
        moodRecordButton("😣 سيئة جدًا",1,"سجلنا أن اليوم ثقيل عليكِ. إذا كان الشعور شديدًا أو مستمرًا أو كان هناك خطر مباشر، اطلبي دعمًا مهنيًا أو طارئًا مناسبًا.",insight);
    }

    private void moodRecordButton(String label,int score,String reply,TextView insight){
        Button b=button(label,Color.WHITE); b.setTextColor(Color.DKGRAY);
        b.setOnClickListener(v->{ prefs.recordMood(score); insight.setText(currentMoodInsight()); Toast.makeText(this,reply,Toast.LENGTH_LONG).show(); });
        root.addView(b);
    }

    private String currentMoodInsight(){
        LocalDate lastPeriod=null;
        long last=prefs.getLastPeriod();
        if(last>0L) lastPeriod=Instant.ofEpochMilli(last).atZone(ZoneId.systemDefault()).toLocalDate();
        return MoodPatternEngine.insight(prefs.getMoodHistory(),lastPeriod,prefs.getCycleLength(),LocalDate.now());
    }

    private void showCalendar(){
        atHome=false;
        shell("تقويم المرأة 🌷");
        root.addView(text("بيانات الدورة محفوظة مشفرة على جهازكِ. كل التوقعات تقريبية ولا تستخدم لمنع الحمل أو التشخيص.",14,false,Color.DKGRAY));
        TextView status=text(cycleSummary(),16,true,rose); root.addView(status);
        Button start=button("تسجيل أول يوم من آخر دورة",rose);
        start.setOnClickListener(v->{
            Calendar c=Calendar.getInstance();
            DatePickerDialog d=new DatePickerDialog(this,(view,y,m,day)->{
                Calendar s=Calendar.getInstance(); s.set(y,m,day,12,0,0);
                prefs.saveCycle(s.getTimeInMillis(),prefs.getCycleLength(),prefs.getPeriodLength()); status.setText(cycleSummary());
            },c.get(Calendar.YEAR),c.get(Calendar.MONTH),c.get(Calendar.DAY_OF_MONTH));
            d.getDatePicker().setMaxDate(System.currentTimeMillis()); d.show();
        }); root.addView(start);
        addNumberSetting("متوسط طول الدورة",21,45,prefs.getCycleLength(),true,status);
        addNumberSetting("متوسط أيام الحيض",2,10,prefs.getPeriodLength(),false,status);
        addMoodModule("مزاجي والأنماط","تستخدم رفيقة روافد وتقويم المرأة سجل المزاج المحلي نفسه. لا يعزو التطبيق مزاجكِ إلى الدورة تلقائيًا؛ يبحث فقط عن أنماط متكررة في سجلاتكِ.");
    }

    private void addNumberSetting(String title,int min,int max,int current,boolean cycle,TextView status){
        TextView t=text(getString(R.string.setting_value,title,current),15,false,Color.DKGRAY); SeekBar s=new SeekBar(this); s.setMax(max-min); s.setProgress(current-min);
        s.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){
            public void onProgressChanged(SeekBar b,int p,boolean f){ int val=p+min; t.setText(getString(R.string.setting_value,title,val)); if(f){ if(cycle)prefs.saveCycle(prefs.getLastPeriod(),val,prefs.getPeriodLength()); else prefs.saveCycle(prefs.getLastPeriod(),prefs.getCycleLength(),val); status.setText(cycleSummary()); }}
            public void onStartTrackingTouch(SeekBar b){} public void onStopTrackingTouch(SeekBar b){}
        }); root.addView(t); root.addView(s);
    }

    private String cycleSummary(){
        long last=prefs.getLastPeriod();
        if(last==0L) return "ابدئي بتسجيل أول يوم من آخر دورة لعرض التقديرات.";
        LocalDate recorded=Instant.ofEpochMilli(last).atZone(ZoneId.systemDefault()).toLocalDate();
        try {
            CycleCalculator.Estimate e=CycleCalculator.estimate(recorded,prefs.getCycleLength(),LocalDate.now());
            return "آخر بداية مسجلة: "+e.recordedStart+
                    "\nالدورة التالية تقديريًا: "+e.nextPeriod+" (بعد "+e.daysUntilNext+" يوم)"+
                    "\nالإباضة التقديرية: "+e.estimatedOvulation+
                    "\nنافذة الخصوبة التقديرية: "+e.fertileWindowStart+" إلى "+e.fertileWindowEnd+
                    "\nالتقديرات للتوعية وملاحظة النمط فقط، وليست وسيلة لمنع الحمل أو قرارًا طبيًا.";
        } catch(IllegalArgumentException ex){ return "بيانات التاريخ غير صالحة. أعيدي تسجيل بداية الدورة."; }
    }

    private void showPrivacy(){
        atHome=false;
        shell("الخصوصية وبياناتي 🔐");
        sectionTitle("ما الذي يبقى على جهازك؟","روافد يستخدم تخزينًا محليًا مشفرًا بمفتاح Android Keystore للبيانات الشخصية في رفيقة روافد وتقويم المرأة، والنسخ الاحتياطي للتطبيق معطل في إصدار النشر.");
        int moodCount=prefs.getMoodHistory().size();
        int libraryCount=prefs.getLibraryItems().size();
        int symptomCount=prefs.getSymptomEntries().size();
        int emergencyCount=prefs.getEmergencyContacts().size();
        int followed=0; for(String token:prefs.getSectors().split(",")) if(!token.trim().isEmpty()) followed++;
        String summary="الاسم المخصص: "+(prefs.getName().isEmpty()?"غير محفوظ":"محفوظ محليًا")+
                "\nبيانات دورة: "+(prefs.getLastPeriod()>0?"موجودة":"غير موجودة")+
                "\nتسجيلات مزاج محلية: "+moodCount+
                "\nمواد محفوظة في مكتبتي: "+libraryCount+
                "\nتسجيلات دفتر الأعراض: "+symptomCount+
                "\nجهات طوارئ محفوظة: "+emergencyCount+
                "\nإرفاق الموقع في الطوارئ: "+(prefs.isEmergencyLocationEnabled()?"مفعّل عند الاستخدام وبإذن المستخدم":"غير مفعّل")+
                "\nمسارات متابعة محفوظة: "+followed+
                "\nرفع تلقائي لبيانات الطوارئ أو الموقع أو الأعراض أو المكتبة أو الدورة أو المزاج إلى الحساب: لا";
        root.addView(text(summary,15,false,Color.DKGRAY));

        Button policy=button("فتح سياسة الخصوصية",teal); policy.setOnClickListener(v->openWeb(BASE+"/privacy")); root.addView(policy);
        Button clearMood=button("مسح سجل المزاج فقط",Color.rgb(112,92,121));
        clearMood.setOnClickListener(v->new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("مسح سجل المزاج؟")
                .setMessage("سيُحذف سجل المزاج المحلي نهائيًا من هذا الجهاز، ولن تتأثر بقية إعدادات روافد.")
                .setNegativeButton("إلغاء",null)
                .setPositiveButton("مسح",(dialog,which)->{ prefs.clearMoodHistory(); Toast.makeText(this,"تم مسح سجل المزاج",Toast.LENGTH_SHORT).show(); showPrivacy(); })
                .show()); root.addView(clearMood);

        Button clearAll=button("حذف جميع بياناتي الشخصية المحلية",Color.rgb(153,55,65));
        clearAll.setOnClickListener(v->new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("حذف البيانات المحلية؟")
                .setMessage("سيؤدي ذلك إلى حذف الاسم، خطة الطوارئ وجهات الاتصال المحلية، بيانات تقويم المرأة، سجل المزاج، دفتر الأعراض، مكتبتي، جدول رفيقة روافد، القطاعات المتابعة وحالة التنبيهات المحلية من هذا الجهاز. لا يحذف هذا الإجراء بيانات حساب على الموقع إن كان لديك حساب.")
                .setNegativeButton("إلغاء",null)
                .setPositiveButton("حذف",(dialog,which)->{ prefs.clearSensitiveData(); prefs=new SecurePrefs(this); Toast.makeText(this,"تم حذف البيانات الشخصية المحلية",Toast.LENGTH_SHORT).show(); showPrivacy(); })
                .show()); root.addView(clearAll);
    }

    private void showSectors(){
        atHome=false;
        shell("اختياراتي والتنبيهات 🔔");
        root.addView(text("اختر أي عدد من قطاعات روافد المنشورة. تتحدث القائمة من الموقع تلقائيًا عند توفر الاتصال.",14,false,Color.DKGRAY));
        ProgressBar loading=new ProgressBar(this); loading.setIndeterminate(true); root.addView(loading,new LinearLayout.LayoutParams(-1,dp(42)));
        LinearLayout sectorContainer=new LinearLayout(this); sectorContainer.setOrientation(LinearLayout.VERTICAL); sectorContainer.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); sectorContainer.setGravity(Gravity.START); root.addView(sectorContainer);
        final List<CheckBox> boxes=new ArrayList<>(); final String selected=prefs.getSectors(); renderFollowChoices(sectorContainer,boxes,FALLBACK_SECTORS,EXTRA_FOLLOW_PATHS,selected);

        Button save=button("حفظ اختياراتي",teal);
        save.setOnClickListener(v->{
            StringBuilder s=new StringBuilder(); for(CheckBox c:boxes) if(c.isChecked()){ if(s.length()>0)s.append(','); s.append(c.getTag()); }
            prefs.setSectors(s.toString()); if(s.length()>0) requestNotificationsContextually(); Toast.makeText(this,"تم حفظ المجالات التي تتابعها.",Toast.LENGTH_SHORT).show();
        }); root.addView(save);
        Button all=button("فتح جميع قطاعات روافد",Color.rgb(70,94,112)); all.setOnClickListener(v->openWeb(BASE+"/sectors")); root.addView(all);

        networkExecutor.execute(()->{
            LinkedHashMap<String,String> live=fetchLiveSectors();
            runOnUiThread(()->{
                if(isFinishing()||isDestroyed()) return;
                loading.setVisibility(View.GONE);
                if(!live.isEmpty()) renderFollowChoices(sectorContainer,boxes,live,EXTRA_FOLLOW_PATHS,selected);
            });
        });
    }

    private void renderFollowChoices(LinearLayout container,List<CheckBox> boxes,LinkedHashMap<String,String> sectors,LinkedHashMap<String,String> extras,String selected){
        container.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); container.setGravity(Gravity.START);
        container.removeAllViews(); boxes.clear(); container.addView(text("القطاعات المنشورة",17,true,teal));
        for(Map.Entry<String,String> e:sectors.entrySet()) addFollowBox(container,boxes,e.getKey(),e.getValue(),selected);
        TextView extraTitle=text("مسارات إضافية",17,true,teal); extraTitle.setPadding(0,dp(12),0,0); container.addView(extraTitle);
        for(Map.Entry<String,String> e:extras.entrySet()) addFollowBox(container,boxes,e.getKey(),e.getValue(),selected);
    }

    private void addFollowBox(LinearLayout container,List<CheckBox> boxes,String label,String path,String selected){
        CheckBox c=new CheckBox(this); c.setText(label); c.setTextSize(16); applyRtl(c); c.setTag(path); c.setChecked(containsToken(selected,path)); boxes.add(c); container.addView(c);
    }

    private LinkedHashMap<String,String> fetchLiveSectors(){
        LinkedHashMap<String,String> result=new LinkedHashMap<>(); HttpURLConnection con=null;
        try {
            con=(HttpURLConnection)new URL(SECTOR_CATALOG).openConnection(); con.setConnectTimeout(8000); con.setReadTimeout(10000); con.setRequestProperty("Accept","application/json");
            if(con.getResponseCode()<200||con.getResponseCode()>=300) return result;
            StringBuilder b=new StringBuilder(); try(BufferedReader r=new BufferedReader(new InputStreamReader(con.getInputStream(),StandardCharsets.UTF_8))){ String line; while((line=r.readLine())!=null)b.append(line); }
            JSONArray a=new JSONObject(b.toString()).optJSONArray("sectors"); if(a==null)return result;
            for(int i=0;i<a.length();i++){ JSONObject o=a.optJSONObject(i); if(o==null)continue; String name=o.optString("name","").trim(),path=o.optString("path","").trim(); if(!name.isEmpty()&&path.startsWith("/"))result.put(name,path); }
        } catch(Exception ignored){} finally { if(con!=null)con.disconnect(); }
        return result;
    }

    private boolean containsToken(String selected,String token){ for(String value:selected.split(",")) if(token.equals(value.trim())) return true; return false; }

    private void openWeb(String url){
        if(!TrustedUrl.isRawafidHttps(url)){
            openExternal(Uri.parse(url));
            return;
        }
        Intent reader=new Intent(this,WebContentActivity.class);
        reader.putExtra(WebContentActivity.EXTRA_URL,url);
        startActivity(reader);
    }

    private void showNetworkError(String retryUrl){
        atHome=false;
        shell("تعذر تحميل المحتوى");
        root.addView(text("لم نتمكن من تحميل هذه الصفحة الآن. تحقّق من الاتصال ثم أعد المحاولة. أدوات رفيقة روافد وتقويم المرأة المحلية تظل متاحة من الرئيسية.",15,false,Color.DKGRAY));
        Button retry=button("إعادة المحاولة",teal); retry.setOnClickListener(v->openWeb(retryUrl)); root.addView(retry);
        Button home=button("العودة إلى الرئيسية",Color.rgb(70,94,112)); home.setOnClickListener(v->showHome()); root.addView(home);
    }

    private void openExternal(Uri uri){
        if(uri==null) return;
        String scheme=uri.getScheme(); if(scheme==null) return;
        String normalized=scheme.toLowerCase(Locale.ROOT);
        if(!Arrays.asList("https","http","mailto","tel").contains(normalized)) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); } catch(ActivityNotFoundException ignored){}
    }

    private void handleIntent(Intent i){ Uri data=i==null?null:i.getData(); if(TrustedUrl.isRawafidHttps(data)) openWeb(data.toString()); }

    private boolean hasNotificationPermission(){ return Build.VERSION.SDK_INT<33 || ContextCompat.checkSelfPermission(this,Manifest.permission.POST_NOTIFICATIONS)==PackageManager.PERMISSION_GRANTED; }
    private void requestNotificationsContextually(){ if(!hasNotificationPermission()&&Build.VERSION.SDK_INT>=33) ActivityCompat.requestPermissions(this,new String[]{Manifest.permission.POST_NOTIFICATIONS},NOTIFICATION_REQUEST_CODE); }

    private void card(String title,String body,int accent,View.OnClickListener click){
        MaterialCardView c=new MaterialCardView(this); c.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); c.setRadius(dp(20)); c.setCardBackgroundColor(Color.WHITE); c.setStrokeColor(Color.argb(42,Color.red(accent),Color.green(accent),Color.blue(accent))); c.setStrokeWidth(dp(1)); c.setCardElevation(dp(1));
        LinearLayout box=new LinearLayout(this); box.setPadding(dp(18),dp(15),dp(18),dp(15)); box.setOrientation(LinearLayout.VERTICAL); box.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); box.setGravity(Gravity.START); box.addView(text(title,18,true,accent)); box.addView(text(body,14,false,Color.DKGRAY)); c.addView(box); c.setOnClickListener(click);
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2); p.setMargins(0,0,0,dp(10)); root.addView(c,p);
    }

    private void applyRtl(TextView t){
        t.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        t.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL);
        t.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START);
        t.setGravity(Gravity.START|Gravity.CENTER_VERTICAL);
    }

    private TextView text(String value,int sp,boolean bold,int color){
        TextView t=new TextView(this); t.setText(value); t.setTextSize(sp); t.setTextColor(color); applyRtl(t); if(bold)t.setTypeface(t.getTypeface(),Typeface.BOLD); t.setLineSpacing(0,1.15f); t.setPadding(0,dp(5),0,dp(5)); return t;
    }

    private Button button(String value,int color){
        Button b=new Button(this); b.setText(value); b.setTextSize(16); b.setAllCaps(false); b.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); b.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); if(color!=Color.WHITE){ b.setBackgroundColor(color); b.setTextColor(Color.WHITE); }
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(56)); p.setMargins(0,dp(6),0,dp(6)); b.setLayoutParams(p); return b;
    }

    private int dp(int value){ return (int)(value*getResources().getDisplayMetrics().density); }
}
