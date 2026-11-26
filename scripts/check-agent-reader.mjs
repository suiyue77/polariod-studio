import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isPublicShareUrl,noteAccess } from '../src/lib/note-links.mjs';
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


// Regression: a bare ID, internal-search token, wrong identity, or tracking/account field
// must never become a direct destination, even if it looks like a share link.
const fixture='https://www.xiaohongshu.com/explore/000000000000000000000001';
const sample=fixture+'?source=webshare&xhsshare=pc_web&xsec_source=pc_share&xsec_token=fixture';
assert.ok(isPublicShareUrl(sample,fixture));
for(const bad of [fixture,sample+'&appuid=fixture',sample.replace('pc_share','pc_search'),sample.replace('000000000000000000000001','000000000000000000000002'),sample.replace('www.xiaohongshu.com','example.com'),sample+'&xsec_token=duplicate']){
 assert.equal(isPublicShareUrl(bad,fixture),false);
 assert.equal(noteAccess({url:fixture,title:'示例',author:'作者',share:{url:bad,source:'platform-share-copy',verification:'logged-in-browser'}}).mode,'search');
}
const notes=JSON.parse(fs.readFileSync('src/content/reading-notes.json','utf8'));
const section=j.sections.find(s=>s.title==='精选笔记');
assert.ok(section&&section.url===j.home+'notes/'&&section.reference.url===j.home+'permissions/');
assert.equal(notes.length,section.items.length);
assert.equal(new Set(notes.map(n=>n.id)).size,notes.length);
for(const n of notes){
 assert.ok(n.author&&n.title);
 assert.equal(n.url,'https://www.xiaohongshu.com/explore/'+n.id);
 assert.ok(Object.keys(n).every(k=>['id','title','author','category','url','evidence','summary','coverTopic','coverMotif','cover','share'].includes(k)));
 assert.ok(!n.summary||n.evidence==='body-reviewed');
 assert.ok(n.coverTopic&&n.coverMotif);
 if(n.cover){
  assert.match(n.cover.src,/^\/images\/notes\/[a-z0-9][a-z0-9._-]*\.(webp|png|jpe?g|avif)$/i);
  assert.ok(['owned','licensed'].includes(n.cover.permission)&&n.cover.credit);
  assert.ok(fs.existsSync('public'+n.cover.src)&&fs.existsSync(root+n.cover.src.slice(1)));
 }

 if(n.share){
  assert.equal(n.share.verification,'logged-in-browser');
  assert.equal(n.share.source,'platform-share-copy');
  assert.match(n.share.verifiedOn,/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(isPublicShareUrl(n.share.url,n.url));
 }
 const item=section.items.find(i=>i.noteId===n.id);
 assert.equal(item.url,noteAccess(n).url);
 assert.equal(item.linkMode,noteAccess(n).mode);
 assert.notEqual(item.url,n.url);
 assert.equal(item.title,n.title);assert.ok(item.description.startsWith(n.author+' · '));
}
const permission=fs.readFileSync(root+'permissions/index.html','utf8');
assert.ok(permission.includes('内容使用许可与权利声明')&&permission.includes('非商业')&&permission.includes('原帖封面')&&permission.includes('帖子内图片与原文')&&permission.includes('重复逐项授权'));
assert.ok(fs.readFileSync('CONTENT_PERMISSIONS.md','utf8').includes('不向其他网站'));
assert.ok(llms.includes(j.home+'notes/')&&llms.includes(j.home+'permissions/'));

assert.ok(!/PRIVATE KEY|github_pat_|ghp_[A-Za-z0-9]{25,}/.test(JSON.stringify(j)));
console.log('Reader HTML, JSON, llms.txt, source and boundaries PASS');
