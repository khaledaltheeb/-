package org.healthrenewal.rawafid;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.card.MaterialCardView;
import java.text.DateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

public final class SymptomJournalActivity extends AppCompatActivity {
    private SecurePrefs prefs;
    private LinearLayout root;
    private final int teal=Color.rgb(11,107,103), bg=Color.rgb(248,251,250), red=Color.rgb(153,55,65);

    @Override protected void onCreate(@Nullable Bundle state){
        super.onCreate(state);
        prefs=new SecurePrefs(this);
        render();
    }

    private void render(){
        ScrollView scroll=new ScrollView(this);
        scroll.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root=new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root.setGravity(Gravity.START);
        root.setPadding(dp(18),dp(18),dp(18),dp(32));
        root.setBackgroundColor(bg);
        scroll.addView(root);

        root.addView(text("دفتر الأعراض",28,true,teal));
        root.addView(text("سجل وصفي لما تشعر به أو تلاحظه. البيانات تبقى مشفرة على جهازك، ولا يحاول روافد تشخيص السبب أو تغيير علاجك.",14,false,Color.DKGRAY));

        Button add=button("+ تسجيل عرض أو ملاحظة",teal);
        add.setOnClickListener(v->showAddDialog());
        root.addView(add);

        List<SymptomJournal.Entry> entries=prefs.getSymptomEntries();
        if(entries.isEmpty()){
            TextView empty=text("لا توجد تسجيلات بعد.",16,false,Color.DKGRAY);
            empty.setPadding(0,dp(24),0,dp(24));
            root.addView(empty);
        } else {
            root.addView(text(entries.size()+" تسجيل",14,true,Color.DKGRAY));
            for(SymptomJournal.Entry entry:entries) addEntryCard(entry);

            Button share=button("مشاركة ملخص وصفي للمختص",Color.rgb(68,93,117));
            share.setOnClickListener(v->shareSummary());
            root.addView(share);
            Button clear=button("مسح دفتر الأعراض",red);
            clear.setOnClickListener(v->new AlertDialog.Builder(this)
                    .setTitle("مسح جميع التسجيلات؟")
                    .setMessage("سيتم حذف دفتر الأعراض المحلي من هذا الجهاز نهائيًا.")
                    .setNegativeButton("إلغاء",null)
                    .setPositiveButton("مسح",(d,w)->{ prefs.clearSymptomJournal(); render(); })
                    .show());
            root.addView(clear);
        }
        setContentView(scroll);
    }

    private void showAddDialog(){
        LinearLayout box=new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        box.setPadding(dp(22),0,dp(22),0);

        EditText symptom=input("العرض أو الملاحظة، مثل: صداع، دوخة، ألم، قلق...");
        EditText context=input("ما الذي كان يحدث في ذلك الوقت؟ (اختياري)");
        EditText helped=input("ما الذي ساعد أو لم يساعد؟ (اختياري)");
        EditText note=input("ملاحظات إضافية (اختياري)");
        note.setMinLines(2);
        final int[] intensity={5};
        TextView intensityLabel=text("الشدة التي تسجلها: 5/10",15,true,Color.DKGRAY);
        SeekBar seek=new SeekBar(this); seek.setMax(10); seek.setProgress(5);
        seek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){
            public void onProgressChanged(SeekBar b,int p,boolean f){ intensity[0]=p; intensityLabel.setText("الشدة التي تسجلها: "+p+"/10"); }
            public void onStartTrackingTouch(SeekBar b){} public void onStopTrackingTouch(SeekBar b){}
        });
        box.addView(symptom); box.addView(intensityLabel); box.addView(seek); box.addView(context); box.addView(helped); box.addView(note);

        AlertDialog dialog=new AlertDialog.Builder(this)
                .setTitle("تسجيل جديد")
                .setView(box)
                .setNegativeButton("إلغاء",null)
                .setPositiveButton("حفظ",null)
                .create();
        dialog.setOnShowListener(x->dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v->{
            String label=symptom.getText().toString().trim();
            if(label.isEmpty()){
                symptom.setError("اكتب العرض أو الملاحظة");
                return;
            }
            String id="evt_"+UUID.randomUUID().toString().replace("-","");
            SymptomJournal.Entry entry=new SymptomJournal.Entry(id,System.currentTimeMillis(),label,intensity[0],context.getText().toString(),helped.getText().toString(),note.getText().toString());
            prefs.saveSymptomEntry(entry);
            dialog.dismiss();
            render();
        }));
        dialog.show();
    }

    private void addEntryCard(SymptomJournal.Entry entry){
        MaterialCardView card=new MaterialCardView(this);
        card.setRadius(dp(18));
        card.setCardBackgroundColor(Color.WHITE);
        card.setStrokeWidth(dp(1));
        card.setStrokeColor(Color.argb(35,11,107,103));
        LinearLayout box=new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        box.setPadding(dp(16),dp(12),dp(16),dp(12));
        box.addView(text(entry.symptom,18,true,teal));
        String when=DateFormat.getDateTimeInstance(DateFormat.MEDIUM,DateFormat.SHORT,new Locale("ar")).format(new Date(entry.occurredAt));
        box.addView(text(when+" — الشدة المسجلة "+entry.intensity+"/10",13,false,Color.GRAY));
        if(!entry.context.isEmpty()) box.addView(text("السياق: "+entry.context,14,false,Color.DKGRAY));
        if(!entry.whatHelped.isEmpty()) box.addView(text("ما ساعد: "+entry.whatHelped,14,false,Color.DKGRAY));
        if(!entry.note.isEmpty()) box.addView(text("ملاحظة: "+entry.note,14,false,Color.DKGRAY));
        Button remove=button("حذف هذا التسجيل",Color.rgb(112,92,96));
        remove.setOnClickListener(v->new AlertDialog.Builder(this).setTitle("حذف التسجيل؟").setNegativeButton("إلغاء",null).setPositiveButton("حذف",(d,w)->{ prefs.removeSymptomEntry(entry.id); render(); }).show());
        box.addView(remove);
        card.addView(box);
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2); p.setMargins(0,dp(6),0,dp(6)); root.addView(card,p);
    }

    private void shareSummary(){
        String summary=SymptomJournal.summary(prefs.getSymptomEntries(),30);
        Intent i=new Intent(Intent.ACTION_SEND);
        i.setType("text/plain");
        i.putExtra(Intent.EXTRA_SUBJECT,"ملخص دفتر الأعراض من روافد");
        i.putExtra(Intent.EXTRA_TEXT,summary);
        startActivity(Intent.createChooser(i,"مشاركة الملخص"));
    }

    private EditText input(String hint){
        EditText e=new EditText(this); e.setHint(hint); e.setTextSize(15); e.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_MULTI_LINE);
        e.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); e.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); e.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START); e.setGravity(Gravity.START|Gravity.CENTER_VERTICAL);
        return e;
    }

    private TextView text(String value,int sp,boolean bold,int color){
        TextView t=new TextView(this); t.setText(value); t.setTextSize(sp); t.setTextColor(color); t.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); t.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); t.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START); t.setGravity(Gravity.START|Gravity.CENTER_VERTICAL); if(bold)t.setTypeface(t.getTypeface(),Typeface.BOLD); t.setLineSpacing(0,1.12f); t.setPadding(0,dp(4),0,dp(4)); return t;
    }

    private Button button(String value,int color){
        Button b=new Button(this); b.setText(value); b.setTextSize(15); b.setAllCaps(false); b.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); b.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); b.setBackgroundColor(color); b.setTextColor(Color.WHITE); LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(54)); p.setMargins(0,dp(5),0,dp(5)); b.setLayoutParams(p); return b;
    }

    private int dp(int value){ return (int)(value*getResources().getDisplayMetrics().density); }
}
