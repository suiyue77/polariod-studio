const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
 let f=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!f.startsWith(root+path.sep)&&f!==root){res.writeHead(403);res.end();return;}
 if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
 if(!fs.existsSync(f)){res.writeHead(404);res.end('missing');return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
 try{
 const reader=JSON.parse(fs.readFileSync(path.join(root,'agent/site.json'),'utf8'));
 const guideRoutes=reader.sections[0].items.map(g=>new URL(g.url).pathname);
 const creators=reader.sections[1].items;
 const routes=['/','/learn/',...guideRoutes,'/creators/','/gallery/','/404.html'];
 assert.equal(new Set(guideRoutes).size,guideRoutes.length);
 for(const id of ['metering','portrait-light','photo-diagnosis','spot-metering']) assert.ok(guideRoutes.includes('/learn/'+id+'/'));
 let n=0;
 for(const [label,opts] of [['desktop',{viewport:{width:1440,height:900}}],['mobile',{viewport:{width:440,height:956},deviceScaleFactor:3,isMobile:true,hasTouch:true}]]){
 const context=await browser.newContext(opts);
 const page=await context.newPage();
 const failures=[];
 page.on('pageerror',e=>failures.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.status()+' '+r.url());});
 for(const route of routes){
 await page.goto(base+route,{waitUntil:'networkidle'});
 assert.equal(await page.locator('h1').count(),1,label+' '+route+' H1');
 const layout=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,images:[...document.images].map(x=>x.complete&&x.naturalWidth>0),bodyColor:getComputedStyle(document.body).backgroundColor}));
 assert.ok(layout.scroll<=layout.width+1,label+' '+route+' overflow');
 
 await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(async x=>{x.loading='eager';await x.decode();})));
 assert.ok(await page.locator('img').evaluateAll(imgs=>imgs.every(x=>x.complete&&x.naturalWidth>0)),label+' '+route+' broken images');
 assert.equal(layout.bodyColor,'rgb(247, 244, 237)',label+' '+route+' CSS');
 assert.equal(await page.locator('header nav a').count(),3);
 n++;
 }
 await page.goto(base+'/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.guide-card').count(),3);
 assert.ok(await page.locator('.guide-card[href="/learn/metering/"]').isVisible());
 if(creators.length) assert.ok(await page.locator('.creator-summary').innerText().then(t=>t.includes('已收录 '+creators.length+' 位创作者')));
 await page.goto(base+'/creators/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.creator-card').count(),creators.length);
 const columns=await page.locator('.creator-directory').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
 assert.equal(columns,label==='desktop'?3:1);
 if(label==='desktop'&&creators.length===5){
  assert.ok(await page.locator('.creator-card').last().evaluate(el=>el.getBoundingClientRect().bottom<=window.innerHeight),'five creators should fit in the desktop first viewport');
 }

 const creatorLinks=await page.locator('.creator-card a').evaluateAll(els=>els.map(a=>a.getAttribute('href')));
 assert.deepEqual(creatorLinks,creators.map(c=>c.url));
 for(const c of creators) assert.ok(await page.locator('.creator-card h2').allTextContents().then(names=>names.includes(c.title)));
 const approvedCreators=JSON.parse(fs.readFileSync('src/content/creators.json','utf8')).filter(c=>c.approved);
 for(let i=0;i<creators.length;i++){
  const c=creators[i];const card=page.locator('.creator-card').nth(i);
  const a=card.locator('.creator-avatar');
  const geometry=await a.evaluate(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height,radius:getComputedStyle(el).borderTopLeftRadius};});
  assert.equal(geometry.w,56);assert.equal(geometry.h,56);assert.ok(geometry.radius==='50%'||parseFloat(geometry.radius)>=28);
  assert.equal((await a.locator('span').innerText()).trim(),Array.from(c.title.trim())[0]);
  assert.equal(await a.locator('img').count(),approvedCreators[i].avatar?1:0);
  if(approvedCreators[i].avatar){
   const img=a.locator('img');
   assert.equal(await img.getAttribute('src'),approvedCreators[i].avatar.src);
   await img.evaluate(async el=>{el.loading='eager';await el.decode();});
   assert.ok(await img.evaluate(el=>el.complete&&el.naturalWidth>0&&el.naturalHeight>0));
  }

  if(new URL(c.url).hostname.endsWith('xiaohongshu.com'))assert.equal(await card.locator('.creator-platform').innerText(),'小红书');
  const link=card.locator('.creator-link');
  assert.ok((await link.boundingBox()).height>=44);
  assert.ok(await link.getAttribute('aria-label'));
  assert.equal(await link.getAttribute('href'),c.url);
  await link.focus();
  assert.ok(await link.evaluate(el=>document.activeElement===el));
 }
 if(process.env.SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,label+'-creators.png'),fullPage:true});


 await page.goto(base+'/learn/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.guide-topic').count(),3);
 const listed=await page.locator('.guide-card').evaluateAll(els=>els.map(x=>x.getAttribute('href')));
 assert.deepEqual([...listed].sort(),[...guideRoutes].sort());
 await page.locator('.guide-jumps a[href="#shooting"]').click();
 assert.equal(new URL(page.url()).hash,'#shooting');
 for(const id of ['flip-shooting','camera-care','metering','portrait-light','photo-diagnosis','spot-metering']){
  await page.locator('.guide-card[href="/learn/'+id+'/"]').click();
  assert.ok(page.url().endsWith('/learn/'+id+'/'));
  assert.ok(await page.locator('.article-body h2').count()>=5);
  assert.ok(await page.locator('.article-body a[href^="https://support.polaroid.com/"]').count()>=1);
  const toc=page.locator('.article-toc a');
  const headingCount=await page.locator('.article-body h2').count();
  assert.equal(await toc.count(),headingCount);
  assert.ok(await toc.evaluateAll(links=>links.every(a=>document.getElementById(decodeURIComponent(a.hash.slice(1)))?.tagName==='H2')));
  await toc.last().click();
  assert.ok(new URL(page.url()).hash.length>1);
  if(id==='metering'){
   assert.equal(await page.locator('.article-body table').count(),2);
   assert.equal(await page.locator('.article-body img').count(),1);
   assert.ok(await page.locator('.article-body').innerText().then(t=>t.includes('不是最终照片亮度')&&t.includes('尚未在本站进行真实相纸对照试验')));
  }
  if(id==='portrait-light') assert.equal(await page.locator('.article-body img').count(),1);
  if(id==='photo-diagnosis') assert.equal(await page.locator('.article-body table').count(),1);
  if(id==='spot-metering'){
   assert.equal(await page.locator('.article-body table').count(),3);
   assert.equal(await page.locator('.article-body a[href^="https://www.xiaohongshu.com/explore/"]').count(),4);
   assert.ok(await page.locator('.article-body').innerText().then(t=>t.includes('不是 Polaroid 发布的相纸动态范围')&&t.includes('本站目前没有完成这组真实相纸对照')));
  }
  if(process.env.SCREENSHOT_DIR && id==='metering'){
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,label+'-metering-top.png')});
   await page.locator('.article-body table').first().scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,label+'-metering-table.png')});
  }
  await page.getByRole('link',{name:'← 返回教程',exact:true}).click();
  assert.ok(page.url().endsWith('/learn/'));
 }
 if(process.env.SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,label+'-learn.png')});
 await page.goto(base+'/gallery/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.gallery-item:visible').count(),3);
 await page.getByRole('button',{name:'静物',exact:true}).click();
 assert.equal(await page.locator('.gallery-item:visible').count(),1);
 await page.locator('.gallery-item:visible a').click();
 await page.locator('.pswp--open').waitFor({timeout:5000});
 assert.equal(await page.locator('.pswp__img').count()>0,true);
 await page.locator('.pswp--ui-visible').waitFor({timeout:5000});
 await page.locator('.pswp__button--close').click();
 await page.locator('.pswp--open').waitFor({state:'hidden',timeout:5000});
 await page.getByRole('button',{name:'全部',exact:true}).click();
 assert.equal(await page.locator('.gallery-item:visible').count(),3);
 assert.deepEqual(failures,[],label+' browser errors');
 console.log(label+': '+routes.length+' routes, no overflow or broken images, guide grouping/TOC and gallery filter/open/close PASS');
 await context.close();
 }
 console.log('Total rendered route checks:',n);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exit(1);});
