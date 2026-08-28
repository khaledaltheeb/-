package org.healthrenewal.rawafid;

import android.net.Uri;
import java.net.URI;
import java.util.Locale;

public final class TrustedUrl {
    private TrustedUrl(){}

    public static boolean isRawafidHttps(String value){
        if(value==null || value.trim().isEmpty()) return false;
        try {
            URI uri=new URI(value.trim());
            if(!"https".equalsIgnoreCase(uri.getScheme())) return false;
            String host=uri.getHost();
            if(host==null) return false;
            host=host.toLowerCase(Locale.ROOT);
            return "healthrenewal.org".equals(host) || "www.healthrenewal.org".equals(host);
        } catch(Exception ignored){ return false; }
    }

    public static boolean isRawafidHttps(Uri uri){
        return uri!=null && isRawafidHttps(uri.toString());
    }
}
