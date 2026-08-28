package org.healthrenewal.rawafid;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.card.MaterialCardView;
import java.util.List;

public final class LibraryActivity extends AppCompatActivity {
    private static final String BASE="https://healthrenewal.org";
    private SecurePrefs prefs;
    private LinearLayout root;
    private final int teal=Color.rgb(11,107,103), bg=Color.rgb(248,251,250);

    @Override protected void onCreate(@Nullable Bundle state){
        super.onCreate(state);
        prefs=new SecurePrefs(this);
        render();
    }

    @Override protected void onResume(){
        super.onResume();
        if(root!=null) render();
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

        root.addView(text("مكتبتي",28,true,teal));
        root.addView(text("المواد التي تحفظها من روافد تبقى على جهازك مشفرة. يمكن فتحها أو إزالتها في أي وقت.",14,false,Color.DKGRAY));

        List<LocalLibrary.Item> items=prefs.getLibraryItems();
        if(items.isEmpty()){
            TextView empty=text("لا توجد مواد محفوظة بعد. افتح أي صفحة في روافد واضغط «حفظ» من شريط القراءة.",16,false,Color.DKGRAY);
            empty.setPadding(0,dp(28),0,dp(28));
            root.addView(empty);
        } else {
            root.addView(text(items.size()+" مادة محفوظة",14,true,Color.DKGRAY));
            for(LocalLibrary.Item item:items) addItem(item);
        }

        if(!items.isEmpty()){
            Button clear=button("مسح مكتبتي",Color.rgb(140,62,68));
            clear.setOnClickListener(v->new AlertDialog.Builder(this)
                    .setTitle("مسح جميع المواد المحفوظة؟")
                    .setMessage("سيتم حذف قائمة مكتبتك المحلية من هذا الجهاز فقط.")
                    .setNegativeButton("إلغاء",null)
                    .setPositiveButton("مسح",(d,w)->{ prefs.clearLibrary(); render(); })
                    .show());
            root.addView(clear);
        }
        setContentView(scroll);
    }

    private void addItem(LocalLibrary.Item item){
        MaterialCardView card=new MaterialCardView(this);
        card.setRadius(dp(18));
        card.setCardBackgroundColor(Color.WHITE);
        card.setStrokeColor(Color.argb(35,11,107,103));
        card.setStrokeWidth(dp(1));
        LinearLayout box=new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        box.setPadding(dp(16),dp(13),dp(16),dp(13));
        box.addView(text(item.title,17,true,teal));
        box.addView(text(item.readLater?"اقرأ لاحقًا":"محفوظ",13,false,Color.GRAY));
        LinearLayout actions=new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        Button open=button("فتح",teal);
        Button remove=button("إزالة",Color.rgb(112,92,96));
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,dp(50),1f);
        p.setMargins(dp(3),dp(4),dp(3),0);
        open.setLayoutParams(new LinearLayout.LayoutParams(p));
        remove.setLayoutParams(new LinearLayout.LayoutParams(p));
        open.setOnClickListener(v->{
            prefs.markLibraryOpened(item.path);
            Intent i=new Intent(Intent.ACTION_VIEW,Uri.parse(BASE+item.path));
            i.setPackage(getPackageName());
            startActivity(i);
        });
        remove.setOnClickListener(v->{ prefs.removeFromLibrary(item.path); render(); });
        actions.addView(open); actions.addView(remove);
        box.addView(actions);
        card.addView(box);
        LinearLayout.LayoutParams cardParams=new LinearLayout.LayoutParams(-1,-2);
        cardParams.setMargins(0,dp(6),0,dp(6));
        root.addView(card,cardParams);
    }

    private TextView text(String value,int sp,boolean bold,int color){
        TextView t=new TextView(this);
        t.setText(value); t.setTextSize(sp); t.setTextColor(color);
        t.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        t.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL);
        t.setTextAlignment(View.TEXT_ALIGNMENT_VIEW_START);
        t.setGravity(Gravity.START|Gravity.CENTER_VERTICAL);
        if(bold)t.setTypeface(t.getTypeface(),Typeface.BOLD);
        t.setLineSpacing(0,1.12f); t.setPadding(0,dp(4),0,dp(4));
        return t;
    }

    private Button button(String value,int color){
        Button b=new Button(this); b.setText(value); b.setTextSize(15); b.setAllCaps(false);
        b.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); b.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL);
        b.setBackgroundColor(color); b.setTextColor(Color.WHITE);
        return b;
    }

    private int dp(int value){ return (int)(value*getResources().getDisplayMetrics().density); }
}
