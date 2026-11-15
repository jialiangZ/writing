# 流形 · Manifold

关于 AI、气候系统与工程实践的笔记。

- 站点：<https://jialiangz.github.io/writing/>
- 个人主页：<https://jialiangz.github.io/>

Astro + Tailwind v4 构建的静态站点，内容全是 Markdown，GitHub Actions 自动发布到 GitHub Pages。

## 写文章

在 `src/content/posts/` 下新建 `.md`（或 `.mdx`），文件名即 URL slug。以下划线开头的文件不会发布。

```markdown
---
title: "标题"
description: "一句话摘要，用于列表页、SEO 和 RSS。"
pubDatetime: 2026-11-15
lang: zh                  # zh | en，决定页面语言
kind: longform            # longform（长文）| note（短笔记）
tags: ["mllm", "streaming"]
translationKey: my-post   # 可选，与另一语言的同一篇文章保持一致
draft: false              # 可选，true 时不发布
---

正文……
```

其他可选字段：`modDatetime`（更新日期）、`featured`（首页精选）、`ogImage`（分享图）、`hideToc`、`canonicalURL`。

正文支持 LaTeX（`$E = mc^2$`、$$\mathcal{L} = \sum_i \ell_i$$）和 Shiki 代码高亮（```` ```js title="file.js" ````、`// [!code highlight]` 注解）。标签可以写中文，页面上显示原文、URL 自动 slug 化。

推送到 `main` 即自动构建发布。

## 语言

站点只有一套 URL，没有 `/zh`、`/en` 前缀。每篇文章在 frontmatter 里声明 `lang`，页面语言、日期格式和界面文案都跟着文章走：

- `lang: zh` → `<html lang="zh">`、`2026年10月18日`、中文界面
- `lang: en` → `<html lang="en">`、`18 Oct, 2026`、英文界面

首页、文章列表、标签、归档、搜索等页面使用 `astro-paper.config.ts` 里的 `site.lang`（当前为 `zh`）。同一篇文章的中英两版用 `translationKey` 关联，文章页会给出跳转链接。

## 目录结构

```
astro-paper.config.ts     # 站点配置：标题、作者、社交链接、功能开关、每页篇数
astro.config.ts           # Astro 配置：site/base、i18n、Markdown 处理器
src/content/posts/        # 文章
src/content/pages/        # 独立页面（about）
src/i18n/lang/            # 界面文案（en.ts / zh.ts）
src/pages/                # 路由：首页、文章、标签、归档、搜索、RSS、OG 图
src/styles/               # 主题变量与排版
```

## 开发与部署

```bash
npm install
npm run dev       # http://localhost:4321/writing/
npm run build     # 构建 + Pagefind 索引
npm run preview   # 预览构建结果
```

搜索页需要先跑一次 `npm run build` 才有索引数据。

依赖版本上有几处需要留意：

- **Node 26**：CI 和本地开发都用这个版本。
- **TypeScript 固定在 6.x**：`astro check` 尚不支持 TypeScript 7，升级会直接报错，等 `@astrojs/check` 支持后（可改用实验性的 `@astrojs/ts-content-mapper`）再升。
- **`overrides`**：`fflate`、`katex`、`postcss-selector-parser` 被上游锁在有安全公告的旧版本上，这里强制提到修复版本，`npm audit` 因此是干净的。

推送到 `main` → GitHub Actions 构建 → 发布到 GitHub Pages。仓库的 Pages 设置需选择 **GitHub Actions** 作为发布来源。

站点是子路径站点（`base: "/writing"`）：`astro.config.ts` 的 `site` 是域名根，`astro-paper.config.ts` 的 `site.url` 是含子路径的公开地址，改仓库名时两处同步。

## License

MIT。界面与组件基于 [AstroPaper](https://github.com/satnaing/astro-paper)（© 2023 Sat Naing，MIT）。
