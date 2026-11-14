---
title: "A site for writing"
description: "Why I moved my notes out of a private notebook and into a static site: versioning, bilingual by default, and no lock-in."
pubDate: 2026-08-21
locale: en
kind: note
tags: [tools]
translationKey: site-for-writing
---

A short note about the site you are reading.

## Why a static site

Everything here is a Markdown file in a Git repository. That buys three things I care about:

1. **Versioning.** Every draft is a commit, so I can rewrite an old post without fear.
2. **Portability.** If I ever get tired of this setup, the content is still plain text.
3. **No runtime.** No database, no server, no tracking.

## Why bilingual by default

Research happens in both languages, and so do the notes. Rather than maintaining two separate sites, each post declares its language and, when a translation exists, the two are linked. URLs stay symmetric: `/zh/...` and `/en/...`.

## Why the toolchain is boring

The whole site is Astro, deployed by GitHub Actions to GitHub Pages. It costs nothing, rebuilds in under a minute, and I already had the CI pipeline muscle memory from the homepage repository.

That is the entire pitch: boring infrastructure, portable content.
