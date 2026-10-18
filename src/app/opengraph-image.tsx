import { ImageResponse } from "next/og";
export const alt="Orbital — explore Earth and beyond";
export const size={width:1200,height:630};
export const contentType="image/png";
export default function OpenGraphImage(){
  return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",padding:"90px",background:"#030609",color:"#f1f4f6",borderBottom:"8px solid #edc18c"}}>
    <div style={{display:"flex",flexDirection:"column",width:"70%"}}><span style={{fontSize:100,letterSpacing:-6}}>Orbital</span><span style={{fontSize:34,color:"#bbc6cf",marginTop:24}}>Our world. And beyond.</span><span style={{fontSize:24,color:"#edc18c",marginTop:48}}>Asteroids · Earth · NASA observations</span></div>
    <svg width="320" height="320" viewBox="0 0 64 64"><circle cx="30" cy="33" r="17" fill="none" stroke="#eef3f5" strokeWidth="4"/><path d="M12 43C-2 55 10 60 33 44C54 29 65 8 51 10C47 10 43 12 39 15" fill="none" stroke="#edc18c" strokeWidth="2.5"/><circle cx="53" cy="17" r="4" fill="#edc18c"/></svg>
  </div>,size);
}
