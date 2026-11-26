import assert from 'node:assert/strict';
import fs from 'node:fs';
const root='dist/';
const j=JSON.parse(fs.readFileSync(root+'agent/site.json','utf8'));
const html=fs.readFileSync(root+'agent/index.html','utf8');
const llms=fs.readFileSync(root+'llms.txt','utf8');
assert.equal(j.home,"https://polariod-studio.vercel.app/");
assert.equal(j.title,"Polariod Studio");
assert.ok(j.sections.length>=3 && j.limitations.length>0);
assert.ok(html.includes('Agent Reader') && html.includes(j.title) && html.includes(j.source));
assert.ok(llms.includes(j.home+'agent/') && llms.includes(j.home+'agent/site.json'));
for(const section of j.sections){assert.ok(section.title&&section.description&&section.url.startsWith(j.home));assert.ok(Array.isArray(section.items));for(const item of section.items){assert.ok(item.title&&item.description&&/^https:\/\//.test(item.url));}}
assert.equal(j.sections.length,4);assert.ok(j.sections[0].items.length>0);
const approved=JSON.parse(fs.readFileSync('src/content/creators.json','utf8')).filter(c=>c.approved);
assert.deepEqual(j.sections[1].items.map(c=>[c.title,c.url,c.description]),approved.map(c=>[c.name,c.url,c.description]));
assert.equal(new Set(approved.map(c=>c.url)).size,approved.length);
for(const c of approved)assert.ok(!new URL(c.url).search&&!new URL(c.url).hash);
for(const c of approved){
 if(!c.avatar)continue;
 assert.match(c.avatar.src,/^\/images\/creators\/[a-z0-9][a-z0-9._-]*\.(webp|png|jpe?g|avif)$/i);
 assert.ok(['owned','licensed'].includes(c.avatar.permission)&&c.avatar.credit);
 assert.ok(fs.existsSync('public'+c.avatar.src),'approved avatar file must exist');
 assert.ok(fs.existsSync(root+c.avatar.src.slice(1)),'approved avatar must be published');
}


const notes=JSON.parse(fs.readFileSync('src/content/reading-notes.json','utf8'));
const section=j.sections.find(s=>s.title==='精选笔记');
assert.ok(section&&section.url===j.home+'notes/'&&section.reference.url===j.home+'permissions/');
assert.equal(notes.length,section.items.length);
assert.equal(new Set(notes.map(n=>n.id)).size,notes.length);
for(const n of notes){
 assert.ok(n.author&&n.title);
 assert.equal(n.url,'https://www.xiaohongshu.com/explore/'+n.id);
 assert.ok(Object.keys(n).every(k=>['id','title','author','category','url','evidence','summary'].includes(k)));
 assert.ok(!n.summary||n.evidence==='body-reviewed');
 const item=section.items.find(i=>i.url===n.url);
 assert.equal(item.title,n.title);assert.ok(item.description.startsWith(n.author+' · '));
}
const permission=fs.readFileSync(root+'permissions/index.html','utf8');
assert.ok(permission.includes('内容使用许可与权利声明')&&permission.includes('非商业')&&permission.includes('不自动延伸'));
assert.ok(fs.readFileSync('CONTENT_PERMISSIONS.md','utf8').includes('不向其他网站'));
assert.ok(llms.includes(j.home+'notes/')&&llms.includes(j.home+'permissions/'));

assert.ok(!/PRIVATE KEY|github_pat_|ghp_[A-Za-z0-9]{25,}/.test(JSON.stringify(j)));
console.log('Reader HTML, JSON, llms.txt, source and boundaries PASS');
