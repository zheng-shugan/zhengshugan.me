import path from "node:path";
import type { CollectionEntry } from "astro:content";

/** Resolve attachments from the source file, not the flattened article slug. */
export function getCoverUrl(post: CollectionEntry<"blog">): string | undefined {
  const src = post.data.cover?.src;
  if (!src) return undefined;
  if (src.startsWith("https://")) return new URL(src).href;
  if (src.startsWith("/") && !src.startsWith("//")) return src;

  if (!/^(\.\/)?Attachments\//.test(src)) {
    throw new Error(`Unsupported cover path in ${post.id}: ${src}`);
  }
  if (!post.filePath) {
    throw new Error(`Missing source file path for cover in ${post.id}`);
  }

  const blogRoot = path.resolve("src/content/blog");
  const sourceDir = path.dirname(path.resolve(post.filePath));
  const attachmentRoot = path.join(sourceDir, "Attachments");
  const imagePath = path.resolve(sourceDir, src);
  const relativeImage = path.relative(attachmentRoot, imagePath);
  const relativePath = path.relative(blogRoot, imagePath);
  if (
    relativeImage.startsWith("..") ||
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`Cover must stay inside the article's Attachments: ${post.id}`);
  }

  return `/posts/${relativePath.split(path.sep).map(encodeURIComponent).join("/")}`;
}
