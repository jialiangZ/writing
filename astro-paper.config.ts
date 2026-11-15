import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    // Public URL of the site, including the `/writing` sub-path.
    url: "https://jialiangz.github.io/writing/",
    title: "流形 · Manifold",
    description:
      "关于 AI、气候系统与工程实践的一些笔记。Notes on AI, climate, and the craft of building things.",
    author: "Jialiang Zhang",
    profile: "https://jialiangz.github.io/",
    ogImage: "default-og.jpg",
    // Default language for pages that are not a single post
    // (home, post list, tags, archives, search).
    lang: "zh",
    timezone: "Asia/Hong_Kong",
    dir: "ltr",
  },
  posts: {
    perPage: 10,
    perIndex: 10,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/jialiangZ/writing/edit/main/",
    },
    search: "pagefind",
    toc: true,
  },
  socials: [
    { name: "github", url: "https://github.com/jialiangZ" },
    { name: "mail", url: "mailto:zhangjia_liang@foxmail.com" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "linkedin", url: "https://www.linkedin.com/sharing/share-offsite/?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
