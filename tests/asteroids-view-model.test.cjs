const { test } = require('node:test');
const assert = require('node:assert/strict');
const { toAsteroid, selectApproach, validDate, measurement, sortCatalog, asteroidHref } = require(process.env.ORBITAL_TEST_MODEL);
const event = (date, distance, speed = '9.2', body = 'Earth') => ({ close_approach_date: date, orbiting_body: body, miss_distance: { kilometers: distance }, relative_velocity: { kilometers_per_second: speed } });
const fixture = (overrides = {}) => ({ id: '3477703', name: '(2009 WQ6)', estimated_diameter: { meters: { estimated_diameter_min: 4.01, estimated_diameter_max: 8.97 } }, close_approach_data: [event('1913-11-18', '18422334', '16'),event('2026-09-21', '55299669'),event('2031-01-03','4000000')], ...overrides });
const { nextEarthEncounter, filterEncounters } = require(process.env.ORBITAL_TEST_MODEL);
test('next return follows the selected event and excludes intervening Venus approaches', () => {
 const data=toAsteroid(fixture({close_approach_data:[event('2031-01-03','4'),event('2027-01-01','3','2','Venus'),event('2026-09-21','2')]}));
 const selected=selectApproach(data.approaches,'2026-09-21','2026-09-21');
 assert.equal(nextEarthEncounter(data.approaches,selected).date,'2031-01-03');
 assert.equal(nextEarthEncounter(data.approaches,data.approaches.at(-1)),null);
 assert.equal(nextEarthEncounter([],null),null);
});
test('history filters use UTC calendar dates and include today in upcoming',()=>{
 const events=toAsteroid(fixture()).approaches;
 assert.deepEqual(filterEncounters(events,'past','2026-09-21').map(e=>e.date),['1913-11-18']);
 assert.deepEqual(filterEncounters(events,'upcoming','2026-09-21').map(e=>e.date),['2026-09-21','2031-01-03']);
 assert.equal(filterEncounters(events,'all','2026-09-21').length,3);
});
test('catalog date selects the 2026 event, never the first 1913 record', () => {
 const asteroid = toAsteroid(fixture()); const actual = selectApproach(asteroid.approaches,'2026-09-21','2026-09-21');
 assert.equal(actual.date,'2026-09-21'); assert.equal(actual.speed,9.2); assert.equal(actual.distance,55299669); assert.equal(actual.lunar,55299669/384400);
});
test('default event chooses upcoming Earth then latest past Earth, independent of source order', () => {
 const asteroid = toAsteroid(fixture({close_approach_data:[event('2030-01-01','1','2','Venus'), event('2027-01-01','2'),event('1913-11-18','3')]}));
 assert.equal(selectApproach(asteroid.approaches,null,'2026-09-21').date,'2027-01-01');
 assert.equal(selectApproach(asteroid.approaches,null,'2035-01-01').date,'2027-01-01');
});
test('valid dates reject impossible dates, arbitrary strings and arrays', () => {
 for (const value of ['2026-02-30','2026-13-01','bad','2026-9-21',['2026-09-21'],null]) assert.equal(validDate(value),false);
 assert.equal(validDate('2024-02-29'),true);
 assert.equal(selectApproach(toAsteroid(fixture()).approaches,'2026-02-30','2026-09-21').date,'2026-09-21');
});
test('missing requested date falls back consistently', () => assert.equal(selectApproach(toAsteroid(fixture()).approaches,'2025-09-21','2026-09-21').date,'2026-09-21'));
test('absent measurements stay unknown, real zero speed is retained', () => {
 for (const value of [null,undefined,'',true,-1,'NaN',Infinity,{},' ']) assert.equal(measurement(value),null);
 assert.equal(measurement('0'),0);
 const asteroid=toAsteroid({id:'1',close_approach_data:[event('2026-09-21',null,0)]});
 assert.equal(asteroid.diameter,null); assert.equal(asteroid.hazardous,null); assert.equal(asteroid.approaches[0].distance,null); assert.equal(asteroid.approaches[0].speed,0);
});
test('diameter midpoint uses full precision, rejects inverted or partial ranges', () => {
 assert.equal(toAsteroid(fixture()).diameter,6.49);
 for (const meters of [{estimated_diameter_min:9,estimated_diameter_max:4},{estimated_diameter_min:4},{estimated_diameter_min:0,estimated_diameter_max:0}]) assert.equal(toAsteroid(fixture({estimated_diameter:{meters}})).diameter,null);
});
test('API failure, empty lists, invalid IDs, undated history have safe outputs', () => {
 assert.equal(toAsteroid(null),null); assert.equal(toAsteroid({id:'bad/id'}),null); assert.equal(selectApproach([],null,'2026-09-21'),null);
 assert.deepEqual(toAsteroid(fixture({close_approach_data:[event('invalid','5')]})).approaches,[]);
 assert.deepEqual(sortCatalog([],'distance'),[]);
});
test('sorts finite distances before unknown, default nearest is correct', () => {
 const entries = [null,20,2].map((distance,index) => ({asteroid:toAsteroid(fixture({id:String(index+1)})), event:{distance,speed:distance}}));
 assert.deepEqual(sortCatalog(entries,'distance').map(item=>item.asteroid.id),['3','2','1']);
 assert.deepEqual(sortCatalog(entries,'speed').map(item=>item.asteroid.id),['3','2','1']);
 assert.equal(entries[0].asteroid.id,'1');
});
test('legacy route shape is retained and valid source date is carried', () => {
 assert.equal(asteroidHref('3477703','2026-09-21'),'/asteroids/3477703/view?date=2026-09-21');
 assert.equal(asteroidHref('3477703','invalid'),'/asteroids/3477703/view');
});
test('non-Earth history is selectable but never mistaken for default Earth approach', () => {
 const asteroid=toAsteroid(fixture({close_approach_data:[event('2026-09-21','5','3','Venus')]}));
 assert.equal(selectApproach(asteroid.approaches,null,'2026-09-21'),null);
 assert.equal(selectApproach(asteroid.approaches,'2026-09-21','2026-09-21').body,'Venus');
});
test('source link accepts only NASA/JPL URLs and upgrades HTTPS', () => {
 assert.equal(toAsteroid(fixture({nasa_jpl_url:'javascript:alert(1)'})).jplUrl,null);
 assert.equal(toAsteroid(fixture({nasa_jpl_url:'https://example.com'})).jplUrl,null);
 assert.equal(toAsteroid(fixture({nasa_jpl_url:'http://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=3477703'})).jplUrl,'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=3477703');
});
