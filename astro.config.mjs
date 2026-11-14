import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Project site: https://jialiangz.github.io/writing/
// `site` is the domain root, `base` is the sub-path GitHub Pages serves
// this repository under. Astro composes the two for canonical URLs.
export default defineConfig({
  site: "https://jialiangz.github.io",
  base: "/writing",
  trailingSlash: "always",

  i18n: {
    locales: ["zh", "en"],
    defaultLocale: "zh",
    routing: {
      // Both languages keep an explicit prefix (/zh/..., /en/...) so URLs are
      // symmetric and a third language can be added without moving content.
      prefixDefaultLocale: true,
    },
  },

  integrations: [
    mdx(),
    sitemap({
      // The site root is only a redirect to the default language.
      filter: (page) => !page.endsWith("/writing/"),
      i18n: {
        defaultLocale: "zh",
        locales: { zh: "zh-Hans", en: "en" },
      },
    }),
  ],

  markdown: {
    // Astro 7 renders Markdown with Sätteri by default; the unified
    // processor is what lets us plug in remark/rehype plugins (math).
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["import", "global-builtin", "slash-div"],
        },
      },
    },
  },
});
