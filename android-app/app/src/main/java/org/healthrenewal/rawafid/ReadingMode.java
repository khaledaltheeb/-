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
        String bg=s.night?"#101513":s.highContrast?"#ffffff":"#fffdfa";
        String surface=s.night?"#19211e":"#ffffff";
        String field=s.night?"#202a26":"#ffffff";
        String fg=s.night?"#f7faf9":"#17211e";
        String muted=s.night?"#c9d4d0":"#46534f";
        String link=s.night?"#8ce3dc":"#075e5b";
        String border=s.night?"#52625c":"#cbd9d5";
        String placeholder=s.night?"#aebbb6":"#66736f";
        return "(function(){"+
                "var id='rawafid-reading-mode-v1';var st=document.getElementById(id);"+
                "if(!st){st=document.createElement('style');st.id=id;document.head.appendChild(st);}"+
                "st.textContent='html,body{background:"+bg+"!important;color:"+fg+"!important;}"+
                "body,main,article{font-size:"+s.textScale+"%!important;}"+
                "p,li,blockquote,dd,dt{line-height:"+(s.lineHeight/100.0)+"!important;}"+
                "p,li,blockquote,dd,dt,h1,h2,h3,h4,h5,h6,label,legend{color:"+fg+"!important;}"+
                "a{color:"+link+"!important;text-decoration-color:"+link+"!important;}"+
                "small,time,.text-muted,[class*=muted],[class*=secondary]{color:"+muted+"!important;}"+
                "input,textarea,select{background:"+field+"!important;color:"+fg+"!important;border-color:"+border+"!important;caret-color:"+link+"!important;}"+
                "input::placeholder,textarea::placeholder{color:"+placeholder+"!important;opacity:1!important;}"+
                "article,main,section,[class*=card],[class*=panel],[role=dialog]{border-color:"+border+"!important;}"+
                (s.night?"[class*=card],[class*=panel],[role=dialog]{background-color:"+surface+"!important;}button{border-color:"+border+"!important;}img,video{filter:brightness(.84) contrast(1.02);}":"")+
                "';"+
                "document.documentElement.dataset.rawafidReading='1';"+
                "})();";
    }

    private static int clamp(int value,int min,int max){ return Math.max(min,Math.min(max,value)); }
}
