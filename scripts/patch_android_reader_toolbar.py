from pathlib import Path

p=Path('android-app/app/src/main/java/org/healthrenewal/rawafid/MainActivity.java')
text=p.read_text(encoding='utf-8')
start=text.index('    @SuppressLint("SetJavaScriptEnabled")\n    private void openWeb(String url){')
end=text.index('    private void showNetworkError(String retryUrl){',start)
block=r'''    @SuppressLint("SetJavaScriptEnabled")
    private void openWeb(String url){
        if(!TrustedUrl.isRawafidHttps(url)){ openExternal(Uri.parse(url)); return; }
        atHome=false;
        WebView w=new WebView(this);
        activeWebView=w;

        LinearLayout webShell=new LinearLayout(this);
        webShell.setOrientation(LinearLayout.VERTICAL);
        webShell.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        webShell.setBackgroundColor(Color.WHITE);
        LinearLayout toolbar=new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(dp(6),dp(3),dp(6),dp(3));
        toolbar.setBackgroundColor(bg);

        Button saveButton=compactButton("حفظ",teal);
        Button libraryButton=compactButton("مكتبتي",Color.rgb(74,91,112));
        Button shareButton=compactButton("مشاركة",Color.rgb(88,104,92));
        LinearLayout.LayoutParams actionParams=new LinearLayout.LayoutParams(0,dp(46),1f);
        actionParams.setMargins(dp(2),0,dp(2),0);
        saveButton.setLayoutParams(new LinearLayout.LayoutParams(actionParams));
        libraryButton.setLayoutParams(new LinearLayout.LayoutParams(actionParams));
        shareButton.setLayoutParams(new LinearLayout.LayoutParams(actionParams));
        toolbar.addView(saveButton); toolbar.addView(libraryButton); toolbar.addView(shareButton);
        webShell.addView(toolbar,new LinearLayout.LayoutParams(-1,dp(52)));
        webShell.addView(w,new LinearLayout.LayoutParams(-1,0,1f));

        final String[] currentPath={rawafidRelativePath(Uri.parse(url))};
        final String[] currentTitle={"روافد"};
        updateLibraryButton(saveButton,currentPath[0]);
        saveButton.setOnClickListener(v->{
            if(currentPath[0].isEmpty()) return;
            if(isSavedInLibrary(currentPath[0])){
                prefs.removeFromLibrary(currentPath[0]);
                Toast.makeText(this,"تمت الإزالة من مكتبتي",Toast.LENGTH_SHORT).show();
            } else {
                prefs.saveToLibrary(currentPath[0],currentTitle[0],true);
                Toast.makeText(this,"تم الحفظ في مكتبتي",Toast.LENGTH_SHORT).show();
            }
            updateLibraryButton(saveButton,currentPath[0]);
        });
        libraryButton.setOnClickListener(v->startActivity(new Intent(this,LibraryActivity.class)));
        shareButton.setOnClickListener(v->{
            String target=BASE+(currentPath[0].isEmpty()?"/":currentPath[0]);
            Intent share=new Intent(Intent.ACTION_SEND);
            share.setType("text/plain");
            share.putExtra(Intent.EXTRA_TEXT,currentTitle[0]+"\n"+target);
            startActivity(Intent.createChooser(share,"مشاركة من روافد"));
        });

        WebSettings s=w.getSettings();
        s.setJavaScriptEnabled(true); s.setJavaScriptCanOpenWindowsAutomatically(false); s.setSupportMultipleWindows(false); s.setDomStorageEnabled(true);
        s.setUseWideViewPort(true); s.setLoadWithOverviewMode(true); s.setTextZoom(100); s.setBuiltInZoomControls(true); s.setDisplayZoomControls(false);
        s.setAllowFileAccess(false); s.setAllowContentAccess(false); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW); s.setGeolocationEnabled(false);
        s.setMediaPlaybackRequiresUserGesture(true); s.setSafeBrowsingEnabled(true); s.setUserAgentString(s.getUserAgentString()+" RawafidAndroid/1.0");
        CookieManager.getInstance().setAcceptCookie(true); CookieManager.getInstance().setAcceptThirdPartyCookies(w,false);
        w.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){ Uri u=req.getUrl(); if(TrustedUrl.isRawafidHttps(u)) return false; openExternal(u); return true; }
            @Override public void onPageFinished(WebView view,String finishedUrl){
                super.onPageFinished(view,finishedUrl);
                if(!TrustedUrl.isRawafidHttps(finishedUrl)) return;
                currentPath[0]=rawafidRelativePath(Uri.parse(finishedUrl));
                String pageTitle=view.getTitle();
                currentTitle[0]=(pageTitle==null||pageTitle.trim().isEmpty())?"روافد":pageTitle.trim();
                updateLibraryButton(saveButton,currentPath[0]);
                if(!currentPath[0].isEmpty()&&isSavedInLibrary(currentPath[0])) prefs.markLibraryOpened(currentPath[0]);
                String js="(function(){var m=document.querySelector('meta[name=viewport]');if(!m){m=document.createElement('meta');m.name='viewport';document.head.appendChild(m);}m.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=5,user-scalable=yes');var s=document.getElementById('rawafid-app-fit');if(!s){s=document.createElement('style');s.id='rawafid-app-fit';s.textContent='html{overflow-x:hidden!important}*,*:before,*:after{box-sizing:border-box!important;min-width:0!important}main,article,section,header,footer,nav{max-width:100%!important}img,video,svg,canvas{max-width:100%!important;height:auto!important}p,h1,h2,h3,h4,h5,h6,li{overflow-wrap:anywhere!important}table,pre{display:block!important;max-width:100%!important;overflow-x:auto!important}';document.head.appendChild(s);}requestAnimationFrame(function(){var vw=window.innerWidth||document.documentElement.clientWidth;var sw=Math.max(document.documentElement.scrollWidth,document.body?document.body.scrollWidth:0);if(vw>0&&sw>vw*1.02&&document.body){var z=Math.min(1,vw/sw);document.body.style.zoom=String(z);document.documentElement.style.overflowX='hidden';}});})();";
                view.evaluateJavascript(js,null);
            }
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){
                if(request.isForMainFrame()) runOnUiThread(()->showNetworkError(url));
            }
            @Override public void onReceivedHttpError(WebView view,WebResourceRequest request,WebResourceResponse response){
                if(request.isForMainFrame() && response.getStatusCode()>=500) runOnUiThread(()->showNetworkError(url));
            }
        });
        w.loadUrl(url); setContentView(webShell);
    }

    private String rawafidRelativePath(Uri uri){
        if(!TrustedUrl.isRawafidHttps(uri)) return "";
        String path=uri.getEncodedPath();
        if(path==null||path.isEmpty()) path="/";
        String query=uri.getEncodedQuery();
        return query==null?path:path+"?"+query;
    }

    private boolean isSavedInLibrary(String path){
        if(path==null||path.isEmpty()) return false;
        for(LocalLibrary.Item item:prefs.getLibraryItems()) if(path.equals(item.path)) return true;
        return false;
    }

    private void updateLibraryButton(Button button,String path){
        button.setText(isSavedInLibrary(path)?"محفوظ ✓":"حفظ");
    }

    private Button compactButton(String value,int color){
        Button b=new Button(this);
        b.setText(value); b.setTextSize(13); b.setAllCaps(false);
        b.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        b.setTextDirection(View.TEXT_DIRECTION_FIRST_STRONG_RTL);
        b.setBackgroundColor(color); b.setTextColor(Color.WHITE);
        b.setMinHeight(0); b.setMinWidth(0); b.setPadding(dp(4),0,dp(4),0);
        return b;
    }

'''
p.write_text(text[:start]+block+text[end:],encoding='utf-8')
