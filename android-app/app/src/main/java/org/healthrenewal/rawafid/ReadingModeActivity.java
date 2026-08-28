package org.healthrenewal.rawafid;

import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.Switch;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

public final class ReadingModeActivity extends AppCompatActivity {
    private final int teal=Color.rgb(11,107,103), bg=Color.rgb(248,251,250);

    @Override protected void onCreate(@Nullable Bundle state){
        super.onCreate(state);
        render();
    }

    private void render(){
        ReadingMode.Settings current=ReadingModeStore.load(this);
        final int[] textScale={current.textScale};
        final int[] lineHeight={current.lineHeight};

        ScrollView scroll=new ScrollView(this);
        scroll.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        LinearLayout root=new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root.setGravity(Gravity.START);
        root.setPadding(dp(18),dp(18),dp(18),dp(32));
        root.setBackgroundColor(bg);
        scroll.addView(root);

        root.addView(text("وضع القراءة",28,true,teal));
        root.addView(text("هذه الإعدادات تغيّر طريقة عرض صفحات روافد داخل التطبيق فقط، ولا تعدّل الموقع المنشور أو محتواه.",14,false,Color.DKGRAY));

        TextView textLabel=text("حجم النص: "+textScale[0]+"%",16,true,Color.DKGRAY); root.addView(textLabel);
        SeekBar textSeek=new SeekBar(this); textSeek.setMax(ReadingMode.MAX_TEXT_SCALE-ReadingMode.MIN_TEXT_SCALE); textSeek.setProgress(textScale[0]-ReadingMode.MIN_TEXT_SCALE);
        textSeek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){
            public void onProgressChanged(SeekBar b,int p,boolean f){ textScale[0]=ReadingMode.MIN_TEXT_SCALE+p; textLabel.setText("حجم النص: "+textScale[0]+"%"); }
            public void onStartTrackingTouch(SeekBar b){} public void onStopTrackingTouch(SeekBar b){}
        }); root.addView(textSeek);

        TextView lineLabel=text("تباعد الأسطر: "+lineHeight[0]+"%",16,true,Color.DKGRAY); root.addView(lineLabel);
        SeekBar lineSeek=new SeekBar(this); lineSeek.setMax(ReadingMode.MAX_LINE_HEIGHT-ReadingMode.MIN_LINE_HEIGHT); lineSeek.setProgress(lineHeight[0]-ReadingMode.MIN_LINE_HEIGHT);
        lineSeek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){
            public void onProgressChanged(SeekBar b,int p,boolean f){ lineHeight[0]=ReadingMode.MIN_LINE_HEIGHT+p; lineLabel.setText("تباعد الأسطر: "+lineHeight[0]+"%"); }
            public void onStartTrackingTouch(SeekBar b){} public void onStopTrackingTouch(SeekBar b){}
        }); root.addView(lineSeek);

        Switch contrast=new Switch(this); contrast.setText("تباين مرتفع"); contrast.setChecked(current.highContrast); applyRtl(contrast); root.addView(contrast);
        Switch night=new Switch(this); night.setText("قراءة ليلية داخل صفحات روافد"); night.setChecked(current.night); applyRtl(night); root.addView(night);

        TextView preview=text("نص تجريبي للقراءة العربية. يمكنك ضبط الحجم والتباعد بما يناسبك ثم العودة إلى الصفحة المفتوحة.",17,false,Color.DKGRAY);
        preview.setPadding(dp(12),dp(18),dp(12),dp(18)); root.addView(preview);

        Button save=button("حفظ وتطبيق",teal);
        save.setOnClickListener(v->{
            ReadingModeStore.save(this,new ReadingMode.Settings(textScale[0],lineHeight[0],contrast.isChecked(),night.isChecked()));
            finish();
        }); root.addView(save);
        Button reset=button("استعادة الإعدادات الافتراضية",Color.rgb(82,98,104));
        reset.setOnClickListener(v->{ ReadingModeStore.reset(this); render(); }); root.addView(reset);
        setContentView(scroll);
    }

    private void applyRtl(TextView t){ t.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); t.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); t.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START); t.setGravity(Gravity.START|Gravity.CENTER_VERTICAL); }
    private TextView text(String value,int sp,boolean bold,int color){ TextView t=new TextView(this); t.setText(value); t.setTextSize(sp); t.setTextColor(color); applyRtl(t); if(bold)t.setTypeface(t.getTypeface(),Typeface.BOLD); t.setLineSpacing(0,1.15f); t.setPadding(0,dp(5),0,dp(5)); return t; }
    private Button button(String value,int color){ Button b=new Button(this); b.setText(value); b.setTextSize(15); b.setAllCaps(false); b.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); b.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); b.setBackgroundColor(color); b.setTextColor(Color.WHITE); LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(54)); p.setMargins(0,dp(5),0,dp(5)); b.setLayoutParams(p); return b; }
    private int dp(int value){ return (int)(value*getResources().getDisplayMetrics().density); }
}
