---
# ── 必填 ────────────────────────────────────────────────────────────────
title: "文章标题"
description: "一句话摘要。列表页、SEO、RSS 都用它。"
pubDatetime: 2026-11-15 # 日期必须能被解析；只管到“天”，当天就会上线
# ── 常用可选 ────────────────────────────────────────────────────────────
lang: zh # zh | en —— 决定页面语言、日期格式、界面文案
kind: note # note（短笔记）| longform（长文）
tags: ["mllm", "streaming"] # 可以直接写中文，URL 会自动 slug 化
draft: false # true = 不发布（本地 dev 仍可见）
featured: false # true = 出现在首页“精选”
modDatetime: 2026-11-16 # 修订日期，列表会按它排序
translationKey: my-post # 与另一语言的同一篇文章共用，用于互链
# ── 不常用 ──────────────────────────────────────────────────────────────
# ogImage: "./cover.png"      # 分享图，留空则自动生成
# hideToc: true               # 关掉右侧目录
# hideEditPost: true          # 隐藏“在 GitHub 上编辑”
# canonicalURL: "https://..."  # 原文发表在其他地方时用
# timezone: "Asia/Shanghai"   # 一般不填，用站点默认（Asia/Hong_Kong）
# author: "Jialiang Zhang"    # 一般不用填
---

<!--
  这是一个模板文件：文件名以下划线开头，构建时会被忽略，不会发布。
  写新文章时复制它并改名，例如 2026-11-15-my-post.md
  文件名就是 URL：/writing/posts/2026-11-15-my-post/
-->

正文从正文开始写，不需要重复标题 —— 标题由 frontmatter 渲染。

## 二级标题

普通段落、**粗体**、*斜体*、`行内代码`、[链接](https://example.com)。

### 三级标题

- 无序列表
- 第二项
  - 嵌套项

1. 有序列表
2. 第二项

> 引用块。普通引用不会被当成提示块。

## 数学公式

行内：$E = mc^2$，或带下标的 $z_t$。

块级：

$$
\Delta z_t = f(x_t, z_{t-1}) - f(x_{t-1}, z_{t-1})
$$

## 代码块

带文件名徽标（`file="..."`）：

```python file="stream.py"
for frame in video_stream:
    emit(model.infer(frame))
```

行高亮、diff、单词高亮：

```js file="attention.js"
const x = compute(); // [!code highlight]
const old = 1; // [!code --]
const fresh = 2; // [!code ++]
const name = "streaming"; // [!code word:streaming]
```

## 提示块（Obsidian callout 语法）

> [!note]
> 普通提示。

> [!tip] 自定义标题
> 技巧类提示。

> [!warning]
> 需要注意的地方。

> [!danger]- 可折叠（`-` 默认收起，`+` 默认展开）
> 点开才看到的内容。

> [!example]
> 例子。

## 表格

| 策略 | 延迟 | 体感 |
| --- | --- | --- |
| 全量重算 | 高 | 抖动 |
| 增量缓存 | 低 | 平滑 |

## 图片

图片放在文章旁边，用相对路径引用（会走 Astro 的图片优化）：

```markdown
![替代文本](./figure.png)
```

图注写法：

```markdown
![图 1：逐日预测误差](./figure.png)
```

## 目录

页面右侧的目录自动生成（两个以上二/三级标题时出现），不用手写。
想关掉某篇的目录，在 frontmatter 写 `hideToc: true`。

## 中英对照

同一个主题写两篇，slug 不同、`lang` 不同，`translationKey` 相同：

- `src/content/posts/my-post.md`（`lang: zh`）
- `src/content/posts/my-post-en.md`（`lang: en`）

两边的文章页会自动出现跳转链接。