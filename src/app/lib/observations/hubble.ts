export type HubbleBirthdayItem = { id: string; title: string; description: string; month: number; day: number; year: number; imageUrl: string; sourceUrl: string };
export const HUBBLE_CSV_URL="https://science.nasa.gov/specials/apps/what-did-hubble-see-on-your-birthday/data/data.csv?v=2026-06-22_B";
const IMAGE_BASE="https://science.nasa.gov/specials/apps/what-did-hubble-see-on-your-birthday/images/";
export function validCalendarDay(month:unknown,day:unknown):boolean {
  if(!Number.isInteger(month)||!Number.isInteger(day))return false;
  const date=new Date(Date.UTC(2000,Number(month)-1,Number(day)));
  return date.getUTCMonth()===Number(month)-1&&date.getUTCDate()===Number(day);
}
/** RFC-style quoted fields: commas, CRLF, embedded newlines and doubled quotes. */
export function csvRows(csv:string):string[][] {
  if(csv.length>4_000_000)throw new Error("Dataset too large");
  const rows:string[][]=[];let row:string[]=[],field="",quoted=false;
  for(let i=0;i<csv.length;i++) {
    const char=csv[i];
    if(char==='"') { if(quoted&&csv[i+1]==='"'){field+='"';i++;}else quoted=!quoted; }
    else if(char===","&&!quoted){row.push(field);field="";}
    else if((char==="\n"||char==="\r")&&!quoted){if(char==="\r"&&csv[i+1]==="\n")i++;row.push(field);if(row.some(value=>value.trim()))rows.push(row);row=[];field="";}
    else field+=char;
  }
  if(quoted)throw new Error("Incomplete CSV");
  row.push(field);if(row.some(value=>value.trim()))rows.push(row);
  return rows;
}
export function parseHubbleBirthday(csv:string):HubbleBirthdayItem[] {
  const [header,...rows]=csvRows(csv.replace(/^\uFEFF/,""));
  if(!header||!["Date","Year","Image_File","Name","Description","URL"].every(key=>header.includes(key)))throw new Error("Invalid Hubble dataset");
  const index=(key:string)=>header.indexOf(key), result:HubbleBirthdayItem[]=[];
  const seen=new Set<string>();let month=0,day=0;
  for(const fields of rows) {
    const get=(key:string)=>(fields[index(key)]||"").trim();
    if(get("Date")){
      const match=/^(\d{1,2})\/(\d{1,2})\/\d{4}(?:\s|$)/.exec(get("Date"));
      month=match?Number(match[1]):0;day=match?Number(match[2]):0;
    }
    const year=Number(get("Year")),file=get("Image_File"),title=get("Name");
    if(!validCalendarDay(month,day)||!Number.isInteger(year)||year<1990||year>new Date().getUTCFullYear()||!title||!/^[-\w]+\.(jpg|jpeg|png|webp)$/i.test(file))continue;
    let source:URL;try{source=new URL(get("URL"));}catch{continue;}
    if(source.protocol!=="https:"||source.hostname!=="science.nasa.gov")continue;
    const id=`${month}-${day}:${file}`;if(seen.has(id))continue;seen.add(id);
    result.push({id,title,description:get("Description"),month,day,year,imageUrl:IMAGE_BASE+file,sourceUrl:source.href});
  }
  if(!result.length)throw new Error("No valid Hubble observations");
  return result;
}
