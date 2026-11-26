import { getCollection } from 'astro:content';
export async function readSite(){
 const guides=(await getCollection('guides')).sort((a,b)=>a.data.number-b.data.number);
 const creators=(await getCollection('creators')).filter(c=>c.data.approved);
 const photos=await getCollection('photos');
 const real=photos.filter(p=>p.data.permission!=='sample');
 return {title:'Polariod Studio',description:'独立即时摄影小志。',source:'https://github.com/suiyue77/polariod-studio',home:'https://polariod-studio.vercel.app/',limitations:['非 Polaroid 官方网站。','创作者仅列出经过确认的记录；示例图不是实拍。'],sections:[{title:'教程',url:'https://polariod-studio.vercel.app/learn/',description:'即时摄影入门、显影保养、测光与用光、废片诊断及创作笔记。',items:guides.map(g=>({title:g.data.title,url:new URL('learn/'+g.id+'/', 'https://polariod-studio.vercel.app/').href,description:g.data.description}))},{title:'摄影博主',url:'https://polariod-studio.vercel.app/creators/',description:creators.length?'只展示已确认创作者。':'暂无已确认创作者。',items:creators.map(c=>({title:c.data.name,url:c.data.url,description:c.data.description}))},{title:'照片墙',url:'https://polariod-studio.vercel.app/gallery/',description:real.length?'仅收录有许可的作品。':'目前仅有明确标注的原创布局示例。',items:[]}]};
}
