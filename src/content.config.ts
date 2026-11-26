import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
const guides=defineCollection({loader:glob({base:'./src/content/guides',pattern:'**/*.{md,mdx}'}),schema:z.object({title:z.string(),description:z.string(),number:z.number(),category:z.string(),minutes:z.number().int().positive()})});
const creators=defineCollection({loader:file('./src/content/creators.json'),schema:z.object({name:z.string(),url:z.string().url(),description:z.string(),approved:z.boolean(),avatar:z.object({src:z.string().regex(/^\/images\/creators\/[a-z0-9][a-z0-9._-]*\.(webp|png|jpe?g|avif)$/i),permission:z.enum(['owned','licensed']),credit:z.string().min(1)}).optional()})});
const photos=defineCollection({loader:file('./src/content/photos.json'),schema:z.object({title:z.string(),image:z.string(),alt:z.string(),width:z.number().positive(),height:z.number().positive(),category:z.string(),credit:z.string(),permission:z.enum(['owned','licensed','sample'])})});
const readingNotes=defineCollection({loader:file('./src/content/reading-notes.json'),schema:z.object({
 title:z.string().min(1),author:z.string().min(1),category:z.enum(['light','practice','film','creative']),
 url:z.string().regex(/^https:\/\/www\.xiaohongshu\.com\/explore\/[0-9a-f]{24}$/),
 evidence:z.enum(['title-only','topic-verified','body-reviewed']),summary:z.string().min(1).optional(),
 coverTopic:z.string().min(1).max(24),
 coverMotif:z.enum(['camera','light','film','color','meter','check','double','landscape','lens','flower','portrait','temperature','architecture','print','music']),
 cover:z.object({src:z.string().regex(/^\/images\/notes\/[a-z0-9][a-z0-9._-]*\.(webp|png|jpe?g|avif)$/i),permission:z.enum(['owned','licensed']),credit:z.string().min(1)}).optional()
}).superRefine((v,ctx)=>{if(v.summary&&v.evidence!=='body-reviewed')ctx.addIssue({code:z.ZodIssueCode.custom,path:['summary'],message:'Summary requires reviewed note body'});})});
export const collections={guides,creators,photos,readingNotes};

