package org.healthrenewal.rawafid;

import android.net.Uri;

public final class TrustedUrl {
    private TrustedUrl(){}

    public static boolean isRawafidHttps(String value){
        if(value==null || value.trim().isEmpty()) return false;
        try {
            Uri uri=Uri.parse(value.trim());
            return isRawafidHttps(uri);
        } catch(Exception ignored){ return false; }
    }

    public static boolean isRawafidHttps(Uri uri){
        if(uri==null) return false;
        if(!"https".equalsIgnoreCase(uri.getScheme())) return false;
        String host=uri.getHost();
        if(host==null) return false;
        host=host.toLowerCase(java.util.Locale.ROOT);
        return "healthrenewal.org".equals(host) || "www.healthrenewal.org".equals(host);
    }
}
