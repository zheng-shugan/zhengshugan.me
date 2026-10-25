import { z } from "astro:content";

export const blogSchema = z
  .object({
    author: z.string().optional(),
    title: z.string(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    date: z.date().optional(),
    cover: z
      .object({
        src: z.string().trim().min(1),
        alt: z.string().optional()
      })
      .strict()
      .optional()
  })
  .strict();

export type BlogFrontmatter = z.infer<typeof blogSchema>;
