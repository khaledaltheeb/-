package org.healthrenewal.rawafid;

import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Local observation journal. It stores what the user reports; it does not infer diagnoses,
 * causes, medication changes, or clinical severity beyond the user's own 0..10 rating.
 */
public final class SymptomJournal {
    public static final int MAX_ENTRIES=1000;

    private SymptomJournal(){}

    public static final class Entry {
        public final String id;
        public final long occurredAt;
        public final String symptom;
        public final int intensity;
        public final String context;
        public final String whatHelped;
        public final String note;

        public Entry(String id,long occurredAt,String symptom,int intensity,String context,String whatHelped,String note){
            this.id=cleanId(id);
            this.occurredAt=Math.max(0L,occurredAt);
            this.symptom=clean(symptom,160);
            this.intensity=clamp(intensity,0,10);
            this.context=clean(context,600);
            this.whatHelped=clean(whatHelped,600);
            this.note=clean(note,1200);
        }

        public boolean isValid(){ return !id.isEmpty()&&occurredAt>0L&&!symptom.isEmpty(); }
    }

    public static List<Entry> upsert(List<Entry> entries,Entry incoming){
        ArrayList<Entry> out=new ArrayList<>();
        if(entries!=null) for(Entry entry:entries) if(entry!=null&&entry.isValid()&&!entry.id.equals(incoming==null?"":incoming.id)) out.add(entry);
        if(incoming!=null&&incoming.isValid()) out.add(incoming);
        out.sort(Comparator.comparingLong((Entry e)->e.occurredAt).reversed());
        if(out.size()>MAX_ENTRIES) return new ArrayList<>(out.subList(0,MAX_ENTRIES));
        return out;
    }

    public static List<Entry> remove(List<Entry> entries,String id){
        ArrayList<Entry> out=new ArrayList<>();
        if(entries==null) return out;
        for(Entry entry:entries) if(entry!=null&&entry.isValid()&&!entry.id.equals(id)) out.add(entry);
        return out;
    }

    public static String encode(List<Entry> entries){
        JSONArray arr=new JSONArray();
        if(entries==null) return arr.toString();
        int count=0;
        for(Entry entry:entries){
            if(entry==null||!entry.isValid()) continue;
            if(count++>=MAX_ENTRIES) break;
            try {
                JSONObject o=new JSONObject();
                o.put("id",entry.id);
                o.put("occurred_at",entry.occurredAt);
                o.put("symptom",entry.symptom);
                o.put("intensity",entry.intensity);
                o.put("context",entry.context);
                o.put("what_helped",entry.whatHelped);
                o.put("note",entry.note);
                arr.put(o);
            } catch(Exception ignored){}
        }
        return arr.toString();
    }

    public static List<Entry> decode(String raw){
        if(raw==null||raw.trim().isEmpty()) return Collections.emptyList();
        ArrayList<Entry> out=new ArrayList<>();
        try {
            JSONArray arr=new JSONArray(raw);
            for(int i=0;i<arr.length()&&out.size()<MAX_ENTRIES;i++){
                JSONObject o=arr.optJSONObject(i); if(o==null) continue;
                Entry entry=new Entry(
                        o.optString("id",""),o.optLong("occurred_at",0L),o.optString("symptom",""),
                        o.optInt("intensity",0),o.optString("context",""),o.optString("what_helped",""),o.optString("note",""));
                if(entry.isValid()) out.add(entry);
            }
        } catch(Exception ignored){ return Collections.emptyList(); }
        out.sort(Comparator.comparingLong((Entry e)->e.occurredAt).reversed());
        return out;
    }

    public static String summary(List<Entry> entries,int limit){
        if(entries==null||entries.isEmpty()) return "لا توجد تسجيلات أعراض بعد.";
        int safeLimit=Math.max(1,Math.min(limit,50));
        StringBuilder out=new StringBuilder("ملخص وصفي من تسجيلات المستخدم فقط:\n");
        int count=0;
        for(Entry entry:entries){
            if(entry==null||!entry.isValid()) continue;
            out.append("• ").append(entry.symptom).append(" — الشدة المسجلة ").append(entry.intensity).append("/10");
            if(!entry.context.isEmpty()) out.append(" — السياق: ").append(entry.context);
            if(!entry.whatHelped.isEmpty()) out.append(" — ما ساعد: ").append(entry.whatHelped);
            out.append('\n');
            if(++count>=safeLimit) break;
        }
        out.append("هذا الملخص لا يحدد سببًا أو تشخيصًا ولا يقترح تغيير علاج.");
        return out.toString();
    }

    private static String cleanId(String value){
        String v=clean(value,80);
        return v.matches("[A-Za-z0-9_-]{4,80}")?v:"";
    }
    private static String clean(String value,int max){ if(value==null)return ""; String v=value.trim(); return v.length()>max?v.substring(0,max):v; }
    private static int clamp(int value,int min,int max){ return Math.max(min,Math.min(max,value)); }
}
