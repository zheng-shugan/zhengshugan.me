import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@config";
import { getPostDate, getPostUrlSlug } from "@utils";

export async function get() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: posts.map((item) => {
      const slug = getPostUrlSlug(item);
      const isZh = item.id.startsWith("zh/");
      return {
        link: `posts/${isZh ? "zh/" : ""}${slug}`,
        title: item.data.title,
        pubDate: new Date(getPostDate(item))
      };
    })
  });
}
