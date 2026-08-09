import { ImageResponse } from 'next/og';
import RawafidMark from '@/components/rawafid-mark';

export const alt = 'منصة روافد — معرفة موثوقة وخدمات مهنية مترابطة';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width:'100%', height:'100%', display:'flex', position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#f7fcfa 0%,#fff8ed 54%,#edf7f5 100%)', color:'#102f36', fontFamily:'Arial, sans-serif' }}>
      <div style={{ position:'absolute', width:420, height:420, borderRadius:999, background:'rgba(8,113,109,.10)', top:-170, left:-70 }} />
      <div style={{ position:'absolute', width:320, height:320, borderRadius:999, background:'rgba(154,106,19,.09)', bottom:-150, right:-60 }} />
      <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-between', width:'100%', padding:'74px 84px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ width:78, height:78, borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(145deg,#075e5d,#0b7772)', color:'#fff' }}><RawafidMark accent="#f4b942" style={{width:54,height:54}} /></div>
          <div style={{ display:'flex', flexDirection:'column' }}><div style={{ fontSize:34, fontWeight:800 }}>RAWAFID</div><div style={{ fontSize:15, color:'#516970', letterSpacing:2 }}>INSTITUTIONAL PLATFORM</div></div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', maxWidth:930 }}>
          <div style={{ fontSize:54, fontWeight:800, lineHeight:1.18 }}>A clearer path to trusted knowledge and professional support.</div>
          <div style={{ marginTop:24, fontSize:22, lineHeight:1.55, color:'#35535a' }}>TRUSTED KNOWLEDGE  •  VERIFIED PROVIDERS  •  ACCESSIBLE SERVICES</div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:17, color:'#49656b' }}><span>healthrenewal.org</span><span>RAWAFID PLATFORM</span></div>
      </div>
    </div>,
    size,
  );
}
