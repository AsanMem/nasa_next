import type { DonkiNotificationItem } from '../nasa/donki';
import type { EonetEvent } from '../nasa/eonet';
import type { NeoFeedItem } from '../nasa/neows';
import { latestObservation } from './geography';
import { sourceTime } from './dates';
export type JournalEntry = {
 id:string; source:'DONKI'|'EONET'|'NeoWS'; kind:'publication'|'observation'|'encounter';
 sourceDate:string|null; title:string; summary?:string; href:string; sourceUrl?:string;
};
export function orderJournal(entries:JournalEntry[], ascending=false) {
 const seen=new Set<string>();
 return [...entries].sort((a,b)=>{const x=sourceTime(a.sourceDate),y=sourceTime(b.sourceDate);return x===null?y===null?0:1:y===null?-1:ascending?x-y:y-x;})
 .filter(item=>{const key=item.source+':'+item.id+':'+item.sourceDate; if(seen.has(key))return false;seen.add(key);return true;});
}
export function buildJournal(donki:DonkiNotificationItem[],events:EonetEvent[],neos:NeoFeedItem[],now=Date.now()) {
 const news:JournalEntry[]=donki.filter(item=>!item.isFallback).map(item=>({id:item.messageID||item.messageURL||item.messageTitle||'unknown',source:'DONKI',kind:'publication',sourceDate:sourceTime(item.messageIssueTime)===null?null:item.messageIssueTime!,title:item.messageTitle||item.messageType||'Space weather bulletin',summary:item.messageBody,href:'/space-weather',sourceUrl:item.messageURL}));
 const observations:JournalEntry[]=events.map(event=>({id:event.id,source:'EONET',kind:'observation',sourceDate:latestObservation(event)?.geometry.date||null,title:event.title,summary:event.categories?.map(item=>item.title).join(', '),href:'/eonet',sourceUrl:event.sources?.[0]?.url||event.link}));
 const encounters:JournalEntry[]=neos.map(neo=>({id:neo.id,source:'NeoWS',kind:'encounter',sourceDate:neo.approachDate||null,title:neo.name,summary:neo.summary,href:'/asteroids',sourceUrl:neo.url}));
 return {news:orderJournal(news),observations:orderJournal(observations),upcoming:orderJournal(encounters.filter(item=>(sourceTime(item.sourceDate)??-Infinity)>=Math.floor(now/86400000)*86400000),true),past:orderJournal(encounters.filter(item=>(sourceTime(item.sourceDate)??-Infinity)<Math.floor(now/86400000)*86400000))};
}
