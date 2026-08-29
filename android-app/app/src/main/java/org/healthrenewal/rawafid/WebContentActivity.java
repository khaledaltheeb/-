package org.healthrenewal.rawafid;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
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
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/** Hardened first-party Rawafid reader; its LTR render surface preserves a stable viewport while document content remains RTL. */
public final class WebContentActivity extends AppCompatActivity {
    public static final String EXTRA_URL="rawafid_url";
    private static final String FIT_TAG="RawafidFit";
    private static final String TEXT_FIT_TAG="RawafidTextFit";
    private static final String NATIVE_FIT_TAG="RawafidNativeFit";
    private static final String SCALE_TAG="RawafidScale";
    private static final String WEB_TAG="RawafidWeb";

    private final int teal=Color.rgb(11,107,103);
    private SecurePrefs prefs;
    private LinearLayout root;
    private WebView webView;
    private View errorPanel;
    private Button saveButton;
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
        if(!TrustedUrl.isRawafidHttps(incoming)){
            finish();
            return;
        }
        currentUrl=incoming;
        render();
        webView.loadUrl(currentUrl);
    }

    @Override protected void onResume(){
        super.onResume();
        if(pageReady&&webView!=null){
            applyReadingMode();
            applyFitScript();
        }
        refreshSaveButton();
    }

    @Override protected void onDestroy(){
        if(webView!=null){
            webView.stopLoading();
            webView.destroy();
            webView=null;
        }
        super.onDestroy();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void render(){
        root=new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_LTR);
        root.setBackgroundColor(Color.rgb(248,251,250));

        LinearLayout toolbar=new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        toolbar.setGravity(Gravity.CENTER);
        toolbar.setPadding(dp(6),dp(6),dp(6),dp(6));
        toolbar.setBackgroundColor(Color.WHITE);

        saveButton=toolbarButton("حفظ");
        Button library=toolbarButton("مكتبتي");
        Button reading=toolbarButton("القراءة");
        Button share=toolbarButton("مشاركة");
        toolbar.addView(saveButton,toolbarParams());
        toolbar.addView(library,toolbarParams());
        toolbar.addView(reading,toolbarParams());
        toolbar.addView(share,toolbarParams());
        root.addView(toolbar,new LinearLayout.LayoutParams(-1,dp(60)));

        webView=new WebView(this);
        webView.setLayoutDirection(View.LAYOUT_DIRECTION_LTR);
        // Keep Rawafid's reader on software rasterization: Android WebView's hardware
        // compositor displaced RTL glyph paint past the physical right edge despite
        // correct native, DOM and visual-viewport geometry.
        webView.setLayerType(View.LAYER_TYPE_SOFTWARE,null);
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
                openExternal(uri);
                return true;
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
                applyReadingMode();
                applyFitScript();
                webView.postDelayed(thisActivityFit(),350L);
                webView.postDelayed(thisActivityFit(),1200L);
                webView.postDelayed(thisActivityFit(),3000L);
            }
            private Runnable thisActivityFit(){
                return ()->{ if(webView!=null&&pageReady) applyFitScript(); };
            }
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){
                if(request.isForMainFrame()) showError();
            }
            @Override public void onReceivedHttpError(WebView view,WebResourceRequest request,WebResourceResponse response){
                if(request.isForMainFrame()&&response.getStatusCode()>=500) showError();
            }
        });
        root.addView(webView,new LinearLayout.LayoutParams(-1,0,1f));
        setContentView(root);

        saveButton.setOnClickListener(v->toggleSaved());
        library.setOnClickListener(v->startActivity(new Intent(this,LibraryActivity.class)));
        reading.setOnClickListener(v->startActivity(new Intent(this,ReadingModeActivity.class)));
        share.setOnClickListener(v->shareCurrent());
    }

    private void toggleSaved(){
        String path=currentPath();
        if(path.isEmpty()||currentTitle.isEmpty()){
            Toast.makeText(this,"انتظر اكتمال تحميل الصفحة أولًا",Toast.LENGTH_SHORT).show();
            return;
        }
        if(isSaved(path)){
            prefs.removeFromLibrary(path);
            Toast.makeText(this,"تمت الإزالة من مكتبتي",Toast.LENGTH_SHORT).show();
        } else {
            prefs.saveToLibrary(path,currentTitle,true);
            Toast.makeText(this,"تم الحفظ في مكتبتي",Toast.LENGTH_SHORT).show();
        }
        refreshSaveButton();
    }

    private void refreshSaveButton(){
        if(saveButton==null) return;
        String path=currentPath();
        saveButton.setText(!path.isEmpty()&&isSaved(path)?"محفوظ ✓":"حفظ");
    }

    private boolean isSaved(String path){
        if(path==null||path.isEmpty()) return false;
        for(LocalLibrary.Item item:prefs.getLibraryItems()) if(path.equals(item.path)) return true;
        return false;
    }

    private void markOpenedIfSaved(){
        String path=currentPath();
        if(!path.isEmpty()&&isSaved(path)) prefs.markLibraryOpened(path);
    }

    private String currentPath(){
        if(!TrustedUrl.isRawafidHttps(currentUrl)) return "";
        Uri uri=Uri.parse(currentUrl);
        String path=uri.getEncodedPath();
        if(path==null||path.isEmpty()) path="/";
        String query=uri.getEncodedQuery();
        if(query!=null&&!query.isEmpty()) path=path+"?"+query;
        return LocalLibrary.validPath(path)?path:"";
    }

    private String cleanTitle(String title,Uri uri){
        String value=title==null?"":title.trim();
        if(value.isEmpty()&&uri!=null){
            String last=uri.getLastPathSegment();
            value=last==null||last.trim().isEmpty()?"روافد":last.trim();
        }
        return value.length()>240?value.substring(0,240):value;
    }

    private void applyReadingMode(){
        if(webView==null||!pageReady) return;
        webView.evaluateJavascript(ReadingMode.webScript(ReadingModeStore.load(this)),null);
    }

    private void applyFitScript(){
        if(webView==null) return;
        String js="(function(){"
                +"var m=document.querySelector('meta[name=viewport]');"
                +"if(!m){m=document.createElement('meta');m.name='viewport';document.head.appendChild(m);}"
                +"m.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=5,user-scalable=yes');"
                +"var s=document.getElementById('rawafid-app-fit');"
                +"if(!s){s=document.createElement('style');s.id='rawafid-app-fit';document.head.appendChild(s);}"
                +"s.textContent='html{direction:ltr!important;width:100%!important;max-width:100vw!important;overflow-x:hidden!important}'"
                +"+'body{direction:rtl!important;width:100%!important;max-width:100vw!important;overflow-x:hidden!important}'"
                +"+'*,*:before,*:after{box-sizing:border-box!important;min-width:0!important}'"
                +"+'body *{max-width:100vw!important}'"
                +"+'main,article,section,header,footer,nav,div{min-width:0!important}'"
                +"+'img,video,svg,canvas,iframe{max-width:100%!important;height:auto!important}'"
                +"+'p,h1,h2,h3,h4,h5,h6,li{max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}'"
                +"+'table,pre{display:block!important;max-width:100%!important;overflow-x:auto!important}';"
                +"var de=document.documentElement,b=document.body,vv=window.visualViewport;"
                +"var h=document.querySelector('h1'),main=document.querySelector('main');"
                +"var hr=h?h.getBoundingClientRect():null,mr=main?main.getBoundingClientRect():null;"
                +"return [window.innerWidth,de.clientWidth,de.scrollWidth,b?b.scrollWidth:0,window.scrollX,getComputedStyle(de).direction,b?getComputedStyle(b).direction:'',vv?vv.offsetLeft:0,vv?vv.width:0,hr?hr.left:-999,hr?hr.right:-999,mr?mr.left:-999,mr?mr.right:-999].join('|');"
                +"})();";
        webView.evaluateJavascript(js,value->{
            if(BuildConfig.DEBUG) Log.i(FIT_TAG,"metrics="+value);
        });
        if(BuildConfig.DEBUG){
            int[] screen=new int[2];
            int[] window=new int[2];
            webView.getLocationOnScreen(screen);
            webView.getLocationInWindow(window);
            Log.i(NATIVE_FIT_TAG,"scrollX="+webView.getScrollX()+" width="+webView.getWidth()+" left="+webView.getLeft()+" right="+webView.getRight()+" dir="+webView.getLayoutDirection()+" layer="+webView.getLayerType());
            Log.i(SCALE_TAG,"nativeScale="+webView.getScale()+" x="+webView.getX()+" translationX="+webView.getTranslationX()+" screenX="+screen[0]+" windowX="+window[0]+" rootDir="+(root==null?-1:root.getLayoutDirection()));
            String scaleJs="(function(){var vv=window.visualViewport;return [window.devicePixelRatio,vv?vv.scale:-1,vv?vv.offsetLeft:-1,vv?vv.width:-1,screen.width,window.innerWidth].join('|');})();";
            webView.evaluateJavascript(scaleJs,value->Log.i(SCALE_TAG,"js="+value));
            String textJs="(function(){"
                    +"var h=document.querySelector('h1');if(!h)return 'NO_H1';"
                    +"var rr=null;try{var range=document.createRange();range.selectNodeContents(h);rr=range.getBoundingClientRect();}catch(e){}"
                    +"var hr=h.getBoundingClientRect(),cs=getComputedStyle(h);"
                    +"var kids=[];Array.prototype.slice.call(h.querySelectorAll('*'),0,12).forEach(function(el){var r=el.getBoundingClientRect(),c=getComputedStyle(el);kids.push([el.tagName,Math.round(r.left),Math.round(r.right),Math.round(r.width),el.clientWidth,el.scrollWidth,c.whiteSpace,c.overflow,c.textIndent,c.transform].join('~'));});"
                    +"return [Math.round(hr.left),Math.round(hr.right),Math.round(hr.width),h.clientWidth,h.scrollWidth,rr?Math.round(rr.left):-999,rr?Math.round(rr.right):-999,rr?Math.round(rr.width):-1,cs.whiteSpace,cs.overflow,cs.textIndent,cs.transform,cs.fontSize,cs.lineHeight,kids.join('^')].join('|');"
                    +"})();";
            webView.evaluateJavascript(textJs,value->Log.i(TEXT_FIT_TAG,"metrics="+value));
        }
    }

    private void shareCurrent(){
        if(!TrustedUrl.isRawafidHttps(currentUrl)) return;
        Intent share=new Intent(Intent.ACTION_SEND);
        share.setType("text/plain");
        String text=(currentTitle.isEmpty()?"روافد":currentTitle)+"\n"+currentUrl;
        share.putExtra(Intent.EXTRA_TEXT,text);
        startActivity(Intent.createChooser(share,"مشاركة من روافد"));
    }

    private void showError(){
        if(isFinishing()||webView==null||root==null||errorPanel!=null) return;
        if(BuildConfig.DEBUG) Log.e(WEB_TAG,"main-frame-load-error url="+currentUrl);
        pageReady=false;
        webView.stopLoading();
        webView.setVisibility(View.GONE);

        LinearLayout box=new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        box.setPadding(dp(24),dp(24),dp(24),dp(24));
        box.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        TextView message=new TextView(this);
        message.setText("تعذر تحميل الصفحة. تحقق من الاتصال ثم أعد المحاولة.");
        message.setTextSize(16);
        message.setTextColor(Color.DKGRAY);
        message.setGravity(Gravity.CENTER);
        box.addView(message,new LinearLayout.LayoutParams(-1,-2));
        Button retry=new Button(this);
        retry.setText("إعادة المحاولة");
        retry.setAllCaps(false);
        retry.setTextColor(Color.WHITE);
        retry.setBackgroundColor(teal);
        retry.setOnClickListener(v->{
            dismissErrorPanel();
            webView.setVisibility(View.VISIBLE);
            webView.loadUrl(currentUrl);
        });
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(56));
        p.setMargins(0,dp(16),0,0);
        box.addView(retry,p);
        errorPanel=box;
        root.addView(box,new LinearLayout.LayoutParams(-1,0,1f));
    }

    private void dismissErrorPanel(){
        if(errorPanel!=null&&root!=null){
            root.removeView(errorPanel);
            errorPanel=null;
        }
    }

    private void openExternal(Uri uri){
        if(uri==null) return;
        String scheme=uri.getScheme();
        if(scheme==null) return;
        List<String> allowed=Arrays.asList("https","http","mailto","tel");
        if(!allowed.contains(scheme.toLowerCase(Locale.ROOT))) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); } catch(ActivityNotFoundException ignored){}
    }

    private Button toolbarButton(String label){
        Button button=new Button(this);
        button.setText(label);
        button.setTextSize(13);
        button.setAllCaps(false);
        button.setMinHeight(dp(48));
        button.setMinWidth(dp(48));
        button.setContentDescription(label);
        return button;
    }

    private LinearLayout.LayoutParams toolbarParams(){
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,-1,1f);
        p.setMargins(dp(2),0,dp(2),0);
        return p;
    }

    private int dp(int value){ return (int)(value*getResources().getDisplayMetrics().density); }
}
