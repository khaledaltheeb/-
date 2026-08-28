package org.healthrenewal.rawafid;

/** Pure, bounded reading preferences and CSS/JS generation for first-party Rawafid pages. */
public final class ReadingMode {
    private ReadingMode(){}

    public static final int MIN_TEXT_SCALE=85;
    public static final int MAX_TEXT_SCALE=180;
    public static final int MIN_LINE_HEIGHT=120;
    public static final int MAX_LINE_HEIGHT=220;

    public static final class Settings {
        public final int textScale;
        public final int lineHeight;
        public final boolean highContrast;
        public final boolean night;

        public Settings(int textScale,int lineHeight,boolean highContrast,boolean night){
            this.textScale=clamp(textScale,MIN_TEXT_SCALE,MAX_TEXT_SCALE);
            this.lineHeight=clamp(lineHeight,MIN_LINE_HEIGHT,MAX_LINE_HEIGHT);
            this.highContrast=highContrast;
            this.night=night;
        }

        public static Settings defaults(){ return new Settings(100,155,false,false); }
    }

    public static String webScript(Settings input){
        Settings s=input==null?Settings.defaults():input;
        String bg=s.night?"#121817":s.highContrast?"#ffffff":"#fffdfa";
        String fg=s.night?"#f2f5f4":"#18211f";
        String muted=s.night?"#c8d0ce":"#4b5754";
        String link=s.night?"#78d8d2":"#075e5b";
        String border=s.night?"#394441":"#d8e1df";
        return "(function(){"+
                "var id='rawafid-reading-mode-v1';var st=document.getElementById(id);"+
                "if(!st){st=document.createElement('style');st.id=id;document.head.appendChild(st);}"+
                "st.textContent='html,body{background:"+bg+"!important;color:"+fg+"!important;}"+
                "body,main,article{font-size:"+s.textScale+"%!important;}"+
                "p,li,blockquote,dd,dt{line-height:"+(s.lineHeight/100.0)+"!important;}"+
                "p,li,blockquote,dd,dt,h1,h2,h3,h4,h5,h6{color:"+fg+"!important;}"+
                "a{color:"+link+"!important;}"+
                "small,time,.text-muted,[class*=muted]{color:"+muted+"!important;}"+
                "article,main,section,[class*=card]{border-color:"+border+"!important;}"+
                (s.night?"img,video{filter:brightness(.88) contrast(.96);}":"")+
                "';"+
                "document.documentElement.dataset.rawafidReading='1';"+
                "})();";
    }

    private static int clamp(int value,int min,int max){ return Math.max(min,Math.min(max,value)); }
}
