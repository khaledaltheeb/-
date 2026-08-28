package org.healthrenewal.rawafid;

import static org.junit.Assert.*;
import org.junit.Test;

public final class TrustedUrlTest {
    @Test public void acceptsOnlyRawafidHttpsHosts(){
        assertTrue(TrustedUrl.isRawafidHttps("https://healthrenewal.org/"));
        assertTrue(TrustedUrl.isRawafidHttps("https://www.healthrenewal.org/sectors/mental-health"));
        assertFalse(TrustedUrl.isRawafidHttps("http://healthrenewal.org/"));
        assertFalse(TrustedUrl.isRawafidHttps("https://healthrenewal.org.evil.example/"));
        assertFalse(TrustedUrl.isRawafidHttps("https://evil.example/?next=healthrenewal.org"));
        assertFalse(TrustedUrl.isRawafidHttps("javascript:alert(1)"));
        assertFalse(TrustedUrl.isRawafidHttps("file:///etc/passwd"));
        assertFalse(TrustedUrl.isRawafidHttps(""));
        assertFalse(TrustedUrl.isRawafidHttps((String)null));
    }
}
