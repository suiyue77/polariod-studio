import { getCollection } from 'astro:content';

export const noteTopics = [
  { id: 'light', title: '测光与曝光', description: '测光、曝光补偿、Lightme 与用光原理。', guide: '/learn/metering/', guideTitle: '测光技术指南' },
  { id: 'practice', title: '拍摄与设备', description: '机型体验、拍摄方法、参数记录和配件。', guide: '/learn/flip-shooting/', guideTitle: 'Flip 拍摄指南' },
  { id: 'film', title: '相纸与保养', description: '相纸、温度、色彩、存放与显影。', guide: '/learn/camera-care/', guideTitle: '相机保养指南' },
  { id: 'creative', title: '创作与灵感', description: '实拍作品、多重曝光、风景和生活记录。', guide: '/learn/portrait-light/', guideTitle: '人像用光指南' },
] as const;
export const evidenceLabel = {
  'title-only': '标题索引',
  'topic-verified': '主题已核对',
  'body-reviewed': '已读正文',
} as const;
export async function readNotes() {
  const notes = await getCollection('readingNotes');
  return noteTopics.map(topic=>({...topic,items:notes.filter(n=>n.data.category===topic.id)}));
}
export function noteDescription(n: {author:string; evidence:keyof typeof evidenceLabel; summary?:string}, topic:string) {
  return n.author+' · '+topic+' · '+evidenceLabel[n.evidence]+(n.summary?' — '+n.summary:'');
}
