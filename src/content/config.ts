import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
  }),
});

const experienceCollection = defineCollection({
  type: 'data',
  schema: z.object({
    jobs: z.array(z.object({
      company: z.string(),
      role: z.string(),
      location: z.string(),
      start: z.string(),
      end: z.string(),
      url: z.string().optional(),
      summary: z.string().optional(),
      technologies: z.array(z.string()).optional(),
      highlights: z.array(z.string()).optional(),
    })),
  }),
});

const photosCollection = defineCollection({
  type: 'data',
  schema: z.object({
    series: z.array(z.object({
      title: z.string(),
      cover: z.string().optional(),
      photos: z.array(z.string()).optional(),
    })).optional(),
  }),
});

const feedCollection = defineCollection({
  type: 'data',
  schema: z.looseObject({}),
});

export const collections = {
  blog: blogCollection,
  experience: experienceCollection,
  photos: photosCollection,
  feed: feedCollection,
};
