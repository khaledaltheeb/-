import { ImageResponse } from 'next/og';

export const alt = 'منصة روافد — معرفة تقود إلى أثر';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width:'100%',height:'100%',display:'flex',position:'relative',overflow:'hidden',background:'linear-gradient(135deg,#eef9f6 0%,#fffefb 54%,#fff6e6 100%)',color:'#12343b',fontFamily:'Arial, sans-serif' }}>
      <div style={{position:'absolute',width:500,height:500,borderRadius:999,background:'rgba(67,200,177,.12)',top:-250,left:-120}} />
      <div style={{position:'absolute',width:360,height:360,borderRadius:999,border:'1px solid rgba(7,95,97,.12)',bottom:-190,right:-70}} />
      <div style={{display:'flex',flexDirection:'column',justifyContent:'space-between',width:'100%',padding:'68px 78px'}}>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <div style={{width:82,height:82,borderRadius:26,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',background:'linear-gradient(145deg,#0b8580,#063f49)',color:'#fff',fontSize:38,fontWeight:900}}>ر</div>
          <div style={{display:'flex',flexDirection:'column'}}><div style={{fontSize:35,fontWeight:900}}>منصة روافد</div><div style={{fontSize:17,color:'#587278'}}>معرفة تقود إلى أثر</div></div>
        </div>
        <div style={{display:'flex',flexDirection:'column',maxWidth:980}}>
          <div style={{fontSize:58,fontWeight:900,lineHeight:1.3}}>معرفة موثوقة، خدمات مترابطة، وتجربة عربية تحترم الإنسان.</div>
          <div style={{marginTop:24,fontSize:22,lineHeight:1.7,color:'#3d5e65'}}>الصحة النفسية · الأسرة · الدمج والتمكين · الأدلة العملية</div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:18,color:'#557177'}}><span>healthrenewal.org</span><span>RAWAFID</span></div>
      </div>
    </div>,
    size,
  );
}
