package org.healthrenewal.rawafid;

import static org.junit.Assert.*;
import org.junit.Test;
import java.util.ArrayList;
import java.util.List;

public class LocalLibraryTest {
    @Test public void acceptsOnlyRawafidRelativePaths(){
        assertTrue(LocalLibrary.validPath("/sectors/mental-health"));
        assertFalse(LocalLibrary.validPath("https://evil.example"));
        assertFalse(LocalLibrary.validPath("//evil.example/path"));
        assertFalse(LocalLibrary.validPath("javascript:alert(1)"));
    }

    @Test public void upsertDeduplicatesByPathAndKeepsNewestValue(){
        List<LocalLibrary.Item> items=new ArrayList<>();
        items=LocalLibrary.upsert(items,new LocalLibrary.Item("/a","قديم",1,0,true));
        items=LocalLibrary.upsert(items,new LocalLibrary.Item("/a","جديد",2,0,false));
        assertEquals(1,items.size());
        assertEquals("جديد",items.get(0).title);
        assertFalse(items.get(0).readLater);
    }

    @Test public void encodeDecodeRoundTripPreservesMetadata(){
        List<LocalLibrary.Item> items=new ArrayList<>();
        items.add(new LocalLibrary.Item("/encyclopedia/test","عنوان عربي",100,200,true));
        List<LocalLibrary.Item> decoded=LocalLibrary.decode(LocalLibrary.encode(items));
        assertEquals(1,decoded.size());
        assertEquals("/encyclopedia/test",decoded.get(0).path);
        assertEquals("عنوان عربي",decoded.get(0).title);
        assertEquals(100,decoded.get(0).savedAt);
        assertEquals(200,decoded.get(0).lastOpenedAt);
        assertTrue(decoded.get(0).readLater);
    }

    @Test public void markOpenedDoesNotChangeSavedAt(){
        List<LocalLibrary.Item> items=new ArrayList<>();
        items.add(new LocalLibrary.Item("/a","أ",10,0,true));
        List<LocalLibrary.Item> updated=LocalLibrary.markOpened(items,"/a",99);
        assertEquals(10,updated.get(0).savedAt);
        assertEquals(99,updated.get(0).lastOpenedAt);
    }

    @Test public void libraryIsCapped(){
        List<LocalLibrary.Item> items=new ArrayList<>();
        for(int i=0;i<LocalLibrary.MAX_ITEMS+25;i++){
            items=LocalLibrary.upsert(items,new LocalLibrary.Item("/item/"+i,"عنصر "+i,i,0,true));
        }
        assertEquals(LocalLibrary.MAX_ITEMS,items.size());
    }
}
