# writing

写作站。Astro 静态站，部署在 GitHub Pages 的项目页路径下：

- 中文：<https://jialiangz.github.io/writing/zh/>
- English: <https://jialiangz.github.io/writing/en/>
- RSS：`/writing/zh/rss.xml`、`/writing/en/rss.xml`

个人主页在另一个仓库：<https://github.com/jialiangZ/jialiangZ.github.io>

## 目录结构

```
src/
├── content/writing/          # 文章正文（Markdown）
│   ├── zh/                   # 中文
│   └── en/                   # 英文
├── components/               # 页面与展示组件（按语言复用同一套）
├── i18n/
│   ├── ui.ts                 # 界面文案（两种语言）
│   └── tags.ts               # 标签 slug → 显示名
├── layouts/Base.astro        # HTML 外壳、<head>、hreflang
├── lib/                      # 文章查询、URL 生成、阅读时长
├── pages/
│   ├── index.astro           # /writing/ → 跳转到 /writing/zh/
│   ├── zh/  en/              # 两种语言的路由（结构完全对称）
└── styles/main.scss
```

URL 一律带语言前缀，中英对称：

| 路径 | 内容 |
| --- | --- |
| `/writing/zh/` | 中文首页 |
| `/writing/zh/<slug>/` | 中文文章 |
| `/writing/zh/tags/<tag>/` | 中文标签页 |
| `/writing/en/...` | 英文的同一套页面 |

## 写一篇新文章

在 `src/content/writing/<locale>/` 下新建 `.md`（或 `.mdx`）文件，文件名即 URL slug（建议用小写英文加连字符）：

```markdown
---
title: "标题"
description: "一句话摘要，用于列表页和 SEO。"
pubDate: 2026-11-14
locale: zh              # zh | en
kind: longform          # longform（长文）| note（短笔记）
tags: [mllm, streaming] # 标签 slug，见 src/i18n/tags.ts
translationKey: my-post # 与另一语言的同一篇文章保持一致
draft: false            # true 时不发布
---

正文……
```

提交并推送到 `main` 后，GitHub Actions 会自动构建并发布。

### 中英对照

同一篇文章的两个语言版本 **slug 保持一致**，并使用相同的 `translationKey`：

- `src/content/writing/zh/my-post.md`
- `src/content/writing/en/my-post.md`

站点会据此在文章页顶部给出语言切换入口，并在 `<head>` 中输出 `hreflang` 互指。没有对应翻译的文章不会出现在另一种语言的列表里。

### 数学公式与代码

Markdown 里直接写 LaTeX：

```markdown
行内公式 $E = mc^2$

块级公式

$$
\mathcal{L} = \sum_{i} \ell_i
$$
```

由 `remark-math` + `rehype-katex` 渲染，代码块由 Shiki 高亮。`.mdx` 文件还能使用组件（需要 `@astrojs/mdx`）。

### 新增标签

标签在 frontmatter 里写 ASCII slug（例如 `paper-notes`），显示名在 `src/i18n/tags.ts` 里配置：

```ts
"paper-notes": { zh: "论文笔记", en: "Paper Notes" },
```

没有配置时直接显示 slug 本身。

## 本地开发

```bash
npm install
npm run dev       # http://localhost:4321/writing/zh/
npm run build     # 输出到 dist/
npm run preview   # 预览构建结果
npm run check     # 类型检查
```

## 部署

`.github/workflows/deploy.yml`：推送到 `main` → 构建 → 发布到 GitHub Pages。
仓库的 Pages 设置需要选择 **GitHub Actions** 作为发布来源。

站点本身是 `base: "/writing"` 的子路径站点，`site` 和 `base` 在 `astro.config.mjs` 与 `src/config.ts` 各写了一份，改仓库名时两处都要同步。

## License

MIT
