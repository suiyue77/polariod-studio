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
 const notes=reader.sections.find(s=>s.title==='精选笔记').items;
 const routes=['/','/learn/',...guideRoutes,'/creators/','/notes/','/permissions/','/gallery/','/404.html'];
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
 assert.equal(await page.locator('header nav a').count(),4);
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


 await page.goto(base+'/notes/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.note-card').count(),notes.length);
 assert.equal(await page.locator('.note-card:visible').count(),notes.length);
 const noteRecords=JSON.parse(fs.readFileSync('src/content/reading-notes.json','utf8'));
 const covers=page.locator('.note-cover');
 assert.equal(await covers.count(),notes.length);
 assert.equal(await page.locator('.note-cover[data-cover-kind="unavailable"]').count(),noteRecords.filter(n=>!n.cover).length);
 assert.equal(await page.locator('.note-cover[data-cover-kind="source"] img').count(),noteRecords.filter(n=>n.cover).length);
 assert.equal(await page.locator('.note-cover svg').count(),0);
 const sourceImages=await page.locator('.note-card').evaluateAll(els=>els.map(e=>({id:e.dataset.noteId,src:e.querySelector('.note-cover img')?.getAttribute('src'),width:Number(e.querySelector('.note-cover img')?.getAttribute('width')),height:Number(e.querySelector('.note-cover img')?.getAttribute('height'))})));
 for(const item of sourceImages){
  const record=noteRecords.find(n=>n.id===item.id);
  assert.equal(item.src,record.cover.src);assert.equal(item.width,record.cover.width);assert.equal(item.height,record.cover.height);
 }
 await page.locator('.note-cover img').evaluateAll(imgs=>Promise.all(imgs.map(async img=>{img.loading='eager';await img.decode();})));
 assert.ok(await page.locator('.note-cover img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth===Number(i.getAttribute('width'))&&i.naturalHeight===Number(i.getAttribute('height'))&&getComputedStyle(i).objectFit==='contain')));

 assert.ok(await covers.evaluateAll(els=>els.every(e=>{const r=e.getBoundingClientRect();return r.width>100&&r.height>60&&e.getAttribute('aria-label')&&e.querySelector('.note-cover-credit')?.textContent?.trim()})));
 assert.deepEqual(await covers.evaluateAll(els=>els.map(e=>e.getAttribute('href'))),notes.map(n=>n.url));
 assert.deepEqual(await page.locator('.note-card h3 a').evaluateAll(els=>els.map(e=>e.getAttribute('href'))),notes.map(n=>n.url));
 assert.deepEqual(await page.locator('.note-card').evaluateAll(els=>els.map(e=>[e.dataset.noteId,e.dataset.linkMode])),notes.map(n=>[n.noteId,n.linkMode]));
 assert.ok(await page.locator('.note-card .note-source').evaluateAll(els=>els.every(e=>{const u=new URL(e.href);return u.hostname==='www.xiaohongshu.com'&&(u.pathname==='/search_result'||(u.searchParams.get('xsec_source')==='pc_share'&&!!u.searchParams.get('xsec_token')))})));

 assert.equal(await page.locator('.notes-grid').first().evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),label==='desktop'?3:1);

 assert.deepEqual(await page.locator('.note-card .note-source').evaluateAll(els=>els.map(e=>e.getAttribute('href'))),notes.map(n=>n.url));
 assert.ok(await page.locator('.note-card .note-search-link').evaluateAll(els=>els.every(e=>{const u=new URL(e.href);return u.hostname==='www.xiaohongshu.com'&&u.pathname==='/search_result'&&!!u.searchParams.get('keyword')&&[...u.searchParams.keys()].join(',')==='keyword'})));
 assert.equal(await page.locator('.notes-topic').count(),4);
 if(process.env.SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,label+'-notes.png')});
 await page.locator('.notes-filter button[data-topic="light"]').click();
 assert.ok(await page.locator('.note-card:visible').count()>0);
 assert.ok(await page.locator('.note-card:visible').evaluateAll(els=>els.every(e=>e.dataset.category==='light')));
 await page.locator('.notes-filter button[data-topic="all"]').click();
 await page.locator('#note-search').fill('Lightme');
 assert.ok(await page.locator('.note-card:visible').count()>0);
 assert.ok(await page.locator('.note-card:visible').evaluateAll(els=>els.every(e=>e.dataset.search.toLowerCase().includes('lightme'))));
 await page.locator('#note-search').fill('zz_nonexistent_000');
 assert.equal(await page.locator('.note-card:visible').count(),0);
 assert.ok(await page.locator('.notes-empty').isVisible());
 await page.locator('#note-search').fill('');
 assert.equal(await page.locator('.note-card:visible').count(),notes.length);
 await page.locator('footer a[href="/permissions/"]').click();
 assert.ok(page.url().endsWith('/permissions/'));
 assert.ok((await page.locator('h1').innerText()).includes('内容使用许可'));
 assert.ok((await page.locator('article').innerText()).includes('不向其他网站'));
 if(process.env.SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,label+'-permissions.png')});

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
   assert.equal(await page.locator('.article-body a[href^="/notes/#note-"],.article-body a[href^="https://www.xiaohongshu.com/search_result?keyword="]').count(),4);
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
 await page.goto(base+'/learn/',{waitUntil:'networkidle'});
 await page.locator('.guide-card[href="/learn/framing-viewfinder/"]').click();
 assert.ok(page.url().endsWith('/learn/framing-viewfinder/'));
 const fv=page.locator('[data-framing-viewfinder]');
 const val=k=>fv.locator('[data-fv-'+k+']');
 await fv.locator('[data-fv-controls]:not([disabled])').waitFor();
 assert.equal(await val('selected').innerText(),'1.48');
 assert.equal(await val('aspect').inputValue(),'square');
 const initialWidth=await fv.locator('[data-fv-box="target"]').getAttribute('width');
 await fv.getByText('I-2',{exact:true}).click();
 assert.equal(await val('selected').innerText(),'1.36');
 assert.notEqual(await fv.locator('[data-fv-box="target"]').getAttribute('width'),initialWidth);
 await fv.getByText('SX-70',{exact:true}).click();
 assert.equal(await val('selected').innerText(),'1.61');
 await val('device').selectOption('sony');
 assert.equal(await val('selected').innerText(),'23.05');
 await val('aspect').selectOption('native');
 assert.equal(await val('selected').innerText(),'22.76');
 assert.ok(await val('match-note').innerText().then(x=>x.includes('矩形')));
 await val('match').selectOption('horizontal');
 assert.equal(await val('selected').innerText(),'35.10');
 await val('unit').selectOption('cm');
 assert.equal(await val('distance').inputValue(),'100');
 await val('distance').fill('26.3');
 assert.ok((await val('focus').innerText()).includes('太近'));
 await val('distance').fill('26.4');
 assert.ok((await val('focus').innerText()).includes('标称'));
 await fv.getByText('Flip',{exact:true}).click();
 for(const [d,word] of [['39.9','太近'],['40','特写'],['77','近景'],['103','中景'],['168','远景']]){
  await val('distance').fill(d);assert.ok((await val('focus').innerText()).includes(word),d);
 }
 await val('distance').fill('bad');
 assert.ok(await val('error').isVisible());assert.ok(!(await val('results').isVisible()));
 await val('far').check();assert.ok((await val('size').innerText()).includes('无限远'));assert.ok(await val('distance').isDisabled());
 await val('far').uncheck();await val('distance').fill('100');
 await val('unit').selectOption('m');
 assert.equal(await val('distance').inputValue(),'1');
 await val('device').selectOption('phone');await val('aspect').selectOption('square');await val('match').selectOption('recommended');
 assert.equal(await val('selected').innerText(),'1.48');
 await fv.locator('input[name="fv-camera"][value="flip"]').focus();await page.keyboard.press('ArrowRight');
 assert.equal(await fv.locator('input[name="fv-camera"]:checked').inputValue(),'i2');
 assert.equal(await val('selected').innerText(),'1.36');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
 assert.ok(await page.locator('.article-body a[href="/learn/flip-shooting/"]').isVisible());
 if(process.env.SCREENSHOT_DIR){await fv.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,label+'-framing.png')});}
 console.log(label+': framing controls / mode / threshold / invalid / infinity / keyboard PASS');
 await page.goto(base+'/learn/flip-shooting/',{waitUntil:'networkidle'});
 assert.ok(await page.locator('.article-body a[href="/learn/framing-viewfinder/"]').isVisible());
 const staticContext=await browser.newContext({...opts,javaScriptEnabled:false});
 try{
  const staticPage=await staticContext.newPage();
  await staticPage.goto(base+'/learn/framing-viewfinder/');
  assert.ok(await staticPage.locator('.fv-static').isVisible());
  assert.ok(await staticPage.locator('[data-fv-controls]').isDisabled());
 }finally{await staticContext.close();}

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
