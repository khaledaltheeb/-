import { ImageResponse } from 'next/og';

export const ADDICTION_OG_SIZE = { width: 1200, height: 675 } as const;
const ARABIC_TEXT = /[\u0600-\u06ff]/;

export function addictionOgImage(title: string) {
  const candidate = ARABIC_TEXT.test(title) ? 'Addiction and recovery guidance' : title;
  const safeTitle = candidate.length > 110 ? `${candidate.slice(0, 107).trim()}…` : candidate;
  return new ImageResponse((
    <div style={{width:'100%',height:'100%',display:'flex',position:'relative',overflow:'hidden',background:'linear-gradient(135deg,#fffaf3 0%,#ffffff 50%,#eefaf8 100%)',color:'#183d40',fontFamily:'Arial, sans-serif'}}>
      <div style={{position:'absolute',width:470,height:470,borderRadius:999,left:-125,top:-165,background:'radial-gradient(circle,#efb35a 0%,#df7f45 40%,#a84b36 66%,rgba(168,75,54,0) 68%)',opacity:.88}} />
      <div style={{position:'absolute',width:330,height:330,borderRadius:999,left:110,bottom:-160,border:'40px solid rgba(38,151,139,.22)'}} />
      <div style={{width:'100%',padding:'76px 82px',display:'flex',flexDirection:'column',justifyContent:'space-between',zIndex:2}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',width:830}}>
          <div style={{display:'flex',padding:'10px 18px',borderRadius:999,background:'#fff0df',color:'#963f2e',fontSize:23,fontWeight:800}}>Addiction &amp; Recovery · RAWAFID</div>
          <div style={{display:'flex',marginTop:30,fontSize:safeTitle.length>72?48:58,lineHeight:1.42,fontWeight:900,letterSpacing:-1,maxWidth:860}}>{safeTitle}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}><div style={{width:54,height:54,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0f8f88,#3ec7ad)',color:'#fff',fontWeight:900,fontSize:30}}>R</div><div style={{display:'flex',flexDirection:'column'}}><div style={{display:'flex',fontSize:25,fontWeight:900}}>RAWAFID</div><div style={{display:'flex',fontSize:17,color:'#657d82'}}>Safety · Evidence-based care · Functional recovery</div></div></div>
      </div>
    </div>
  ), ADDICTION_OG_SIZE);
}
