package org.healthrenewal.rawafid;

import static org.junit.Assert.*;
import org.junit.Test;

public class MobileManifestClientTest {
    @Test public void parsesDiscoverLinksAndEnabledToolsInManifestOrder() throws Exception {
        String json="{\"ok\":true,\"manifest\":{\"brand\":{\"title\":\"روافد\",\"subtitle\":\"منصة عربية\"},\"sections\":[{\"id\":\"discover\",\"links\":[{\"title\":\"الموسوعة\",\"path\":\"/encyclopedia/\"}]},{\"id\":\"tools\",\"tool_ids\":[\"emergency_center\",\"companion\"]}]},\"tools\":[{\"id\":\"companion\",\"name\":\"رفيقة روافد\",\"description\":\"عناية\",\"kind\":\"native\",\"nativeRoute\":\"companion\",\"webPath\":null},{\"id\":\"emergency_center\",\"name\":\"الطوارئ SOS\",\"description\":\"طوارئ\",\"kind\":\"native\",\"nativeRoute\":\"emergency\",\"webPath\":null}]}";
        MobileManifestClient.Manifest manifest=MobileManifestClient.parse(json);
        assertEquals("روافد",manifest.title);
        assertEquals(1,manifest.discoverLinks.size());
        assertEquals("/encyclopedia/",manifest.discoverLinks.get(0).path);
        assertEquals(2,manifest.tools.size());
        assertEquals("emergency_center",manifest.tools.get(0).id);
        assertEquals("companion",manifest.tools.get(1).id);
    }

    @Test public void rejectsProtocolRelativePaths() throws Exception {
        String json="{\"ok\":true,\"manifest\":{\"sections\":[{\"id\":\"discover\",\"links\":[{\"title\":\"خبيث\",\"path\":\"//evil.example\"}]}]},\"tools\":[]}";
        MobileManifestClient.Manifest manifest=MobileManifestClient.parse(json);
        assertTrue(manifest.discoverLinks.isEmpty());
    }

    @Test(expected=IllegalArgumentException.class)
    public void failsClosedWhenManifestMissing() throws Exception {
        MobileManifestClient.parse("{\"ok\":true}");
    }
}
