const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname,"..");
const originalRequire = createRequire(path.join(root, "package.json"));
const ts = originalRequire("typescript");
const React = originalRequire("react");
const { renderToStaticMarkup } = originalRequire("react-dom/server");
const cache = new Map();
let catalogQuery="";
function load(relative) {
  const logical = path.resolve(root, relative);
  if (cache.has(logical)) return cache.get(logical);
  const proposed = path.join(__dirname, path.relative(root, logical));
  const source = fs.readFileSync(fs.existsSync(proposed) ? proposed : logical, "utf8");
  const module = { exports: {} };
  cache.set(logical, module.exports);
  const code = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, console, URL, Intl, Date, process,
    require(name) {
      if (name.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
      if (name.endsWith("/scene-provider")) return {useOrbitalScene:()=>({host:{current:null},status:"loading"})};
      if (name === "next/navigation") return {useSearchParams:()=>new URL("https://example.test/asteroids"+catalogQuery).searchParams};
      if (name === "next/link") return { __esModule: true, default: ({ children, prefetch, ...props }) => React.createElement("a", props, children) };
      if (name.startsWith(".") || name.startsWith("@/")) {
        const base = name.startsWith("@/") ? path.join(root, "src", name.slice(2)) : path.resolve(path.dirname(logical), name);
        const file = ["", ".tsx", ".ts"].map(extension => base + extension).find(candidate => fs.existsSync(path.join(__dirname, path.relative(root, candidate))) || fs.existsSync(candidate));
        if (!file) throw Error("Missing import " + name + " in " + logical);
        return load(path.relative(root, file));
      }
      return originalRequire(name);
    }
  }, { filename: logical });
  return module.exports;
}
const render = (file, props) => renderToStaticMarkup(React.createElement(load(file).default, props));
const build = { time: "2026-10-01T12:00:00Z" };
test("asteroid catalog exposes its model immediately and mobile rows link directly to the dated profile",()=>{
 const html=render("src/app/ui/asteroids/asteroid-catalog.tsx",{sourceDate:"2026-10-18",entries:[{asteroid:{id:"2509505",name:"509505 (2007 VL8)",diameter:243,hazardous:false},event:{date:"2026-10-18",body:"Earth",distance:19404413,speed:9.78}}]});
 assert.match(html,/data-visual-id="2509505"/);assert.match(html,/data-reconstruction-id="2509505"/);assert.match(html,/href="\/asteroids\/2509505\/view\?date=2026-10-18"/);assert.match(html,/19\.4M km/);assert.match(html,/Sort asteroids/);assert.match(html,/Find by designation/);assert.doesNotMatch(html,/Preview selected object|Close preview|Near-Earth asteroid|Try an asteroid/);
});
test("compact asteroid rows preserve unknown measurements and the actual encounter body",()=>{
 const html=render("src/app/ui/asteroids/asteroid-catalog.tsx",{sourceDate:"2026-10-18",entries:[{asteroid:{id:"42",name:"Unknown example",diameter:null,hazardous:null},event:{date:"2026-10-18",body:"Mars",distance:null,speed:null}}]});
 assert.match(html,/Distance unknown/);assert.match(html,/from Mars/);assert.match(html,/Unknown/);assert.doesNotMatch(html,/NaN|from Earth|undefined km/);
});
test("largest and fastest catalog sorts place known high measurements first and unknown values last",()=>{
 const entries=[{asteroid:{id:"1",name:"Small fast",diameter:10,hazardous:false},event:{date:"2026-10-18",body:"Earth",distance:1,speed:20}},{asteroid:{id:"2",name:"Large slow",diameter:100,hazardous:false},event:{date:"2026-10-18",body:"Earth",distance:2,speed:5}},{asteroid:{id:"3",name:"Unknown",diameter:null,hazardous:null},event:null}];
 const order=sort=>{catalogQuery=`?sort=${sort}`;const html=render("src/app/ui/asteroids/asteroid-catalog.tsx",{sourceDate:"2026-10-18",entries});return [...html.matchAll(/class="mobileAsteroidRow" href="\/asteroids\/(\d+)\/view/g)].map(match=>match[1]);};
 try{assert.deepEqual(order("speed"),["1","2","3"]);assert.deepEqual(order("diameter"),["2","1","3"]);assert.deepEqual(order("distance"),["1","2","3"]);}finally{catalogQuery="";}
});
test("birthday opens the real sky builder with full birth date, local clock and city",()=>{
 const html=render("src/app/ui/day/birthday-hub.tsx",{});
 assert.match(html,/My birth sky/);assert.match(html,/NASA by date/);assert.match(html,/Hubble photos/);assert.match(html,/Birth city/);assert.match(html,/Hour/);assert.match(html,/Minute/);assert.match(html,/Create my sky/);assert.match(html,/City search sends only the city name/);assert.doesNotMatch(html,/Same day, other years|APOD · exact|Hubble · day/);
});
test("birthday poster preserves real image years and source credits without inventing a birth-sky map",()=>{
 const html=render("src/app/ui/day/birthday-poster.tsx",{month:2,day:29,birthYear:"1980",items:[{id:"one",title:"Example nebula",month:2,day:29,year:2004,imageUrl:"https://science.nasa.gov/a.jpg",sourceUrl:"https://science.nasa.gov/a",description:"Real description"}]});
 assert.match(html,/February 29/);assert.match(html,/1980/);assert.match(html,/Observed Feb 29, 2004/);assert.match(html,/NASA source &amp; credits/);assert.match(html,/not a reconstruction/);assert.match(html,/Print poster/);assert.doesNotMatch(html,/Observed.*1980|Image credit: NASA/);
});
test("Wikipedia thumbnails are rendered when supplied, while text-only articles remain usable",()=>{
 const html=render("src/app/ui/wiki/wiki-sidebar.tsx",{articles:[{id:1,title:"Moon",extract:"Our satellite",url:"https://en.wikipedia.org/?curid=1",thumbnailUrl:"https://upload.wikimedia.org/moon.jpg"},{id:2,title:"Orbit",extract:"An orbit",url:"https://en.wikipedia.org/?curid=2"}]});
 assert.match(html,/src="https:\/\/upload.wikimedia.org\/moon.jpg"/);assert.match(html,/Our satellite/);assert.match(html,/Orbit/);assert.equal((html.match(/<img/g)||[]).length,1);
});
test("APOD local fallback is labelled illustrative and does not present its placeholder date as a current observation", () => {
  const html = render("src/app/ui/day/day-client.tsx", { build, photoData: { title: "Fallback", date: "2024-01-01", media_type: "image", url: "/media/main/1.optimized.webp" } });
  assert.match(html, /Illustrative archive image/);
  assert.doesNotMatch(html, /2024-01-01/);
  assert.doesNotMatch(html, /View full image/);
});
test("APOD keeps the source publication date, credit and full-image control", () => {
  const html = render("src/app/ui/day/day-client.tsx", { build, photoData: { title: "A nebula", date: "2026-09-29", copyright: "NASA / ESA", media_type: "image", url: "https://example.test/nebula.jpg", explanation: "An observation." } });
  assert.match(html, /2026-09-29/); assert.match(html, /NASA \/ ESA/); assert.match(html, /Enlarge image: A nebula/);
  assert.match(html, /About this observation/); assert.doesNotMatch(html, /View full image|Original media/);
});
test("unsupported video providers retain an original-source link rather than an unusable embed", () => {
  const html = render("src/app/ui/day/day-client.tsx", { build, photoData: { title: "A film", media_type: "video", url: "https://example.test/watch" } });
  assert.doesNotMatch(html, /<iframe/); assert.match(html, /https:\/\/example.test\/watch/);
});
test("Earth events without coordinates remain accessible in the report list", () => {
  const html = render("src/app/ui/eonet/earth-events.tsx", { events: [{ id: "unknown", title: "Reported storm", categories: [{ id: 1, title: "Storms" }], sources: [{ id: "source", url: "https://example.test/report" }] }] });
  assert.match(html, /Reported storm/); assert.match(html, /Coordinates not supplied/); assert.match(html, /https:\/\/example.test\/report/);
});
test("EPIC missing media does not create a broken image or looping sequence", () => {
  const html = render("src/app/ui/main/image-component.tsx", { images: [{ caption: "Missing" }] });
  assert.match(html, /No Earth observations/); assert.doesNotMatch(html, /<img/);
});
test("archive images expose a real keyboard button and sanitize NASA descriptions", () => {
  const html = render("src/app/ui/gallery/card-topic.tsx", { topic: { links: [{ href: "https://example.test/photo.jpg" }], data: [{ title: "Moon", description: "<b>Surface</b><script>bad()</script>" }] } });
  assert.match(html, /<button[^>]+aria-haspopup="dialog"/); assert.match(html, /Surface/); assert.doesNotMatch(html, /bad\(\)|<script|<b>/);
});

test('EPIC fallback hides its artificial date and cannot autoplay',()=>{
 const html=render('src/app/ui/main/image-component.tsx',{images:[{identifier:'local-epic-fallback',date:'2024-01-01 00:00:00',imageUrl:'/media/main/1.optimized.webp'}]});
 assert.match(html,/Illustrative local image/);assert.doesNotMatch(html,/Observed 1 Jan 2024/);assert.match(html,/disabled=""[^>]*aria-pressed="false"/);
});

test('upstream NASA site logo is never presented as an astronomical observation',()=>{
 const html=render('src/app/ui/day/day-client.tsx',{build,photoData:{title:'NASA Science',date:'2026-10-01',media_type:'image',url:'https://science.nasa.gov/wp-content/themes/nasa-child/assets/images/nasa-logo@2x.png',explanation:'A Moon photograph'}});
 assert.match(html,/Illustrative archive image/);assert.doesNotMatch(html,/NASA publication|A Moon photograph|nasa-logo@2x/);
});


test('optional YouTube and Vimeo embeds make no iframe request before an explicit action',()=>{
 for(const url of ['https://www.youtube.com/watch?v=abcdefghijk','https://player.vimeo.com/video/123']) {
 const html=render('src/app/ui/day/day-client.tsx',{build,photoData:{title:'Film',media_type:'video',url}});
 assert.doesNotMatch(html,/<iframe/);assert.match(html,/Play (YouTube|Vimeo) video/);assert.match(html,/provider receives your IP address/);assert.match(html,/Watch on (YouTube|Vimeo)/);
 }
});
