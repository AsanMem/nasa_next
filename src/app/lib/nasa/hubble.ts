import { HUBBLE_CSV_URL, parseHubbleBirthday, validCalendarDay, type HubbleBirthdayItem } from "../observations/hubble";
import type { NasaResult } from "./api";
export async function fetchHubbleBirthday(month:number,day:number):Promise<NasaResult<HubbleBirthdayItem[]>> {
  if(!validCalendarDay(month,day))return {data:null,outcome:"invalid-data"};
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try {
    // Only the common public dataset goes upstream; no selected date is sent.
    const response=await fetch(HUBBLE_CSV_URL,{headers:{Accept:"text/csv"},next:{revalidate:43200},signal:controller.signal});
    if(!response.ok)return {data:null,outcome:response.status===429?"rate-limit":"unavailable",status:response.status};
    const items=parseHubbleBirthday(await response.text()).filter(item=>item.month===month&&item.day===day).slice(0,5);
    return {data:items,outcome:items.length?"ok":"empty"};
  } catch { return {data:null,outcome:"unavailable"}; }
  finally{clearTimeout(timer);}
}
