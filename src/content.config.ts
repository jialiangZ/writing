import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Writing lives in `src/content/writing/<locale>/<slug>.md`.
 *
 * - `locale`   which language the entry is written in (zh | en)
 * - `kind`     "longform" for essays, "note" for short notes
 * - `tags`     ASCII slugs; display names come from src/i18n/tags.ts
 * - `draft`    true keeps the entry out of the published site
 *
 * A Chinese entry and its English counterpart share a `translationKey`,
 * which is how the language switcher pairs them up.
 */
const writing = defineCollection({
  loader: glob({
    base: "./src/content/writing",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    locale: z.enum(["zh", "en"]),
    kind: z.enum(["note", "longform"]).default("note"),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    translationKey: z.string().optional(),
  }),
});

export const collections = { writing };
