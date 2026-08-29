package org.healthrenewal.rawafid;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import com.google.android.material.card.MaterialCardView;
import java.util.List;

/** High-visibility emergency card that can appear over the lock screen after an SOS shortcut. */
public final class EmergencyCardActivity extends AppCompatActivity {
    public static final String EXTRA_SOURCE="source";
    private SecurePrefs prefs;
    private final int danger=Color.rgb(154,55,66),teal=Color.rgb(11,107,103),bg=Color.rgb(246,249,248);

    @Override protected void onCreate(@Nullable Bundle state){
        super.onCreate(state);
        if(Build.VERSION.SDK_INT>=27){ setShowWhenLocked(true); setTurnScreenOn(true); }
        else getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED|WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        prefs=new SecurePrefs(this);
        render();
    }

    private void render(){
        ScrollView scroll=new ScrollView(this); scroll.setFillViewport(true); scroll.setBackgroundColor(bg); scroll.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        LinearLayout root=new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setGravity(Gravity.CENTER_HORIZONTAL); root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); root.setPadding(dp(18),dp(22),dp(18),dp(36)); scroll.addView(root);

        TextView badge=text("SOS • بطاقة طوارئ",15,true,Color.WHITE); badge.setGravity(Gravity.CENTER); badge.setBackgroundColor(danger); badge.setPadding(dp(16),dp(8),dp(16),dp(8)); root.addView(badge,new LinearLayout.LayoutParams(-1,-2));

        String condition=prefs.getEmergencyCondition().trim();
        if(condition.isEmpty()) condition="حالة طارئة — يرجى المساعدة";
        TextView title=text(condition,28,true,danger); title.setGravity(Gravity.CENTER); title.setTextAlignment(View.TEXT_ALIGNMENT_CENTER); title.setPadding(0,dp(18),0,dp(8)); root.addView(title);

        String note=prefs.getEmergencyCardNote().trim();
        if(note.isEmpty()) note=prefs.getEmergencyMessage();
        MaterialCardView infoCard=new MaterialCardView(this); infoCard.setRadius(dp(20)); infoCard.setCardBackgroundColor(Color.WHITE); infoCard.setStrokeColor(Color.argb(60,154,55,66)); infoCard.setStrokeWidth(dp(1)); infoCard.setCardElevation(dp(2));
        LinearLayout info=new LinearLayout(this); info.setOrientation(LinearLayout.VERTICAL); info.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); info.setPadding(dp(18),dp(16),dp(18),dp(16)); info.addView(text(note,18,true,Color.rgb(35,42,40))); infoCard.addView(info);
        LinearLayout.LayoutParams cardParams=new LinearLayout.LayoutParams(-1,-2); cardParams.setMargins(0,dp(6),0,dp(14)); root.addView(infoCard,cardParams);

        List<EmergencyPlan.Contact> contacts=prefs.getEmergencyContacts();
        if(!contacts.isEmpty()){
            root.addView(text("اتصالات الطوارئ",18,true,teal));
            for(int i=0;i<contacts.size();i++){
                EmergencyPlan.Contact c=contacts.get(i);
                if(c.phone.isEmpty()) continue;
                String label=(c.name.isEmpty()?"جهة طوارئ":c.name)+"  •  "+c.phone;
                Button call=button("اتصال: "+label,danger);
                final String phone=c.phone;
                call.setOnClickListener(v->call(phone));
                root.addView(call);
                if(i>=3) break;
            }
        }

        Button center=button("فتح مركز الطوارئ الكامل",teal);
        center.setOnClickListener(v->startActivity(new Intent(this,EmergencyActivity.class)));
        root.addView(center);
        Button close=button("إغلاق البطاقة",Color.rgb(89,99,95));
        close.setOnClickListener(v->{ EmergencyNotifier.cancel(this); finish(); });
        root.addView(close);

        root.addView(text("هذه البطاقة تعرض ما أدخله المستخدم محليًا. لا تمثل تشخيصًا طبيًا ولا تتصل بخدمات الطوارئ الحكومية تلقائيًا.",12,false,Color.GRAY));
        setContentView(scroll);
    }

    private void call(String phone){
        Intent i;
        if(ContextCompat.checkSelfPermission(this,Manifest.permission.CALL_PHONE)==PackageManager.PERMISSION_GRANTED) i=new Intent(Intent.ACTION_CALL,Uri.parse("tel:"+Uri.encode(phone)));
        else i=new Intent(Intent.ACTION_DIAL,Uri.parse("tel:"+Uri.encode(phone)));
        try { startActivity(i); } catch(Exception ignored){}
    }

    private TextView text(String value,int sp,boolean bold,int color){ TextView t=new TextView(this); t.setText(value); t.setTextSize(sp); t.setTextColor(color); t.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); t.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL); t.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START); t.setGravity(Gravity.START|Gravity.CENTER_VERTICAL); t.setLineSpacing(0,1.2f); if(bold)t.setTypeface(t.getTypeface(),android.graphics.Typeface.BOLD); t.setPadding(0,dp(6),0,dp(6)); return t; }
    private Button button(String label,int color){ Button b=new Button(this); b.setText(label); b.setTextSize(16); b.setAllCaps(false); b.setTextColor(Color.WHITE); b.setBackgroundColor(color); b.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(58)); p.setMargins(0,dp(5),0,dp(5)); b.setLayoutParams(p); return b; }
    private int dp(int v){ return (int)(v*getResources().getDisplayMetrics().density); }
}