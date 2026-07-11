import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const stories = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/data/stories" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    intro: z.string(),
    description: z.string().optional(), 
    pubDate: z.coerce.date().optional(),
    image: image().optional(), 
    alt: z.string().optional(),
    imageCredit: z.string().optional(),
  }), 
});

const poems = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/data/poems" }),
  schema: z.object({
    title: z.string(),
    author: z.string().default("Anonymous"),
    pubDate: z.coerce.date().optional(), 
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/data/blog" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    excerpt: z.string().optional(),
    image: image().optional(),
    alt: z.string().optional(),
    imageCredit: z.string().optional(),
  }),
});

export const collections = { stories, poems, blog };