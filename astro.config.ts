import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { rehypeTableWrapper } from "./src/utils/rehypeTableWrapper";
import {
  inlineTocDeprecation,
  rehypeInlineToc,
} from "./src/utils/rehypeInlineToc";
import config from "./astro-paper.config";

export default defineConfig({
  // The site is served from a sub-path of the user site:
  // https://jialiangz.github.io/writing/
  // `site` is the origin, `base` is the sub-path. `config.site.url` keeps
  // the full public URL for RSS/OG images.
  site: "https://jialiangz.github.io",
  base: "/writing",
  trailingSlash: "always",
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !/\/archives\/?$/.test(page),
    }),
    inlineTocDeprecation(),
  ],
  i18n: {
    // Every post carries its own `lang`, so the site itself has a single URL
    // tree. The locale list only drives the UI strings; no locale prefixes
    // are added to any URL.
    locales: ["zh", "en"],
    defaultLocale: "zh",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeHeadingIds,
        rehypeInlineToc,
        rehypeCallouts,
        rehypeTableWrapper,
        rehypeKatex,
      ],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
