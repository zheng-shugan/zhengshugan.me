# AGENTS.md

## Commands

```bash
pnpm install          # install dependencies
pnpm dev              # start dev server
pnpm build            # production build (outputs to dist/)
pnpm serve            # preview production build locally
pnpm lint             # runs prettier --write THEN eslint
pnpm format           # prettier --write only (src/**/*.astro src/pages/posts/*)
```

No test suite exists. Lint is the only verification step. Run `pnpm lint` before committing.

## Content

Blog posts are Markdown files with frontmatter:

- English: `src/content/blog/YYYY-MM-DD-title.md`
- Chinese: `src/content/blog/zh/YYYY-MM-DD-title.md`

Frontmatter schema (`src/content/_schemas.ts`): `title` (required), `date` (optional, extracted from filename if missing), `tags` (optional array), `draft` (optional boolean), `author` (optional). Schema is `.strict()` — no extra fields allowed.

## Styling

UnoCSS (atomic CSS). Key shortcuts defined in `unocss.config.ts`:

- `flex-center`, `hstack`, `vstack` — layout helpers
- `text-c`, `bg-c`, `border-c` — theme-aware colors (light/dark)
- `btn`, `nav-item` — component patterns
- `prose`, `prose-lg` — typography

Dark mode: VueUse `useDark()` / `useToggle()` from `src/composables/dark.ts`. Toggled via `class="dark"` on `<html>`.

## Auto-imports

Configured via `unplugin-auto-import` in `astro.config.ts`:

- Vue APIs (`ref`, `computed`, etc.) — no import needed
- `@vueuse/core`, `@vueuse/head` — no import needed
- Composables in `src/composables/` — no import needed

Generated type declarations: `src/auto-imports.d.ts`.

## Path alias

`@/*` maps to `src/*` (tsconfig.json).

## Code style

- Prettier: `printWidth: 90`, no trailing commas
- ESLint: TypeScript + Astro + Vue overrides (see `.eslintrc.js`)
- `.editorconfig`: 2-space indent, LF line endings

## Deployment

GitHub Actions (`/.github/workflows/deploy.yaml`) builds on push to `main` and deploys to GitHub Pages (CNAME: `zxh.io`). CI uses pnpm 7 and Node 16.

## Key files

- `src/config.ts` — site metadata, Giscus config
- `astro.config.ts` — integrations, markdown plugins, shiki theme
- `unocss.config.ts` — theme, shortcuts, presets
- `src/content/_schemas.ts` — blog frontmatter validation
