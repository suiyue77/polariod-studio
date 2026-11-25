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
 const routes=['/','/learn/','/learn/first-frame/','/learn/protect-from-light/','/learn/photo-notes/','/creators/','/gallery/','/404.html'];
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
 assert.equal(await page.locator('nav a').count(),3);
 n++;
 }
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
 console.log(label+': 8 routes, no overflow or broken images, gallery filter/open/close PASS');
 await context.close();
 }
 console.log('Total rendered route checks:',n);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exit(1);});
