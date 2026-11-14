# writing

写作站：<https://jialiangz.github.io/writing/>

个人主页在 [jialiangZ.github.io](https://github.com/jialiangZ/jialiangZ.github.io)。

## 语言由内容决定

站点只有一套 URL，没有 `/zh`、`/en` 前缀。每篇文章在 frontmatter 里声明 `lang`，页面语言、日期格式和界面文案都跟着文章走：

- 中文文章 → `<html lang="zh">`、`2026年10月18日`、中文界面
- 英文文章 → `<html lang="en">`、`18 Oct, 2026`、英文界面
- 首页、文章列表、标签、归档、搜索等页面使用 `site.lang`（在 `astro-paper.config.ts` 中配置，当前为 `zh`）

同一篇文章的中英两版用 `translationKey` 关联，文章页会给出跳转链接。

## 写一篇新文章

在 `src/content/posts/` 下新建 `.md`（或 `.mdx`），文件名即 URL slug：

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

其他可选字段：`modDatetime`（更新日期）、`featured`（首页精选）、`ogImage`（自定义分享图）、`hideToc`、`canonicalURL`。

提交并推送到 `main` 后自动构建发布。

### 公式与代码

Markdown 里直接写 LaTeX，由 `remark-math` + `rehype-katex` 渲染：

```markdown
行内公式 $E = mc^2$

$$
\mathcal{L} = \sum_{i} \ell_i
$$
```

代码块由 Shiki 高亮，支持 ` ```js title="file.js" `、行高亮 `// [!code highlight]` 等注解。

### 标签

标签可以直接写中文：页面上显示原文，URL 会自动 slug 化。不使用标签时留空即可。

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

## 本地开发

```bash
npm install
npm run dev       # http://localhost:4321/writing/
npm run build     # 构建 + Pagefind 索引
npm run preview   # 预览构建结果
```

> 搜索页需要先跑一次 `npm run build` 才有索引数据。

## 部署

`.github/workflows/deploy.yml`：推送到 `main` → `npm run build` → 发布到 GitHub Pages。
仓库的 Pages 设置需选择 **GitHub Actions** 作为发布来源。

站点是子路径站点（`base: "/writing"`）：`astro.config.ts` 的 `site` 是域名根，`astro-paper.config.ts` 的 `site.url` 是含子路径的公开地址，改仓库名时两处同步。

## License

MIT。界面与组件基于 [AstroPaper](https://github.com/satnaing/astro-paper)（© 2023 Sat Naing，MIT）。