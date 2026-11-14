---
title: "A site for writing"
description: "Why I moved my notes out of a private notebook and into a static site: versioning, multilingual by default, and no lock-in."
pubDatetime: 2026-08-21
lang: en
kind: note
tags: ["tools"]
translationKey: site-for-writing
---

A short note about the site you are reading.

## Why a static site

Everything here is a Markdown file in a Git repository. That buys three things I care about:

1. **Versioning.** Every draft is a commit, so I can rewrite an old post without fear.
2. **Portability.** If I ever get tired of this setup, the content is still plain text.
3. **No runtime.** No database, no server, no tracking.

## Why each post declares its own language

Research happens in both languages, and so do the notes. Rather than maintaining two separate sites, every post carries a `lang` field and the page follows it — the interface, the date format and the typography switch with the content, while the URL stays language-neutral.

## Why the toolchain is boring

The whole site is Astro, deployed by GitHub Actions to GitHub Pages. It costs nothing, rebuilds in under a minute, and I already had the CI pipeline muscle memory from the homepage repository.

That is the entire pitch: boring infrastructure, portable content.
