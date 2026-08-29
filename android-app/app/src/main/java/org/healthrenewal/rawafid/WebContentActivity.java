package org.healthrenewal.rawafid;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/** First-party Rawafid reader with an app-only responsive navigation shell. */
public final class WebContentActivity extends AppCompatActivity {
    public static final String EXTRA_URL="rawafid_url";
    private static final String FIT_TAG="RawafidFit";
    private static final String TEXT_FIT_TAG="RawafidTextFit";
    private static final String NATIVE_FIT_TAG="RawafidNativeFit";
    private static final String SCALE_TAG="RawafidScale";
    private static final String WEB_TAG="RawafidWeb";
    private static final String BASE="https://healthrenewal.org";

    private final int teal=Color.rgb(11,107,103);
    private final int ink=Color.rgb(22,33,30);
    private final int surface=Color.WHITE;
    private final int appBg=Color.rgb(246,249,248);
    private final int border=Color.rgb(214,226,222);

    private SecurePrefs prefs;
    private LinearLayout root;
    private WebView webView;
    private View errorPanel;
    private Button saveButton;
    private TextView titleView;
    private String currentUrl="";
    private String currentTitle="";
    private boolean pageReady=false;

    @Override protected void onCreate(@Nullable Bundle state){
        super.onCreate(state);
        prefs=new SecurePrefs(this);
        getOnBackPressedDispatcher().addCallback(this,new OnBackPressedCallback(true){
            @Override public void handleOnBackPressed(){
                if(webView!=null&&webView.canGoBack()) webView.goBack();
                else finish();
            }
        });
        String incoming=getIntent()==null?null:getIntent().getStringExtra(EXTRA_URL);
        if(incoming==null&&getIntent()!=null&&getIntent().getData()!=null) incoming=getIntent().getData().toString();
        if(!TrustedUrl.isRawafidHttps(incoming)){ finish(); return; }
        currentUrl=incoming;
        render();
        webView.loadUrl(currentUrl);
    }

    @Override protected void onResume(){
        super.onResume();
        if(pageReady&&webView!=null){ applyReadingMode(); applyFitScript(); }
        refreshSaveButton();
    }

    @Override protected void onDestroy(){
        if(webView!=null){ webView.stopLoading(); webView.destroy(); webView=null; }
        super.onDestroy();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void render(){
        root=new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_LTR);
        root.setBackgroundColor(appBg);
        ViewCompat.setOnApplyWindowInsetsListener(root,(view,windowInsets)->{
            Insets system=windowInsets.getInsets(WindowInsetsCompat.Type.statusBars()|WindowInsetsCompat.Type.navigationBars());
            view.setPadding(system.left,system.top,system.right,system.bottom);
            return windowInsets;
        });

        root.addView(buildTopBar(),new LinearLayout.LayoutParams(-1,dp(58)));

        webView=new WebView(this);
        webView.setLayoutDirection(View.LAYOUT_DIRECTION_LTR);
        // Software rasterization prevents the observed Android WebView RTL glyph paint displacement.
        webView.setLayerType(View.LAYER_TYPE_SOFTWARE,null);
        webView.setBackgroundColor(surface);
        WebSettings s=webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setSupportMultipleWindows(false);
        s.setDomStorageEnabled(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setTextZoom(100);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setGeolocationEnabled(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setSafeBrowsingEnabled(true);
        s.setUserAgentString(s.getUserAgentString()+" RawafidAndroid/1.0");
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView,false);
        webView.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                Uri uri=request.getUrl();
                if(TrustedUrl.isRawafidHttps(uri)) return false;
                openExternal(uri); return true;
            }
            @Override public void onPageFinished(WebView view,String finishedUrl){
                super.onPageFinished(view,finishedUrl);
                if(!TrustedUrl.isRawafidHttps(finishedUrl)) return;
                currentUrl=finishedUrl;
                currentTitle=cleanTitle(view.getTitle(),Uri.parse(finishedUrl));
                pageReady=true;
                dismissErrorPanel();
                webView.setVisibility(View.VISIBLE);
                markOpenedIfSaved();
                refreshSaveButton();
                refreshTitle();
                applyReadingMode();
                applyFitScript();
                webView.postDelayed(thisActivityFit(),350L);
                webView.postDelayed(thisActivityFit(),1200L);
                webView.postDelayed(thisActivityFit(),3000L);
            }
            private Runnable thisActivityFit(){ return ()->{ if(webView!=null&&pageReady) applyFitScript(); }; }
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){ if(request.isForMainFrame()) showError(); }
            @Override public void onReceivedHttpError(WebView view,WebResourceRequest request,WebResourceResponse response){ if(request.isForMainFrame()&&response.getStatusCode()>=500) showError(); }
        });
        root.addView(webView,new LinearLayout.LayoutParams(-1,0,1f));
        root.addView(buildBottomBar(),new LinearLayout.LayoutParams(-1,dp(66)));
        setContentView(root);
        ViewCompat.requestApplyInsets(root);
    }

    private View buildTopBar(){
        LinearLayout bar=new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setPadding(dp(8),dp(5),dp(8),dp(5));
        bar.setBackgroundColor(surface);

        Button back=iconButton("رجوع");
        back.setOnClickListener(v->{ if(webView!=null&&webView.canGoBack()) webView.goBack(); else finish(); });
        bar.addView(back,new LinearLayout.LayoutParams(dp(72),-1));

        titleView=new TextView(this);
        titleView.setText("روافد");
        titleView.setTextColor(ink);
        titleView.setTextSize(16);
        titleView.setTypeface(titleView.getTypeface(),Typeface.BOLD);
        titleView.setGravity(Gravity.CENTER_VERTICAL|Gravity.START);
        titleView.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        titleView.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL);
        titleView.setSingleLine(true);
        titleView.setEllipsize(android.text.TextUtils.TruncateAt.END);
        LinearLayout.LayoutParams tp=new LinearLayout.LayoutParams(0,-1,1f); tp.setMargins(dp(8),0,dp(8),0); bar.addView(titleView,tp);

        saveButton=iconButton("حفظ");
        saveButton.setOnClickListener(v->toggleSaved());
        bar.addView(saveButton,new LinearLayout.LayoutParams(dp(72),-1));
        return bar;
    }

    private View buildBottomBar(){
        LinearLayout bar=new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        bar.setGravity(Gravity.CENTER);
        bar.setPadding(dp(5),dp(5),dp(5),dp(5));
        bar.setBackgroundColor(surface);

        addNav(bar,"الرئيسية",v->openFirstParty(BASE+"/"));
        addNav(bar,"بحث",v->openFirstParty(BASE+"/search"));
        addNav(bar,"مكتبتي",v->startActivity(new Intent(this,LibraryActivity.class)));
        addNav(bar,"القراءة",v->startActivity(new Intent(this,ReadingModeActivity.class)));
        addNav(bar,"مشاركة",v->shareCurrent());
        return bar;
    }

    private void addNav(LinearLayout bar,String label,View.OnClickListener click){
        Button b=new Button(this);
        b.setText(label); b.setTextSize(12); b.setAllCaps(false); b.setTextColor(teal);
        b.setContentDescription(label); b.setMinWidth(0); b.setMinimumWidth(0); b.setMinHeight(dp(48));
        b.setPadding(dp(3),0,dp(3),0); b.setBackgroundColor(Color.TRANSPARENT); b.setOnClickListener(click);
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,-1,1f); p.setMargins(dp(1),0,dp(1),0); bar.addView(b,p);
    }

    private Button iconButton(String label){
        Button b=new Button(this);
        b.setText(label); b.setTextSize(13); b.setAllCaps(false); b.setTextColor(teal); b.setContentDescription(label);
        b.setPadding(dp(8),0,dp(8),0); b.setMinHeight(dp(46)); b.setMinWidth(dp(48));
        GradientDrawable shape=new GradientDrawable(); shape.setColor(Color.rgb(237,244,242)); shape.setCornerRadius(dp(14)); shape.setStroke(dp(1),border); b.setBackground(shape);
        return b;
    }

    private void openFirstParty(String url){
        if(webView!=null&&TrustedUrl.isRawafidHttps(url)){ pageReady=false; webView.loadUrl(url); }
    }

    private void toggleSaved(){
        String path=currentPath();
        if(path.isEmpty()||currentTitle.isEmpty()){ Toast.makeText(this,"انتظر اكتمال تحميل الصفحة أولًا",Toast.LENGTH_SHORT).show(); return; }
        if(isSaved(path)){ prefs.removeFromLibrary(path); Toast.makeText(this,"تمت الإزالة من مكتبتي",Toast.LENGTH_SHORT).show(); }
        else { prefs.saveToLibrary(path,currentTitle,true); Toast.makeText(this,"تم الحفظ في مكتبتي",Toast.LENGTH_SHORT).show(); }
        refreshSaveButton();
    }

    private void refreshSaveButton(){
        if(saveButton==null) return;
        String path=currentPath();
        saveButton.setText(!path.isEmpty()&&isSaved(path)?"محفوظ":"حفظ");
    }

    private void refreshTitle(){ if(titleView!=null) titleView.setText(currentTitle.isEmpty()?"روافد":currentTitle); }

    private boolean isSaved(String path){ if(path==null||path.isEmpty()) return false; for(LocalLibrary.Item item:prefs.getLibraryItems()) if(path.equals(item.path)) return true; return false; }
    private void markOpenedIfSaved(){ String path=currentPath(); if(!path.isEmpty()&&isSaved(path)) prefs.markLibraryOpened(path); }

    private String currentPath(){
        if(!TrustedUrl.isRawafidHttps(currentUrl)) return "";
        Uri uri=Uri.parse(currentUrl); String path=uri.getEncodedPath(); if(path==null||path.isEmpty()) path="/";
        String query=uri.getEncodedQuery(); if(query!=null&&!query.isEmpty()) path=path+"?"+query;
        return LocalLibrary.validPath(path)?path:"";
    }

    private String cleanTitle(String title,Uri uri){
        String value=title==null?"":title.trim();
        if(value.isEmpty()&&uri!=null){ String last=uri.getLastPathSegment(); value=last==null||last.trim().isEmpty()?"روافد":last.trim(); }
        int divider=value.indexOf('|'); if(divider>0) value=value.substring(0,divider).trim();
        return value.length()>120?value.substring(0,120):value;
    }

    private void applyReadingMode(){ if(webView!=null&&pageReady) webView.evaluateJavascript(ReadingMode.webScript(ReadingModeStore.load(this)),null); }

    private void applyFitScript(){
        if(webView==null) return;
        String js="(function(){"
                +"var m=document.querySelector('meta[name=viewport]');if(!m){m=document.createElement('meta');m.name='viewport';document.head.appendChild(m);}"
                +"m.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=5,user-scalable=yes');"
                +"var s=document.getElementById('rawafid-app-fit');if(!s){s=document.createElement('style');s.id='rawafid-app-fit';document.head.appendChild(s);}"
                +"s.textContent='html{direction:ltr!important;width:100%!important;max-width:100vw!important;overflow-x:hidden!important}'"
                +"+'body{direction:rtl!important;width:100%!important;max-width:100vw!important;overflow-x:hidden!important}'"
                +"+'*,*:before,*:after{box-sizing:border-box!important;min-width:0!important}'"
                +"+'body *{max-width:100vw!important}'"
                +"+'main,article,section,header,footer,nav,div{min-width:0!important}'"
                +"+'img,video,svg,canvas,iframe{max-width:100%!important;height:auto!important}'"
                +"+'p,h1,h2,h3,h4,h5,h6,li{max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}'"
                +"+'table,pre{display:block!important;max-width:100%!important;overflow-x:auto!important}'"
                +"+'[data-rawafid-app-nav-hidden=\"1\"]{display:none!important}';"
                +"Array.prototype.forEach.call(document.querySelectorAll('nav,[role=navigation]'),function(el){"
                +"var cs=getComputedStyle(el),r=el.getBoundingClientRect(),controls=el.querySelectorAll('a,button').length;"
                +"var fixed=(cs.position==='fixed'||cs.position==='sticky');"
                +"var bottom=r.bottom>=window.innerHeight-24&&r.top>window.innerHeight*0.55;"
                +"if(fixed&&bottom&&r.height>35&&r.height<=170&&controls>=3){el.setAttribute('data-rawafid-app-nav-hidden','1');}"
                +"});"
                +"var de=document.documentElement,b=document.body,vv=window.visualViewport;var h=document.querySelector('h1'),main=document.querySelector('main');"
                +"var hr=h?h.getBoundingClientRect():null,mr=main?main.getBoundingClientRect():null;"
                +"return [window.innerWidth,de.clientWidth,de.scrollWidth,b?b.scrollWidth:0,window.scrollX,getComputedStyle(de).direction,b?getComputedStyle(b).direction:'',vv?vv.offsetLeft:0,vv?vv.width:0,hr?hr.left:-999,hr?hr.right:-999,mr?mr.left:-999,mr?mr.right:-999].join('|');})();";
        webView.evaluateJavascript(js,value->{ if(BuildConfig.DEBUG) Log.i(FIT_TAG,"metrics="+value); });
        if(BuildConfig.DEBUG){
            int[] screen=new int[2],window=new int[2]; webView.getLocationOnScreen(screen); webView.getLocationInWindow(window);
            Log.i(NATIVE_FIT_TAG,"scrollX="+webView.getScrollX()+" width="+webView.getWidth()+" left="+webView.getLeft()+" right="+webView.getRight()+" dir="+webView.getLayoutDirection()+" layer="+webView.getLayerType());
            Log.i(SCALE_TAG,"nativeScale="+webView.getScale()+" x="+webView.getX()+" translationX="+webView.getTranslationX()+" screenX="+screen[0]+" windowX="+window[0]+" rootDir="+(root==null?-1:root.getLayoutDirection()));
            webView.evaluateJavascript("(function(){var vv=window.visualViewport;return [window.devicePixelRatio,vv?vv.scale:-1,vv?vv.offsetLeft:-1,vv?vv.width:-1,screen.width,window.innerWidth].join('|');})();",value->Log.i(SCALE_TAG,"js="+value));
            String textJs="(function(){var h=document.querySelector('h1');if(!h)return 'NO_H1';var rr=null;try{var range=document.createRange();range.selectNodeContents(h);rr=range.getBoundingClientRect();}catch(e){}var hr=h.getBoundingClientRect(),cs=getComputedStyle(h);return [Math.round(hr.left),Math.round(hr.right),Math.round(hr.width),h.clientWidth,h.scrollWidth,rr?Math.round(rr.left):-999,rr?Math.round(rr.right):-999,rr?Math.round(rr.width):-1,cs.whiteSpace,cs.overflow,cs.textIndent,cs.transform,cs.fontSize,cs.lineHeight,''].join('|');})();";
            webView.evaluateJavascript(textJs,value->Log.i(TEXT_FIT_TAG,"metrics="+value));
        }
    }

    private void shareCurrent(){
        if(!TrustedUrl.isRawafidHttps(currentUrl)) return;
        Intent share=new Intent(Intent.ACTION_SEND); share.setType("text/plain");
        share.putExtra(Intent.EXTRA_TEXT,(currentTitle.isEmpty()?"روافد":currentTitle)+"\n"+currentUrl);
        startActivity(Intent.createChooser(share,"مشاركة من روافد"));
    }

    private void showError(){
        if(isFinishing()||webView==null||root==null||errorPanel!=null) return;
        if(BuildConfig.DEBUG) Log.e(WEB_TAG,"main-frame-load-error url="+currentUrl);
        pageReady=false; webView.stopLoading(); webView.setVisibility(View.GONE);
        LinearLayout box=new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setGravity(Gravity.CENTER); box.setPadding(dp(24),dp(24),dp(24),dp(24)); box.setLayoutDirection(View.LAYOUT_DIRECTION_RTL); box.setBackgroundColor(surface);
        TextView message=new TextView(this); message.setText("تعذر تحميل الصفحة. تحقق من الاتصال ثم أعد المحاولة."); message.setTextSize(16); message.setTextColor(ink); message.setGravity(Gravity.CENTER); box.addView(message,new LinearLayout.LayoutParams(-1,-2));
        Button retry=iconButton("إعادة المحاولة"); retry.setTextColor(Color.WHITE); GradientDrawable g=new GradientDrawable(); g.setColor(teal); g.setCornerRadius(dp(14)); retry.setBackground(g); retry.setOnClickListener(v->{ dismissErrorPanel(); webView.setVisibility(View.VISIBLE); webView.loadUrl(currentUrl); });
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(56)); p.setMargins(0,dp(16),0,0); box.addView(retry,p); errorPanel=box; root.addView(box,1,new LinearLayout.LayoutParams(-1,0,1f));
    }

    private void dismissErrorPanel(){ if(errorPanel!=null&&root!=null){ root.removeView(errorPanel); errorPanel=null; } }

    private void openExternal(Uri uri){
        if(uri==null) return; String scheme=uri.getScheme(); if(scheme==null) return;
        List<String> allowed=Arrays.asList("https","http","mailto","tel"); if(!allowed.contains(scheme.toLowerCase(Locale.ROOT))) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); } catch(ActivityNotFoundException ignored){}
    }

    private int dp(int value){ return (int)(value*getResources().getDisplayMetrics().density); }
}
