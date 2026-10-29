import type { AstroIntegration } from "astro";
import { createIndex, close } from "pagefind";
import path from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".wasm": "application/wasm"
};

// Index the actual dev-rendered articles, using the same markup as production.
export function devSearch(): AstroIntegration {
  let origin = "";
  let pending: Promise<Map<string, Uint8Array>> | undefined;
  let reloadTimer: ReturnType<typeof setTimeout> | undefined;

  return {
    name: "dev-search",
    hooks: {
      "astro:server:start": ({ address }) => {
        const host = address.address.includes(":")
          ? `[${address.address === "::" ? "::1" : address.address}]`
          : address.address === "0.0.0.0"
          ? "127.0.0.1"
          : address.address;
        origin = `http://${host}:${address.port}`;
      },
      "astro:server:setup": ({ server, logger }) => {
        async function buildIndex() {
          logger.info("正在为开发模式生成搜索索引…");
          const { getPosts, getPostUrlSlug } = (await server.ssrLoadModule(
            "/src/utils/posts.ts"
          )) as typeof import("../utils/posts");
          const routes: string[] = [];
          for (const language of ["en", "zh"]) {
            for (const post of await getPosts(language)) {
              if (post.id === "index.md") continue;
              routes.push(
                `/posts/${language === "zh" ? "zh/" : ""}${getPostUrlSlug(post)}/`
              );
            }
          }

          const { index, errors } = await createIndex({ forceLanguage: "zh" });
          if (!index || errors.length) throw new Error(errors.join("\n"));
          try {
            // Limit concurrent Astro renders, especially on a cold dev server.
            for (let offset = 0; offset < routes.length; offset += 4) {
              await Promise.all(
                routes.slice(offset, offset + 4).map(async (url) => {
                  const response = await fetch(new URL(url, origin), {
                    signal: AbortSignal.timeout(30000)
                  });
                  if (!response.ok)
                    throw new Error(`无法读取文章 ${url}: ${response.status}`);
                  const result = await index.addHTMLFile({
                    url,
                    content: await response.text()
                  });
                  if (result.errors.length) throw new Error(result.errors.join("\n"));
                })
              );
            }
            const result = await index.getFiles();
            if (result.errors.length) throw new Error(result.errors.join("\n"));
            logger.info(`开发搜索索引已更新：${routes.length} 篇文章`);
            return new Map(result.files.map((file) => [file.path, file.content]));
          } finally {
            await index.deleteIndex();
          }
        }

        server.middlewares.use(async (req, res, next) => {
          const pathname = new URL(req.url || "/", "http://localhost").pathname;
          if (!pathname.startsWith("/pagefind/")) return next();
          try {
            if (!pending) {
              const build = buildIndex();
              pending = build;
              void build.catch(() => {
                if (pending === build) pending = undefined;
              });
            }
            const files = await pending;
            const file = files.get(pathname.slice("/pagefind/".length));
            res.setHeader("Cache-Control", "no-store");
            if (!file) {
              res.statusCode = 404;
              return res.end("Search asset not found");
            }
            res.setHeader(
              "Content-Type",
              CONTENT_TYPES[path.extname(pathname)] || "application/octet-stream"
            );
            res.end(Buffer.from(file));
          } catch (error) {
            logger.error(error instanceof Error ? error.message : String(error));
            res.statusCode = 503;
            res.end("Dev search index could not be generated. See terminal output.");
          }
        });

        const invalidate = (file: string) => {
          const relative = path
            .relative(server.config.root, file)
            .split(path.sep)
            .join("/");
          if (
            !/^src\/(content\/.*\.md|layouts\/.*\.astro|plugins\/.*\.ts|utils\/posts\.ts)$/.test(
              relative
            )
          )
            return;
          clearTimeout(reloadTimer);
          reloadTimer = setTimeout(() => {
            pending = undefined;
            server.ws.send({ type: "full-reload" });
          }, 200);
        };
        server.watcher.on("add", invalidate);
        server.watcher.on("change", invalidate);
        server.watcher.on("unlink", invalidate);
      },
      "astro:server:done": async () => {
        clearTimeout(reloadTimer);
        await pending?.catch(() => undefined);
        await close();
      }
    }
  };
}
