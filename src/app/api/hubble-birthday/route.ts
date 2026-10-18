import { fetchHubbleBirthday } from "../../lib/nasa/hubble";
import { validCalendarDay } from "../../lib/observations/hubble";
const headers={"Cache-Control":"no-store"};
export async function POST(request:Request) {
  try {
    if(Number(request.headers.get("content-length"))>128)return Response.json({outcome:"invalid-data"},{status:400,headers});
    const text=await request.text();if(text.length>128)return Response.json({outcome:"invalid-data"},{status:400,headers});
    let input;try{input=JSON.parse(text);}catch{return Response.json({data:null,outcome:"invalid-data"},{status:400,headers});}
    if(!input||!validCalendarDay(input.month,input.day))return Response.json({data:null,outcome:"invalid-data"},{status:400,headers});
    return Response.json(await fetchHubbleBirthday(input.month,input.day),{headers});
  }catch{return Response.json({data:null,outcome:"unavailable"},{status:503,headers});}
}
