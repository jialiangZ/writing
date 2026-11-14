import type { Locale } from "./ui";

/**
 * Tags are ASCII slugs in frontmatter so URLs stay clean and stable.
 * This table maps a slug to a human-readable label per language; anything
 * missing falls back to the slug itself.
 */
const tagLabels: Record<string, Partial<Record<Locale, string>>> = {
  "ai-for-climate": { zh: "AI 与气候", en: "AI for Climate" },
  mllm: { zh: "多模态大模型", en: "Multimodal LLM" },
  streaming: { zh: "流式推理", en: "Streaming" },
  "reading-notes": { zh: "读书笔记", en: "Reading Notes" },
  "sea-ice": { zh: "海冰", en: "Sea Ice" },
  "paper-notes": { zh: "论文笔记", en: "Paper Notes" },
  tools: { zh: "工具", en: "Tools" },
};

export function tagLabel(slug: string, locale: Locale): string {
  return tagLabels[slug]?.[locale] ?? slug;
}
