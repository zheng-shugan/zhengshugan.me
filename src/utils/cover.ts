import path from "node:path";
import fs from "node:fs";
import type { CollectionEntry } from "astro:content";

const coverExtensions = [
  ".webp",
  ".avif",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".bmp"
];

function findDefaultCover(sourceDir: string): string | undefined {
  if (!fs.existsSync(sourceDir)) return undefined;
  const directories = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const directory of ["Attachments", "attachments"]) {
    if (!directories.some((entry) => entry.isDirectory() && entry.name === directory))
      continue;
    const directoryPath = path.join(sourceDir, directory);
    const files = fs.readdirSync(directoryPath, { withFileTypes: true });
    for (const extension of coverExtensions) {
      const file = files
        .filter(
          (entry) => entry.isFile() && entry.name.toLowerCase() === `cover${extension}`
        )
        .sort((a, b) => a.name.localeCompare(b.name))[0];
      if (file) return `${directory}/${file.name}`;
    }
  }
  return undefined;
}

/** Resolve attachments from the source file, not the flattened article slug. */
export function getCoverUrl(post: CollectionEntry<"blog">): string | undefined {
  const sourceDir = post.filePath ? path.dirname(path.resolve(post.filePath)) : undefined;
  const src = post.data.cover?.src ?? (sourceDir && findDefaultCover(sourceDir));
  if (!src) return undefined;
  if (src.startsWith("https://")) return new URL(src).href;
  if (src.startsWith("/") && !src.startsWith("//")) return src;

  if (!/^(\.\/)?(?:Attachments|attachments)\//.test(src)) {
    throw new Error(`Unsupported cover path in ${post.id}: ${src}`);
  }
  if (!sourceDir) {
    throw new Error(`Missing source file path for cover in ${post.id}`);
  }

  const blogRoot = path.resolve("src/content/blog");
  const directory = src.replace(/^\.\//, "").split("/")[0];
  const attachmentRoot = path.join(sourceDir, directory);
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
