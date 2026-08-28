package org.healthrenewal.rawafid;

import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Fetches public, non-sensitive UI configuration from the Rawafid website. */
public final class MobileManifestClient {
    public static final String ENDPOINT="https://healthrenewal.org/api/mobile/app-manifest?appVersion=1";

    private MobileManifestClient(){}

    public static Manifest fetch() throws Exception {
        HttpURLConnection con=(HttpURLConnection)new URL(ENDPOINT).openConnection();
        con.setConnectTimeout(7000);
        con.setReadTimeout(10000);
        con.setInstanceFollowRedirects(true);
        con.setRequestProperty("Accept","application/json");
        con.setRequestProperty("User-Agent","RawafidAndroid/1.0 (+https://healthrenewal.org)");
        int code=con.getResponseCode();
        if(code<200||code>=300){ con.disconnect(); throw new IllegalStateException("HTTP "+code); }
        StringBuilder body=new StringBuilder();
        try(BufferedReader r=new BufferedReader(new InputStreamReader(con.getInputStream(),StandardCharsets.UTF_8))){
            String line; while((line=r.readLine())!=null) body.append(line);
        } finally { con.disconnect(); }
        return parse(body.toString());
    }

    static Manifest parse(String raw) throws Exception {
        JSONObject root=new JSONObject(raw);
        if(!root.optBoolean("ok",false)) throw new IllegalArgumentException("Manifest unavailable");
        JSONObject manifest=root.optJSONObject("manifest");
        if(manifest==null) throw new IllegalArgumentException("Missing manifest");

        JSONObject brand=manifest.optJSONObject("brand");
        String title=brand==null?"روافد":clean(brand.optString("title","روافد"),80);
        String subtitle=brand==null?"":clean(brand.optString("subtitle",""),180);

        ArrayList<Link> discover=new ArrayList<>();
        ArrayList<String> toolOrder=new ArrayList<>();
        JSONArray sections=manifest.optJSONArray("sections");
        if(sections!=null){
            for(int i=0;i<sections.length();i++){
                JSONObject section=sections.optJSONObject(i); if(section==null) continue;
                String id=section.optString("id","");
                if("discover".equals(id)){
                    JSONArray links=section.optJSONArray("links");
                    if(links!=null){
                        for(int j=0;j<links.length();j++){
                            JSONObject link=links.optJSONObject(j); if(link==null) continue;
                            String linkTitle=clean(link.optString("title",""),100);
                            String path=clean(link.optString("path",""),240);
                            if(!linkTitle.isEmpty()&&path.startsWith("/")&&!path.startsWith("//")) discover.add(new Link(linkTitle,path));
                        }
                    }
                } else if("tools".equals(id)){
                    JSONArray ids=section.optJSONArray("tool_ids");
                    if(ids!=null) for(int j=0;j<ids.length();j++){ String value=ids.optString(j,"").trim(); if(value.matches("[a-z0-9_]{2,64}")) toolOrder.add(value); }
                }
            }
        }

        Map<String,Tool> toolsById=new HashMap<>();
        JSONArray tools=root.optJSONArray("tools");
        if(tools!=null){
            for(int i=0;i<tools.length();i++){
                JSONObject item=tools.optJSONObject(i); if(item==null) continue;
                String id=clean(item.optString("id",""),64);
                String name=clean(item.optString("name",""),100);
                String description=clean(item.optString("description",""),300);
                String kind=clean(item.optString("kind",""),20);
                String nativeRoute=clean(item.optString("nativeRoute",""),80);
                String webPath=clean(item.optString("webPath",""),240);
                if(!id.matches("[a-z0-9_]{2,64}")||name.isEmpty()) continue;
                if(!webPath.isEmpty()&&(!webPath.startsWith("/")||webPath.startsWith("//"))) webPath="";
                toolsById.put(id,new Tool(id,name,description,kind,nativeRoute,webPath));
            }
        }

        ArrayList<Tool> orderedTools=new ArrayList<>();
        for(String id:toolOrder){ Tool tool=toolsById.get(id); if(tool!=null) orderedTools.add(tool); }
        return new Manifest(title,subtitle,discover,orderedTools);
    }

    private static String clean(String value,int max){
        String v=value==null?"":value.trim();
        return v.length()>max?v.substring(0,max):v;
    }

    public static final class Manifest {
        public final String title;
        public final String subtitle;
        public final List<Link> discoverLinks;
        public final List<Tool> tools;
        Manifest(String title,String subtitle,List<Link> discoverLinks,List<Tool> tools){
            this.title=title;
            this.subtitle=subtitle;
            this.discoverLinks=Collections.unmodifiableList(new ArrayList<>(discoverLinks));
            this.tools=Collections.unmodifiableList(new ArrayList<>(tools));
        }
    }

    public static final class Link {
        public final String title;
        public final String path;
        Link(String title,String path){ this.title=title; this.path=path; }
    }

    public static final class Tool {
        public final String id;
        public final String name;
        public final String description;
        public final String kind;
        public final String nativeRoute;
        public final String webPath;
        Tool(String id,String name,String description,String kind,String nativeRoute,String webPath){
            this.id=id; this.name=name; this.description=description; this.kind=kind; this.nativeRoute=nativeRoute; this.webPath=webPath;
        }
    }
}
