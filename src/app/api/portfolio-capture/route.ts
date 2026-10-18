import { NextRequest,NextResponse } from "next/server";
import { mkdir,writeFile } from "node:fs/promises";
import path from "node:path";
export const runtime="nodejs";
export async function POST(request:NextRequest){
  if(process.env.NODE_ENV!=="development"||request.headers.get("origin")!=="http://127.0.0.1:3100")return new NextResponse(null,{status:404});
  const name=request.nextUrl.searchParams.get("name")??"";
  if(!/^(01-earth-moon|02-asteroid-3d|03-encounter-journey|04-solar-weather)$/.test(name))return new NextResponse(null,{status:400});
  const bytes=Buffer.from(await request.arrayBuffer());if(bytes.length>50_000_000)return new NextResponse(null,{status:413});
  const directory="C:/Users/ameme/Documents/ChatGPT/NASA 2/portfolio-assets-staging/raw/native-videos";await mkdir(directory,{recursive:true});
  await writeFile(path.join(directory,name+".webm"),bytes);
  await writeFile(path.join(directory,name+".json"),JSON.stringify({width:Number(request.headers.get("x-capture-width")),height:Number(request.headers.get("x-capture-height")),durationMs:Number(request.headers.get("x-capture-duration-ms")),capture:"Actual existing WebGL canvas via browser MediaRecorder; scene labels copied from the live DOM; 30 fps stream request, not measured renderer FPS."},null,2));
  return NextResponse.json({saved:true,bytes:bytes.length});
}
