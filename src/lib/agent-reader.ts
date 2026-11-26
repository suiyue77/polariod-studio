import { getCollection } from 'astro:content';
import { readNotes, noteDescription } from './reading-notes';
import { noteAccess } from './note-links.mjs';
export async function readSite(){
 const guides=(await getCollection('guides')).sort((a,b)=>a.data.number-b.data.number);
 const creators=(await getCollection('creators')).filter(c=>c.data.approved);
 const notes=await readNotes();
 const photos=await getCollection('photos');
 const real=photos.filter(p=>p.data.permission!=='sample');
 return {title:'Polariod Studio',description:'独立即时摄影小志。',source:'https://github.com/suiyue77/polariod-studio',home:'https://polariod-studio.vercel.app/',limitations:['非 Polaroid 官方网站。','创作者仅列出经过确认的记录；示例图不是实拍。','个人学习、非商业用途；内容不授予其他网站转载许可。社区笔记仅为公开来源索引，阅读状态不等于事实核验。'],sections:[{title:'教程',url:'https://polariod-studio.vercel.app/learn/',description:'即时摄影入门、显影保养、测光与用光、废片诊断及创作笔记。',items:guides.map(g=>({title:g.data.title,url:new URL('learn/'+g.id+'/', 'https://polariod-studio.vercel.app/').href,description:g.data.description}))},{title:'摄影博主',url:'https://polariod-studio.vercel.app/creators/',description:creators.length?'只展示已确认创作者。':'暂无已确认创作者。',items:creators.map(c=>({title:c.data.name,url:c.data.url,description:c.data.description}))},{title:'精选笔记',url:'https://polariod-studio.vercel.app/notes/',description:'按主题整理的小红书原帖索引；保留作者与阅读状态，不复制未获授权的原文或照片。',reference:{title:'内容使用许可',url:'https://polariod-studio.vercel.app/permissions/'},items:notes.flatMap(g=>g.items.map(n=>({title:n.data.title,noteId:n.id,url:noteAccess(n.data).url,linkMode:noteAccess(n.data).mode,description:noteDescription(n.data,g.title)+' · '+noteAccess(n.data).status})))},{title:'照片墙',url:'https://polariod-studio.vercel.app/gallery/',description:real.length?'仅收录有许可的作品。':'目前仅有明确标注的原创布局示例。',items:[]}]};
}
