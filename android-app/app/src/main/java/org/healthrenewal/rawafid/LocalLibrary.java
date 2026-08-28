package org.healthrenewal.rawafid;

import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Pure local library model. Only Rawafid relative paths are accepted. */
public final class LocalLibrary {
    public static final int MAX_ITEMS=500;

    private LocalLibrary(){}

    public static final class Item {
        public final String path;
        public final String title;
        public final long savedAt;
        public final long lastOpenedAt;
        public final boolean readLater;

        public Item(String path,String title,long savedAt,long lastOpenedAt,boolean readLater){
            this.path=validPath(path)?clean(path,500):"";
            this.title=clean(title,240);
            this.savedAt=Math.max(0L,savedAt);
            this.lastOpenedAt=Math.max(0L,lastOpenedAt);
            this.readLater=readLater;
        }

        public boolean isValid(){ return !path.isEmpty()&&!title.isEmpty(); }
    }

    public static boolean validPath(String path){
        if(path==null) return false;
        String v=path.trim();
        return v.startsWith("/")&&!v.startsWith("//")&&!v.contains("\\")&&!v.contains("\u0000");
    }

    public static List<Item> upsert(List<Item> items,Item incoming){
        LinkedHashMap<String,Item> byPath=new LinkedHashMap<>();
        if(items!=null){
            for(Item item:items){
                if(item==null||!item.isValid()) continue;
                byPath.put(item.path,item);
            }
        }
        if(incoming!=null&&incoming.isValid()) byPath.put(incoming.path,incoming);
        ArrayList<Item> out=new ArrayList<>(byPath.values());
        out.sort(Comparator.comparingLong((Item i)->i.savedAt).reversed());
        if(out.size()>MAX_ITEMS) out=new ArrayList<>(out.subList(0,MAX_ITEMS));
        return out;
    }

    public static List<Item> remove(List<Item> items,String path){
        ArrayList<Item> out=new ArrayList<>();
        if(items==null) return out;
        for(Item item:items){ if(item!=null&&item.isValid()&&!item.path.equals(path)) out.add(item); }
        return out;
    }

    public static List<Item> markOpened(List<Item> items,String path,long when){
        ArrayList<Item> out=new ArrayList<>();
        if(items==null) return out;
        for(Item item:items){
            if(item==null||!item.isValid()) continue;
            if(item.path.equals(path)) out.add(new Item(item.path,item.title,item.savedAt,Math.max(0L,when),item.readLater));
            else out.add(item);
        }
        return out;
    }

    public static String encode(List<Item> items){
        JSONArray arr=new JSONArray();
        if(items==null) return arr.toString();
        int count=0;
        for(Item item:items){
            if(item==null||!item.isValid()) continue;
            if(count++>=MAX_ITEMS) break;
            try {
                JSONObject o=new JSONObject();
                o.put("path",item.path);
                o.put("title",item.title);
                o.put("saved_at",item.savedAt);
                o.put("last_opened_at",item.lastOpenedAt);
                o.put("read_later",item.readLater);
                arr.put(o);
            } catch(Exception ignored){}
        }
        return arr.toString();
    }

    public static List<Item> decode(String raw){
        if(raw==null||raw.trim().isEmpty()) return Collections.emptyList();
        ArrayList<Item> out=new ArrayList<>();
        try {
            JSONArray arr=new JSONArray(raw);
            for(int i=0;i<arr.length()&&out.size()<MAX_ITEMS;i++){
                JSONObject o=arr.optJSONObject(i); if(o==null) continue;
                Item item=new Item(o.optString("path",""),o.optString("title",""),o.optLong("saved_at",0L),o.optLong("last_opened_at",0L),o.optBoolean("read_later",true));
                if(item.isValid()) out.add(item);
            }
        } catch(Exception ignored){ return Collections.emptyList(); }
        return upsert(out,null);
    }

    private static String clean(String value,int max){
        if(value==null) return "";
        String v=value.trim();
        return v.length()>max?v.substring(0,max):v;
    }
}
