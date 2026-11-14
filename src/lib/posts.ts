import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "../i18n/ui";

export type Post = CollectionEntry<"writing">;
export type PostKind = "note" | "longform";

/** Published entries of one language, newest first. */
export async function getPosts(locale: Locale): Promise<Post[]> {
  const posts = await getCollection(
    "writing",
    ({ data }) => data.locale === locale && !data.draft,
  );
  return sortByDate(posts);
}

export function sortByDate(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/**
 * URL slug of an entry. Content lives in `src/content/writing/<locale>/`,
 * so the entry id is `<locale>/<file-slug>`.
 */
export function slugOf(post: Post): string {
  const id = post.id;
  return id.includes("/") ? id.slice(id.lastIndexOf("/") + 1) : id;
}

export function postsByKind(posts: Post[], kind: PostKind): Post[] {
  return posts.filter((post) => (post.data.kind ?? "note") === kind);
}

export interface TagInfo {
  slug: string;
  count: number;
}

/** Every tag used by the given language, most used first. */
export async function getTags(locale: Locale): Promise<TagInfo[]> {
  const posts = await getPosts(locale);
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

export async function getPostsByTag(locale: Locale, tag: string): Promise<Post[]> {
  const posts = await getPosts(locale);
  return posts.filter((post) => (post.data.tags ?? []).includes(tag));
}

/**
 * The sibling translation of a post, if one exists. Translations share the
 * same `translationKey`; a missing key falls back to the same slug in the
 * other language.
 */
export async function getTranslation(
  post: Post,
): Promise<{ locale: Locale; post: Post } | undefined> {
  const locale = post.data.locale;
  const others = await getCollection("writing", ({ data }) => data.locale !== locale);
  const key = post.data.translationKey ?? slugOf(post);

  const match =
    others.find((candidate) => (candidate.data.translationKey ?? slugOf(candidate)) === key) ??
    others.find((candidate) => slugOf(candidate) === slugOf(post));

  if (!match) return undefined;
  return { locale: match.data.locale, post: match };
}
