import type { Metadata } from "next";
export function siteOrigin(value=process.env.NEXT_PUBLIC_SITE_URL) {
  const url=new URL(value||"https://nasa-odisey.web.app");
  if(url.protocol!=="https:"&&!(url.protocol==="http:"&&["localhost","127.0.0.1"].includes(url.hostname)))throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTPS site URL");
  if(url.username||url.password)throw new Error("The public site URL must not include credentials");
  return url.origin;
}
export const site={name:"Orbital",origin:siteOrigin(),author:"Asan Memetov",email:"amemetoff.it@gmail.com"};
export function pageMetadata(path:string,title:string,description:string):Metadata {
  const url=new URL(path,site.origin).href;
  return {title,description,metadataBase:new URL(site.origin),alternates:{canonical:url},authors:[{name:site.author}],
    openGraph:{type:"website",title,description,url,siteName:site.name,locale:"en_US",images:[{url:`${site.origin}/opengraph-image`,width:1200,height:630,alt:"Orbital — explore Earth and beyond"}]},
    twitter:{card:"summary_large_image",title,description,images:[`${site.origin}/opengraph-image`]}};
}
export const publicPages=["/","/asteroids","/day","/eonet","/space-weather","/gallery","/video","/epic","/library","/birthday","/learn","/publics","/techport","/techtransfer"];
