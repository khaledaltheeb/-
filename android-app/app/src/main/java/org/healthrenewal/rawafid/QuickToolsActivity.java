package org.healthrenewal.rawafid;

import android.app.DatePickerDialog;
import android.graphics.Color;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.card.MaterialCardView;
import java.time.LocalDate;
import java.time.Period;
import java.util.Locale;

/** Small native utilities that remain useful even when the website is unavailable. */
public final class QuickToolsActivity extends AppCompatActivity {
    private final int teal=Color.rgb(11,107,103),ink=Color.rgb(22,33,30),muted=Color.rgb(74,90,85),bg=Color.rgb(246,249,248),rose=Color.rgb(154,55,66);
    private LinearLayout root;
    private CountDownTimer breathingTimer;

    @Override protected void onCreate(@Nullable Bundle state){ super.onCreate(state); render(); }
    @Override protected void onDestroy(){ if(breathingTimer!=null) breathingTimer.cancel(); super.onDestroy(); }

    private void render(){
        ScrollView scroll=new ScrollView(this); scroll.setFillViewport(true); scroll.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); scroll.setBackgroundColor(bg);
        root=new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); root.setGravity(Gravity.START); root.setPadding(dp(18),dp(18),dp(18),dp(34)); scroll.addView(root);
        root.addView(text("أدواتي السريعة",28,true,ink));
        root.addView(text("أدوات محلية سريعة بلا تسجيل دخول. النتائج الحسابية للتوعية ولا تستبدل التقييم الطبي.",14,false,muted));

        addBmiTool();
        addAgeTool();
        addUnitConverter();
        addBreathingTool();
        addEmergencyCardLauncher();
        setContentView(scroll);
    }

    private void addBmiTool(){
        LinearLayout box=toolCard("حاسبة مؤشر كتلة الجسم BMI","للبالغين: أدخل الوزن والطول لحساب المؤشر فقط؛ لا يفسر تركيب الجسم أو الحمل أو احتياجات الأطفال.");
        EditText weight=number("الوزن بالكيلوغرام"); EditText height=number("الطول بالسنتيمتر"); box.addView(weight); box.addView(height);
        TextView result=text("",16,true,ink); box.addView(result);
        Button calc=button("احسب BMI",teal); calc.setOnClickListener(v->{
            double w=parse(weight),h=parse(height)/100d;
            if(w<=0||h<0.8||h>2.5){ result.setText("تحقق من الوزن والطول المدخلين."); return; }
            double bmi=w/(h*h);
            String band=bmi<18.5?"أقل من المجال المرجعي المعتاد":bmi<25?"ضمن المجال المرجعي المعتاد":bmi<30?"أعلى من المجال المرجعي المعتاد":"مرتفع";
            result.setText(String.format(Locale.US,"BMI = %.1f — %s",bmi,band));
        }); box.addView(calc);
    }

    private void addAgeTool(){
        LinearLayout box=toolCard("حاسبة العمر الدقيقة","احسب العمر بالسنوات والأشهر والأيام من تاريخ الميلاد.");
        TextView chosen=text("لم يتم اختيار تاريخ الميلاد",15,false,muted); box.addView(chosen);
        TextView result=text("",16,true,ink); box.addView(result);
        Button pick=button("اختر تاريخ الميلاد",teal); pick.setOnClickListener(v->{
            LocalDate now=LocalDate.now();
            DatePickerDialog dialog=new DatePickerDialog(this,(view,y,m,d)->{
                LocalDate birth=LocalDate.of(y,m+1,d);
                if(birth.isAfter(LocalDate.now())){ result.setText("تاريخ الميلاد لا يمكن أن يكون في المستقبل."); return; }
                Period age=Period.between(birth,LocalDate.now());
                chosen.setText("تاريخ الميلاد: "+birth);
                result.setText("العمر: "+age.getYears()+" سنة، "+age.getMonths()+" شهر، "+age.getDays()+" يوم");
            },now.getYear()-25,now.getMonthValue()-1,now.getDayOfMonth());
            dialog.getDatePicker().setMaxDate(System.currentTimeMillis()); dialog.show();
        }); box.addView(pick);
    }

    private void addUnitConverter(){
        LinearLayout box=toolCard("محول الوحدات الصحية","تحويل سريع للوزن والطول ودرجة الحرارة دون اتصال بالإنترنت.");
        Spinner mode=new Spinner(this); String[] modes={"كيلوغرام ⇄ رطل","سنتيمتر ⇄ إنش","مئوية ⇄ فهرنهايت"}; mode.setAdapter(new ArrayAdapter<>(this,android.R.layout.simple_spinner_dropdown_item,modes)); box.addView(mode,new LinearLayout.LayoutParams(-1,dp(56)));
        EditText value=number("أدخل القيمة"); box.addView(value);
        TextView result=text("",16,true,ink); box.addView(result);
        Button convert=button("تحويل بالاتجاهين",teal); convert.setOnClickListener(v->{
            double x=parse(value); if(Double.isNaN(x)){ result.setText("أدخل رقمًا صالحًا."); return; }
            int p=mode.getSelectedItemPosition();
            if(p==0) result.setText(String.format(Locale.US,"%.2f كغ = %.2f رطل\n%.2f رطل = %.2f كغ",x,x*2.2046226218,x,x/2.2046226218));
            else if(p==1) result.setText(String.format(Locale.US,"%.2f سم = %.2f إنش\n%.2f إنش = %.2f سم",x,x/2.54,x,x*2.54));
            else result.setText(String.format(Locale.US,"%.2f °C = %.2f °F\n%.2f °F = %.2f °C",x,(x*9d/5d)+32d,x,(x-32d)*5d/9d));
        }); box.addView(convert);
    }

    private void addBreathingTool(){
        LinearLayout box=toolCard("مؤقت تهدئة وتنفس","دقيقة موجهة: شهيق 4 ثوانٍ ثم زفير 6 ثوانٍ. أوقفها إذا سببت دوارًا أو عدم ارتياح.");
        TextView state=text("جاهز",24,true,teal); state.setGravity(Gravity.CENTER); state.setTextAlignment(View.TEXT_ALIGNMENT_CENTER); box.addView(state,new LinearLayout.LayoutParams(-1,dp(64)));
        Button start=button("ابدأ دقيقة",teal); box.addView(start);
        Button stop=button("إيقاف",Color.rgb(89,99,95)); box.addView(stop);
        start.setOnClickListener(v->{
            if(breathingTimer!=null) breathingTimer.cancel();
            breathingTimer=new CountDownTimer(60000,1000){
                public void onTick(long left){ long elapsed=60000-left; long phase=elapsed%10000; state.setText((phase<4000?"شهيق":"زفير")+"  •  "+((left+999)/1000)+"ث"); }
                public void onFinish(){ state.setText("انتهت الدقيقة"); }
            }.start();
        });
        stop.setOnClickListener(v->{ if(breathingTimer!=null) breathingTimer.cancel(); state.setText("متوقف"); });
    }

    private void addEmergencyCardLauncher(){
        LinearLayout box=toolCard("بطاقة الطوارئ","اعرض بطاقة الحالة وجهات الاتصال التي أعددتها في مركز SOS، بما في ذلك فوق شاشة القفل عند التفعيل السريع.");
        Button open=button("عرض بطاقتي الآن",rose); open.setOnClickListener(v->EmergencyActionDispatcher.showCard(this,"tools")); box.addView(open);
        Button setup=button("إعداد SOS والاختصار",teal); setup.setOnClickListener(v->startActivity(new android.content.Intent(this,EmergencyShortcutActivity.class))); box.addView(setup);
    }

    private LinearLayout toolCard(String title,String body){
        MaterialCardView card=new MaterialCardView(this); card.setRadius(dp(22)); card.setCardBackgroundColor(Color.WHITE); card.setStrokeColor(Color.rgb(214,226,222)); card.setStrokeWidth(dp(1)); card.setCardElevation(dp(1));
        LinearLayout box=new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); box.setPadding(dp(18),dp(14),dp(18),dp(16)); box.addView(text(title,19,true,teal)); box.addView(text(body,13,false,muted)); card.addView(box);
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2); p.setMargins(0,dp(8),0,dp(6)); root.addView(card,p); return box;
    }

    private EditText number(String hint){ EditText e=new EditText(this); e.setHint(hint); e.setInputType(InputType.TYPE_CLASS_NUMBER|InputType.TYPE_NUMBER_FLAG_DECIMAL|InputType.TYPE_NUMBER_FLAG_SIGNED); e.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); e.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); e.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START); return e; }
    private double parse(EditText e){ try { String s=e.getText().toString().trim().replace(',','.'); return s.isEmpty()?Double.NaN:Double.parseDouble(s); } catch(Exception ignored){ return Double.NaN; } }
    private TextView text(String value,int sp,boolean bold,int color){ TextView t=new TextView(this); t.setText(value); t.setTextSize(sp); t.setTextColor(color); t.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); t.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); t.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START); t.setGravity(Gravity.START|Gravity.CENTER_VERTICAL); t.setLineSpacing(0,1.16f); if(bold)t.setTypeface(t.getTypeface(),android.graphics.Typeface.BOLD); t.setPadding(0,dp(5),0,dp(5)); return t; }
    private Button button(String label,int color){ Button b=new Button(this); b.setText(label); b.setTextSize(16); b.setAllCaps(false); b.setTextColor(Color.WHITE); b.setBackgroundColor(color); b.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(56)); p.setMargins(0,dp(5),0,dp(5)); b.setLayoutParams(p); return b; }
    private int dp(int v){ return (int)(v*getResources().getDisplayMetrics().density); }
}