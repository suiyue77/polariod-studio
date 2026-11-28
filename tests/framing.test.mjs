import test from 'node:test';
import assert from 'node:assert/strict';
import {cameras,calculate,diagram,parseDistance,zones} from '../src/lib/framing.mjs';
const approx=(a,b,t)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b} (±${t})`);
test('square H/V reference: independently frozen Plan values',()=>{
 for(const [id,h,v,sh,sv,e,w,ht] of [
  ['i2',1.373,1.339,19.67,19.18,38.34,.788,.808],
  ['flip',1.510,1.454,21.64,20.84,41.91,.716,.744],
  ['sx',1.630,1.588,23.35,22.76,45.50,.664,.681]
 ]){
  const p=calculate(id),s=calculate(id,'sony');
  approx(p.horizontal,h,.002);approx(p.vertical,v,.002);approx(s.horizontal,sh,.02);approx(s.vertical,sv,.02);
  approx(p.equivalent,e,.02);approx(p.width,w,.001);approx(p.height,ht,.001);
 }
});
test('native format: horizontal-only match changes, vertical stays, recommended contains film',()=>{
 for(const id of Object.keys(cameras))for(const dev of ['phone','sony']){
  const sq=calculate(id,dev),full=calculate(id,dev,'native');
  assert.ok(full.horizontal>sq.horizontal);approx(full.vertical,sq.vertical,1e-12);
  assert.equal(full.selected,Math.min(full.horizontal,full.vertical));
  assert.equal(calculate(id,dev,'native',1,'horizontal').selected,full.horizontal);
  assert.equal(calculate(id,dev,'native',1,'vertical').selected,full.vertical);
  const d=diagram(full);assert.ok(d.match.width>=d.target.width-1e-9&&d.match.height>=d.target.height-1e-9);
 }
});
test('focus thresholds and Flip half-open zones',()=>{
 for(const [d,idx] of [[.39999,-1],[.4,0],[.76999,0],[.77,1],[1.02999,1],[1.03,2],[1.67999,2],[1.68,3],[Infinity,3]]){
  const r=calculate('flip','phone','square',d);assert.equal(r.focusOK,idx>=0);assert.equal(r.zone??null,idx<0?null:zones[idx]);
 }
 for(const id of ['i2','sx']){const m=cameras[id].min;assert.equal(calculate(id,'phone','square',m-.00001).focusOK,false);assert.equal(calculate(id,'phone','square',m).focusOK,true);}
});
test('units, infinity and invalid inputs',()=>{
 for(const [value,unit,d] of [['26.4','cm',.264],['40','cm',.4],['77','cm',.77],['103','cm',1.03],['168','cm',1.68],['1.2','m',1.2]]) assert.equal(parseDistance(value,unit),d);
 for(const value of ['',0,-1,'NaN','Infinity','1e3','1e9999','abc','1,2','0x10','1000001'])assert.equal(parseDistance(value),null);
 assert.equal(parseDistance('','m',true),Infinity);
 const r=calculate('flip','phone','square',Infinity);assert.equal(r.width,null);assert.equal(r.height,null);assert.ok(Number.isFinite(r.selected));
 for(const d of [0,-1,NaN,undefined,null,'1',1e7])if(d!==undefined)assert.throws(()=>calculate('flip','phone','square',d));
 assert.throws(()=>calculate('bogus'));assert.throws(()=>calculate('flip','bogus'));assert.throws(()=>calculate('flip','phone','bogus'));
});
test('all diagram rectangles within viewBox, finite and centered',()=>{
 for(const id of Object.keys(cameras))for(const dev of ['phone','sony'])for(const a of ['square','native'])for(const m of ['recommended','horizontal','vertical']){
  const r=calculate(id,dev,a,1,m);for(const b of Object.values(diagram(r))){
   assert.ok(Object.values(b).every(Number.isFinite));assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=400&&b.y+b.height<=280);
   approx(b.x+b.width/2,200,1e-9);approx(b.y+b.height/2,140,1e-9);
  }
 }
});
