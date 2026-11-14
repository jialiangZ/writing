# writing

写作站，基于 [AstroPaper](https://github.com/satnaing/astro-paper)（MIT），部署在 GitHub Pages 的项目页路径下：

- 站点：<https://jialiangz.github.io/writing/>
- RSS：<https://jialiangz.github.io/writing/rss.xml>
- 个人主页：<https://github.com/jialiangZ/jialiangZ.github.io>

## 语言：由内容决定

站点只有一套 URL，**没有 `/zh` `/en` 前缀**。每篇文章在 frontmatter 里声明 `lang`，页面语言、日期格式和界面文案都跟着文章走：

- 中文文章 → `<html lang="zh">`、`2026年10月18日`、中文界面
- 英文文章 → `<html lang="en">`、`18 Oct, 2026`、英文界面
- 首页、文章列表、标签、归档等页面使用 `astro-paper.config.ts` 里的 `site.lang`（当前是 `zh`）

同一篇文章的中英两个版本用 `translationKey` 关联，文章页会自动给出跳转链接。

## 写一篇新文章

在 `src/content/posts/` 下新建 `.md`（或 `.mdx`），文件名即 URL slug：

```markdown
---
title: "标题"
description: "一句话摘要，用于列表页、SEO 和 RSS。"
pubDatetime: 2026-11-14
lang: zh                  # zh | en，决定页面语言
kind: longform            # longform（长文）| note（短笔记）
tags: ["mllm", "streaming"]
translationKey: my-post   # 可选，与另一语言的同一篇文章保持一致
draft: false              # 可选，true 时不发布
---

正文……
```

其他可选字段：`modDatetime`（更新日期）、`featured`（首页精选）、`ogImage`（自定义分享图）、`hideToc`、`canonicalURL`。

提交并推送到 `main` 后，GitHub Actions 会构建（含 Pagefind 索引）并发布。

### 数学公式与代码

Markdown 里直接写 LaTeX，由 `remark-math` + `rehype-katex` 渲染：

```markdown
行内公式 $E = mc^2$

$$
\mathcal{L} = \sum_{i} \ell_i
$$
```

代码块由 Shiki 高亮，支持 ` ```js title="file.js" `、行高亮 `// [!code highlight]` 等注解。

## 目录结构

```
astro-paper.config.ts     # 站点配置：标题、作者、社交链接、功能开关
astro.config.ts           # Astro 配置：site/base、i18n、Markdown 处理器
src/content/posts/        # 文章（Markdown / MDX）
src/content/pages/        # 独立页面（about）
src/i18n/lang/            # 界面文案（en.ts / zh.ts）
src/pages/                # 路由：首页、文章、标签、归档、搜索、RSS、OG 图
src/styles/               # 主题变量与排版
```

## 本地开发

```bash
npm install
npm run dev       # http://localhost:4321/writing/
npm run build     # 构建 + Pagefind 索引 + 复制索引到 public/
npm run preview   # 预览构建结果
```

> 搜索页需要先跑一次 `npm run build` 才有索引数据。

## 部署

`.github/workflows/deploy.yml`：推送到 `main` → `npm run build` → 发布到 GitHub Pages。
仓库的 Pages 设置需要选择 **GitHub Actions** 作为发布来源。

站点是子路径站点（`base: "/writing"`），所以 `astro.config.ts` 里的 `site` 是域名根，`astro-paper.config.ts` 里的 `site.url` 是含子路径的公开地址，改仓库名时两处都要同步。

## 主题

视觉与组件来自 [AstroPaper](https://github.com/satnaing/astro-paper)（MIT，© 2023 Sat Naing），在此基础上的改动：

- 单 URL 树 + 由 frontmatter `lang` 驱动的页面语言（原主题为单语言）
- `kind` 字段与列表页的长文/笔记徽标、语言徽标
- `translationKey` 中英互链
- KaTeX 公式支持
- 中文字体回退与中文排版行高
- 部署到 GitHub Pages 子路径（`/writing`）
- Pagefind 搜索界面中文化

## License

MIT