import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    // Public URL of the site, including the `/writing` sub-path.
    url: "https://jialiangz.github.io/writing/",
    title: "写作 · Writing",
    description:
      "关于 AI、气候科学与流式多模态模型的一些思考。Notes on AI, climate science and streaming multimodal models.",
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
    { name: "linkedin", url: "https://www.linkedin.com/in/jialiang-zhang-hku/" },
    { name: "mail", url: "mailto:zhangjia_liang@foxmail.com" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "linkedin", url: "https://www.linkedin.com/sharing/share-offsite/?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
