import { defineCollection, z } from "astro:content";
import { blogSchema } from "./content/_schemas";

const blog = defineCollection({
  schema: blogSchema
});

const tags = defineCollection({
  schema: z
    .object({
      title: z.string()
    })
    .strict()
});

export const collections = { blog, tags };
