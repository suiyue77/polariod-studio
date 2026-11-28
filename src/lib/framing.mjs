// Public manufacturer specifications and explicitly labelled geometric estimates.
export const film = Object.freeze({ width:77, height:79, source:'https://www.polaroid.com/en_us/products/color-sx70-instant-film' });
export const sources = Object.freeze({
 flip:'https://support.polaroid.com/hc/en-us/article_attachments/26051119261458',
 flipProduct:'https://www.polaroid.com/en_us/products/flip-polaroid-camera',
 i2:'https://www.polaroid.com/en_us/products/i2-polaroid-camera',
 i2Manual:'https://support.polaroid.com/hc/en-us/article_attachments/13261628947090',
 sx:'https://support.polaroid.com/hc/en-us/article_attachments/360003014647/Polaroid_SX-70_Sonar_-_User_Manual.pdf',
 sxSeries:'https://support.polaroid.com/hc/en-us/articles/115012463268-Polaroid-SX-70-series-cameras',
 phone:'https://support.apple.com/en-asia/148591',
 phoneMode:'https://support.apple.com/guide/iphone/use-camera-tools-iph3dc593597/ios',
 sony:'https://www.sony.com/electronics/support/e-mount-body/ilce-6700/specifications'
});
const deg = r=>r*180/Math.PI;
export const cameras = Object.freeze({
 flip:{name:'Flip',min:0.4,h:39.4,v:40.8,focus:'四区声呐自动对焦',basis:'官方 H/V',source:sources.flip},
 i2:{name:'I-2',min:0.4,h:43,v:44,focal:98,focus:'连续自动对焦',basis:'官方 H/V',source:sources.i2},
 sx:{name:'SX-70',min:0.264,h:deg(2*Math.atan(film.width/232)),v:deg(2*Math.atan(film.height/232)),focal:116,focus:'折叠式 SLR，手动 / Sonar',basis:'远距计算（116 mm）',source:sources.sx}
});
export const zones = Object.freeze([
 {label:'特写',min:.4,max:.77,best:.65,focal:94.17},
 {label:'近景',min:.77,max:1.03,best:.85,focal:97.75},
 {label:'中景',min:1.03,max:1.68,best:1.2,focal:101.4},
 {label:'远景',min:1.68,max:Infinity,best:2.5,focal:106.99}
]);
const ffDiagonal=Math.hypot(36,24);
export const devices=Object.freeze({
 phone:{name:'iPhone 18 Pro Max',w:.8*ffDiagonal,h:.6*ffDiagonal,base:24,unit:'×',full:'4:3',source:sources.phone},
 sony:{name:'Sony α6700',w:23.3,h:15.5,base:16,unit:'mm',full:'3:2',source:sources.sony}
});
export function parseDistance(value,unit='m',far=false){
 if(!['m','cm'].includes(unit)) return null;
 if(far===true) return Infinity;
 if(typeof value!=='string' && typeof value!=='number') return null;
 const str=String(value).trim();
 if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(str)) return null;
 const meters=Number(str)/(unit==='cm'?100:1);
 return Number.isFinite(meters)&&meters>0&&meters<=1e6?meters:null;
}
export function calculate(cameraId='flip',deviceId='phone',aspect='square',distance=1,match='recommended'){
 if(!Object.hasOwn(cameras,cameraId)||!Object.hasOwn(devices,deviceId)||!['square','native'].includes(aspect)||!['recommended','horizontal','vertical'].includes(match)) throw new RangeError('Unknown model or mode');
 if(!(distance===Infinity || (Number.isFinite(distance)&&distance>0&&distance<=1e6))) throw new RangeError('Invalid distance');
 const camera=cameras[cameraId], device=devices[deviceId];
 const tx=Math.tan(camera.h*Math.PI/360),ty=Math.tan(camera.v*Math.PI/360);
 const w=aspect==='square'?device.h:device.w,h=device.h;
 const fx=w/(2*tx),fy=h/(2*ty);
 const compromise=Math.sqrt(fx*fy);
 const recommended=aspect==='square'?compromise:Math.min(fx,fy);
 const f=match==='horizontal'?fx:match==='vertical'?fy:recommended;
 const factor=deviceId==='phone'?device.base:1;
 const zone=cameraId==='flip'&&distance>=camera.min?zones.find(z=>distance>=z.min&&(distance<z.max||z.max===Infinity)):null;
 return {camera,device,tx,ty,frameW:w,frameH:h,focal:f, horizontal:fx/factor,vertical:fy/factor,
  selected:f/factor,recommended:recommended/factor,equivalent:ffDiagonal/(2*Math.hypot(tx,ty)),
  width:distance===Infinity?null:2*distance*tx,height:distance===Infinity?null:2*distance*ty,
  focusOK:distance>=camera.min,zone,far:distance===Infinity,
  nearWarning:cameraId==='flip'&&distance<1.2?'Flip：近于 1.2 m，按手册稍向左上方修正光学取景。':cameraId==='i2'&&distance<8?'I-2：近于 8 m，参考取景器中的近摄框线，先锁定对焦再调整构图。':cameraId==='sx'?'SX-70 为通过镜头取景的折叠式 SLR；近摄视角仍可能变化。':''};
}
// A single coordinate space at the reference camera's base focal setting.
// Include all frames (even a calculated focal shorter than the reference setting).
export function diagram(result){
 const r=result, baseX=r.frameW/(2*r.device.base),baseY=r.frameH/(2*r.device.base);
 const matchX=r.frameW/(2*r.focal),matchY=r.frameH/(2*r.focal);
 const k=Math.min(172/Math.max(baseX,matchX,r.tx),122/Math.max(baseY,matchY,r.ty));
 const rect=(x,y)=>({x:200-k*x,y:140-k*y,width:2*k*x,height:2*k*y});
 return {base:rect(baseX,baseY),target:rect(r.tx,r.ty),match:rect(matchX,matchY)};
}
