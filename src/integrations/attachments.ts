import type { AstroIntegration } from "astro";
import type { Plugin } from "vite";
import path from "path";
import fs from "fs";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf"
};

function findAttachmentDirs(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "Attachments") {
        results.push(fullPath);
      } else {
        results.push(...findAttachmentDirs(fullPath));
      }
    }
  }
  return results;
}

export function copyAttachments(): AstroIntegration {
  return {
    name: "copy-attachments",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const srcDir = path.resolve("src/content/blog");
        const outDir = typeof dir === "string" ? dir : dir.pathname;
        const attachmentDirs = findAttachmentDirs(srcDir);

        for (const attachmentDir of attachmentDirs) {
          const relativePath = path.relative(srcDir, attachmentDir);
          const destDir = path.join(outDir, "posts", relativePath);
          fs.mkdirSync(destDir, { recursive: true });
          fs.cpSync(attachmentDir, destDir, { recursive: true });
          console.log(`[attachments] Copied: ${relativePath}`);
        }
      }
    }
  };
}

export function serveAttachments(): Plugin {
  return {
    name: "serve-attachments",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        const match = url.match(/^\/posts\/(.+?)\/Attachments\/(.+)$/);
        if (!match) return next();

        const [, postPath, fileName] = match;
        const srcDir = path.resolve("src/content/blog");
        const candidates = [
          path.join(srcDir, "zh", postPath, "Attachments", fileName),
          path.join(srcDir, postPath, "Attachments", fileName)
        ];

        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            const ext = path.extname(fileName).toLowerCase();
            res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
            fs.createReadStream(candidate).pipe(res);
            return;
          }
        }
        next();
      });
    }
  };
}
