import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { ui } from "../../i18n/ui";
import { slugOf } from "../../lib/posts";
import { absolute, localeUrl, postUrl } from "../../lib/urls";

export async function GET() {
  const posts = await getCollection(
    "writing",
    ({ data }) => data.locale === "zh" && !data.draft,
  );
  posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const t = ui.zh;

  return rss({
    title: t.siteTitle,
    description: t.meta.rssDescription,
    site: absolute(localeUrl("zh")),
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: absolute(postUrl("zh", slugOf(post))),
    })),
    customData: "<language>zh-Hans</language>",
  });
}
