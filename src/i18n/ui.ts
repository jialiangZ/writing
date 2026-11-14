export const locales = ["zh", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";

export const localeNames: Record<Locale, string> = {
  zh: "中文",
  en: "English",
};

/** BCP-47 tags used for <html lang> and hreflang. */
export const localeTags: Record<Locale, string> = {
  zh: "zh-Hans",
  en: "en",
};

export const ui = {
  zh: {
    siteName: "写作",
    siteTitle: "张嘉良的写作",
    tagline: "关于 AI、气候科学、流式多模态模型的一些思考。",
    nav: {
      home: "首页",
      tags: "标签",
      rss: "RSS",
      homepage: "个人主页",
      about: "关于",
    },
    sections: {
      longform: "长文",
      note: "短笔记",
    },
    meta: {
      publishedOn: "发布于",
      updatedOn: "更新于",
      readTime: "分钟阅读",
      words: "字",
      tags: "标签",
      tagPage: "标签：",
      empty: "这里还没有内容。",
      emptyTag: "这个标签下还没有内容。",
      allPosts: "全部文章",
      noTags: "还没有标签",
      translation: "查看英文版",
      noTranslation: "暂无其他语言版本",
      prev: "上一篇",
      next: "下一篇",
      toc: "目录",
      backToTop: "回到顶部",
      rssDescription: "张嘉良的写作订阅源。",
      allFeeds: "所有订阅源",
    },
    footer: {
      copyright: "保留所有权利。",
      builtWith: "由 Astro 构建，托管于 GitHub Pages。",
    },
  },
  en: {
    siteName: "Writing",
    siteTitle: "Writing by Jialiang Zhang",
    tagline: "Notes on AI, climate science and streaming multimodal models.",
    nav: {
      home: "Home",
      tags: "Tags",
      rss: "RSS",
      homepage: "Homepage",
      about: "About",
    },
    sections: {
      longform: "Essays",
      note: "Notes",
    },
    meta: {
      publishedOn: "Published",
      updatedOn: "Updated",
      readTime: "min read",
      words: "words",
      tags: "Tags",
      tagPage: "Tag:",
      empty: "Nothing here yet.",
      emptyTag: "Nothing under this tag yet.",
      allPosts: "All posts",
      noTags: "No tags yet",
      translation: "Read the Chinese version",
      noTranslation: "No other language version yet",
      prev: "Previous",
      next: "Next",
      toc: "On this page",
      backToTop: "Back to top",
      rssDescription: "RSS feed of writing by Jialiang Zhang.",
      allFeeds: "All feeds",
    },
    footer: {
      copyright: "All rights reserved.",
      builtWith: "Built with Astro, hosted on GitHub Pages.",
    },
  },
} as const;

export type UI = (typeof ui)[Locale];
