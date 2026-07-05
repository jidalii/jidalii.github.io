import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().nullable(),
    date: z.date(),
    tags: z.array(z.string()).or(z.string()).optional().nullable(),
    category: z.array(z.string()).or(z.string()).default('uncategorized').nullable(),
    sticky: z.number().default(0).nullable(),
    mathjax: z.boolean().default(false).nullable(),
    mermaid: z.boolean().default(false).nullable(),
    draft: z.boolean().default(false).nullable(),
    toc: z.boolean().default(true).nullable(),
    donate: z.boolean().default(true).nullable(),
    comment: z.boolean().default(true).nullable(),
  }),
});

const feed = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/feed' }),
  schema: z.object({
    date: z.date().or(z.string()).optional().nullable(),
    donate: z.boolean().default(true),
    comment: z.boolean().default(true),
  }),
});

const photos = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/photos' }),
  schema: z.object({
    series: z.array(z.object({
      title: z.string(),
      cover: z.string(),
      coverW: z.number().optional(),
      coverH: z.number().optional(),
      photos: z.array(z.string()),
    })),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/experience' }),
  schema: z.object({
    jobs: z.array(z.object({
      company: z.string(),
      role: z.string(),
      location: z.string(),
      start: z.string(),
      end: z.string(),
      highlights: z.array(z.string()),
      url: z.string().optional(),
    })),
  }),
});

export const collections = { blog, feed, photos, experience };
