import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    /** one line, shown under the title and in lists */
    description: z.string(),
    part: z.enum(['python', 'reasoning', 'exam']),
    /** position within its part */
    order: z.number(),
  }),
});

export const collections = { notes };
