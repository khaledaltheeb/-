package org.healthrenewal.rawafid;

import android.Manifest;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ContentSyncWorker extends Worker {
    private static final String BASE = "https://healthrenewal.org";
    private static final Pattern LOC = Pattern.compile("<loc>(https://healthrenewal\\.org/[^<]+)</loc>");
    private static final int MAX_SITEMAPS = 40;
    private static final int MAX_URLS = 30000;

    public ContentSyncWorker(@NonNull Context c,@NonNull WorkerParameters p){ super(c,p); }

    @NonNull @Override public Result doWork(){
        try {
            SecurePrefs prefs = new SecurePrefs(getApplicationContext());
            String selected = prefs.getSectors();
            if(selected.trim().isEmpty()) return Result.success();

            Set<String> pageUrls = loadAllPageUrls();
            if(pageUrls.isEmpty()) return Result.retry();

            List<String> matches = new ArrayList<>();
            for(String url : pageUrls) if(matchesSelectedPath(url, selected)) matches.add(url);
            Collections.sort(matches);

            String stateKey = "sector_state_" + Integer.toHexString(selected.hashCode());
            long previous = prefs.getLastSeen(stateKey);
            long current = stableFingerprint(matches);

            if(previous != 0L && previous != current) {
                String target = newestCandidate(matches);
                notifyNewContent(target);
            }
            prefs.setLastSeen(stateKey,current);
            return Result.success();
        } catch(Exception e){
            return Result.retry();
        }
    }

    private Set<String> loadAllPageUrls() throws Exception {
        String index = fetch(BASE + "/sitemap.xml");
        Matcher indexMatcher = LOC.matcher(index);
        List<String> childSitemaps = new ArrayList<>();
        Set<String> directPages = new LinkedHashSet<>();
        while(indexMatcher.find()) {
            String url = decodeXml(indexMatcher.group(1));
            if(url.contains("/sitemaps/") && url.contains(".xml")) childSitemaps.add(url);
            else directPages.add(url);
        }
        if(childSitemaps.isEmpty()) return directPages;

        Set<String> pages = new LinkedHashSet<>();
        int sitemapCount = 0;
        for(String sitemap : childSitemaps) {
            if(sitemapCount++ >= MAX_SITEMAPS || pages.size() >= MAX_URLS) break;
            String xml = fetch(sitemap);
            Matcher m = LOC.matcher(xml);
            while(m.find() && pages.size() < MAX_URLS) {
                String url = decodeXml(m.group(1));
                if(!url.contains("/sitemaps/") && isPublicPage(url)) pages.add(url);
            }
        }
        return pages;
    }

    private boolean isPublicPage(String url) {
        return url.startsWith(BASE + "/")
                && !url.contains("/api/")
                && !url.contains("/admin")
                && !url.contains("/login")
                && !url.contains("/register");
    }

    private String fetch(String url) throws Exception {
        HttpURLConnection con = (HttpURLConnection)new URL(url).openConnection();
        con.setConnectTimeout(10000);
        con.setReadTimeout(20000);
        con.setInstanceFollowRedirects(true);
        con.setRequestProperty("Accept","application/xml,text/xml;q=0.9,*/*;q=0.5");
        con.setRequestProperty("User-Agent","RawafidAndroid/1.0 (+https://healthrenewal.org)");
        int code = con.getResponseCode();
        if(code < 200 || code >= 300) throw new IllegalStateException("HTTP " + code);
        StringBuilder body = new StringBuilder();
        try(BufferedReader r = new BufferedReader(new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while((line = r.readLine()) != null) body.append(line);
        } finally {
            con.disconnect();
        }
        return body.toString();
    }

    private String decodeXml(String value) {
        return value.replace("&amp;","&").replace("&lt;","<").replace("&gt;",">");
    }

    private boolean matchesSelectedPath(String url,String selected){
        for(String token:selected.split(",")) {
            String clean = token.trim();
            if(clean.isEmpty()) continue;
            if(url.startsWith(BASE + clean) || url.contains(clean)) return true;
        }
        return false;
    }

    private long stableFingerprint(List<String> urls) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        for(String url : urls) {
            digest.update(url.getBytes(StandardCharsets.UTF_8));
            digest.update((byte)'\n');
        }
        byte[] hash = digest.digest();
        long value = 0L;
        for(int i=0;i<Math.min(8,hash.length);i++) value = (value << 8) | (hash[i] & 0xffL);
        return value;
    }

    private String newestCandidate(List<String> matches) {
        if(matches.isEmpty()) return BASE;
        return matches.get(matches.size()-1);
    }

    private void notifyNewContent(String url){
        Context c = getApplicationContext();
        if(android.os.Build.VERSION.SDK_INT>=33 && ActivityCompat.checkSelfPermission(c, Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED) return;
        Intent i = new Intent(c,MainActivity.class).setAction(Intent.ACTION_VIEW).setData(android.net.Uri.parse(url));
        PendingIntent pi = PendingIntent.getActivity(c,77,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b = new NotificationCompat.Builder(c,RawafidApp.CHANNEL_CONTENT)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("جديد في روافد")
                .setContentText("نُشر أو أضيف محتوى جديد ضمن المجالات التي تتابعها.")
                .setContentIntent(pi)
                .setAutoCancel(true)
                .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION);
        ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(2001,b.build());
    }
}
