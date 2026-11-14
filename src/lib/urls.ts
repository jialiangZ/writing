import { SITE } from "../config";
import type { Locale } from "../i18n/ui";

/**
 * URL builders for a project site served under a sub-path.
 * Every generated URL is absolute-from-root so it works no matter which
 * page links to it.
 */
const base = SITE.base.replace(/\/+$/, "");

/** `/writing/zh/` , `/writing/en/` */
export function localeUrl(locale: Locale, path = ""): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `${base}/${locale}/${clean}/` : `${base}/${locale}/`;
}

/** `/writing/zh/my-post/` */
export function postUrl(locale: Locale, slug: string): string {
  return localeUrl(locale, slug);
}

/** `/writing/zh/tags/ai/` */
export function tagUrl(locale: Locale, tag: string): string {
  return localeUrl(locale, `tags/${tag}`);
}

/** `/writing/zh/tags/` */
export function tagsUrl(locale: Locale): string {
  return localeUrl(locale, "tags");
}

/** `/writing/zh/rss.xml` */
export function feedUrl(locale: Locale): string {
  return `${base}/${locale}/rss.xml`;
}

/**
 * Absolute URL for a path that already contains the base
 * (`/writing/zh/...`), for canonical links, RSS items and OG tags.
 */
export function absolute(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return new URL(clean, SITE.origin).toString();
}

/** Absolute URL of the site root, e.g. `https://jialiangz.github.io/writing/`. */
export function siteUrl(): string {
  return `${SITE.origin}${base}/`;
}
