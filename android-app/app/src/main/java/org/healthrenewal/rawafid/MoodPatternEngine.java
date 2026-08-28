package org.healthrenewal.rawafid;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class MoodPatternEngine {
    private MoodPatternEngine(){}
    private static final String NON_CAUSAL=" هذا وصف لنمط في سجلاتكِ وليس إثباتًا لسبب المزاج أو تشخيصًا طبيًا.";

    public static final class Entry {
        public final long timestamp;
        public final int mood; // 1 very low, 2 low, 3 neutral, 4 good, 5 very good
        public Entry(long timestamp,int mood){ this.timestamp=Math.max(0L,timestamp); this.mood=Math.max(1,Math.min(5,mood)); }
        public LocalDate localDate(){ return Instant.ofEpochMilli(timestamp).atZone(ZoneId.systemDefault()).toLocalDate(); }
    }

    public static String encode(List<Entry> entries){
        if(entries==null || entries.isEmpty()) return "";
        StringBuilder out=new StringBuilder();
        for(Entry entry:entries){
            if(out.length()>0) out.append(';');
            out.append(entry.timestamp).append('|').append(entry.mood);
        }
        return out.toString();
    }

    public static List<Entry> decode(String raw){
        if(raw==null || raw.trim().isEmpty()) return new ArrayList<>();
        List<Entry> out=new ArrayList<>();
        for(String row:raw.split(";")){
            String[] parts=row.split("\\|");
            if(parts.length!=2) continue;
            try { out.add(new Entry(Long.parseLong(parts[0]),Integer.parseInt(parts[1]))); } catch(NumberFormatException ignored){}
        }
        Collections.sort(out,(a,b)->Long.compare(a.timestamp,b.timestamp));
        return out;
    }

    public static List<Entry> appendCapped(List<Entry> existing,Entry entry,int maxEntries){
        List<Entry> out=new ArrayList<>(existing==null?Collections.emptyList():existing);
        out.add(entry);
        Collections.sort(out,(a,b)->Long.compare(a.timestamp,b.timestamp));
        int max=Math.max(1,maxEntries);
        while(out.size()>max) out.remove(0);
        return out;
    }

    public static String insight(List<Entry> entries,LocalDate lastPeriodStart,int averageCycleLength,LocalDate today){
        if(entries==null || entries.size()<7) return "سجّلي مزاجكِ في أيام مختلفة أولًا. نحتاج سبعة تسجيلات على الأقل قبل عرض أي نمط.";
        double overall=entries.stream().mapToInt(e->e.mood).average().orElse(3.0);
        if(lastPeriodStart==null) return basicTrend(entries,overall)+NON_CAUSAL;

        int cycle=Math.max(21,Math.min(45,averageCycleLength));
        int nearCount=0;
        double nearSum=0;
        int otherCount=0;
        double otherSum=0;
        for(Entry entry:entries){
            LocalDate date=entry.localDate();
            long days=ChronoUnit.DAYS.between(lastPeriodStart,date);
            if(days<0) continue;
            int day=(int)(days%cycle)+1;
            boolean nearPeriod=day>=Math.max(1,cycle-5) || day<=2;
            if(nearPeriod){ nearCount++; nearSum+=entry.mood; }
            else { otherCount++; otherSum+=entry.mood; }
        }
        if(nearCount>=3 && otherCount>=4){
            double near=nearSum/nearCount;
            double other=otherSum/otherCount;
            if(near+0.65<other) return "ظهر في سجلاتكِ حتى الآن انخفاض متكرر نسبيًا في المزاج قرب بعض الأيام المتوقعة حول الدورة. اعتبريه ارتباطًا شخصيًا أوليًا فقط؛ استمري بالتسجيل عبر عدة دورات."+NON_CAUSAL;
            if(near>other+0.65) return "ظهر في سجلاتكِ حتى الآن مزاج أفضل نسبيًا في بعض الأيام القريبة من موعد الدورة المتوقع. اعتبريه نمطًا أوليًا فقط وراقبي إن كان يتكرر عبر دورات أخرى."+NON_CAUSAL;
        }
        return basicTrend(entries,overall)+" لم يظهر بعد نمط ثابت كافٍ لربط المزاج بتوقيت الدورة."+NON_CAUSAL;
    }

    private static String basicTrend(List<Entry> entries,double overall){
        int n=Math.min(5,entries.size());
        double recent=entries.subList(entries.size()-n,entries.size()).stream().mapToInt(e->e.mood).average().orElse(overall);
        if(recent+0.6<overall) return "متوسط تسجيلاتكِ الأخيرة أقل من متوسطكِ العام قليلًا. راقبي النوم والضغط والطاقة والظروف اليومية بدل افتراض سبب واحد.";
        if(recent>overall+0.6) return "متوسط تسجيلاتكِ الأخيرة أفضل من متوسطكِ العام. سجلي ما كان مختلفًا في هذه الأيام فقد يساعدكِ على فهم ما يدعمكِ.";
        return "تسجيلاتكِ الأخيرة قريبة من متوسطكِ العام. الاستمرار بالتسجيل سيجعل الأنماط أوضح مع الوقت.";
    }
}
