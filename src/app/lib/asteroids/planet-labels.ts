export type PlanetLabel={id:string;x:number;y:number;visible:boolean};
type Box={left:number;right:number;top:number;bottom:number};
export type LabelLayout={order:number[];boxes:Box[]};
export const labelLayout=():LabelLayout=>({order:[],boxes:[]});
const offsets=[[0,10],[0,-28],[0,40],[76,10],[-76,10]];
/** Moves only HTML annotations. Physical positions never enter this layout pass. */
export function declutterPlanetLabels(points:PlanetLabel[],width:number,height:number,selected:string,work:LabelLayout){
  if(!(width>0&&height>0)){for(const point of points)point.visible=false;return;}
  const priority=(id:string)=>id==="Asteroid"?0:id.toLowerCase()===selected.toLowerCase()?1:id==="Sun"?2:id==="Jupiter"?3:4;
  work.order.length=0;for(let i=0;i<points.length;i++)if(points[i].visible)work.order.push(i);
  work.order.sort((a,b)=>priority(points[a].id)-priority(points[b].id)||a-b);
  let used=0;
  for(const index of work.order){
    const point=points[index],x=point.x*width/100,y=point.y*height/100,w=Math.min(140,point.id.length*7+10),h=21,limit=priority(point.id)<4?offsets.length:2;
    point.visible=false;
    for(let candidate=0;candidate<limit;candidate++){
      const cx=x+offsets[candidate][0],top=y+offsets[candidate][1],left=cx-w/2,right=cx+w/2,bottom=top+h;
      if(left<4||right>width-4||top<4||bottom>height-4||left<Math.min(width,330)&&top<110)continue;
      let collides=false;for(let j=0;j<used;j++){const box=work.boxes[j];if(left<box.right+5&&right>box.left-5&&top<box.bottom+4&&bottom>box.top-4){collides=true;break;}}
      if(collides)continue;
      const box=work.boxes[used]??(work.boxes[used]={left:0,right:0,top:0,bottom:0});box.left=left;box.right=right;box.top=top;box.bottom=bottom;used++;
      point.x=cx/width*100;point.y=top/height*100;point.visible=true;break;
    }
  }
}
