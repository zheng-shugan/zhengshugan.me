import type { CollectionEntry } from "astro:content";
import pinyin from "pinyin/lib/esm/pinyin.js";

export const slugifyTag = (tag: string): string => {
  const result = pinyin(tag, { style: 0 }).join("-");
  return result || tag;
};

export const getTags = (posts: CollectionEntry<"blog">[]) => {
  const map: Record<string, number> = {};

  posts.forEach((post) => {
    post.data.tags?.forEach((tag) => {
      map[tag] = map[tag] ? map[tag] + 1 : 1;
    });
  });

  const tags = Object.keys(map).sort((a, b) => {
    if (map[a] === map[b]) return a.localeCompare(b);
    return map[b] - map[a];
  });

  map["all"] = posts.length;

  return { tags, numPostsPerTag: map };
};
