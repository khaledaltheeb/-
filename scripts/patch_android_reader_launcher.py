from pathlib import Path

p = Path('android-app/app/src/main/java/org/healthrenewal/rawafid/MainActivity.java')
text = p.read_text(encoding='utf-8')
start = text.index('    @SuppressLint("SetJavaScriptEnabled")\n    private void openWeb(String url){')
end = text.index('    private void showNetworkError(String retryUrl){', start)
replacement = '''    private void openWeb(String url){
        if(!TrustedUrl.isRawafidHttps(url)){
            openExternal(Uri.parse(url));
            return;
        }
        Intent reader=new Intent(this,WebContentActivity.class);
        reader.putExtra(WebContentActivity.EXTRA_URL,url);
        startActivity(reader);
    }

'''
p.write_text(text[:start] + replacement + text[end:], encoding='utf-8')
