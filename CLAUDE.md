# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog website built with Astro, Vue 3, and UnoCSS. It supports bilingual content (English and Chinese) and is deployed to GitHub Pages.

## Common Commands

All commands use pnpm (specified in packageManager field):

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm serve

# Format code
pnpm format

# Lint code (runs format + eslint)
pnpm lint
```

## Architecture

### Framework Stack

- **Astro**: Static site generator (v5.6.0)
- **Vue 3**: Interactive components with client hydration
- **UnoCSS**: Atomic CSS engine for styling
- **TypeScript**: Strict mode enabled

### Project Structure

```
src/
├── components/     # Vue and Astro components
│   ├── *.vue      # Interactive components (Navbar, Giscus, ToggleToc, Project)
│   └── *.astro    # Static components (Footer, Links, FlipImage, ToggleLang)
├── layouts/        # Astro layout templates
│   ├── Layout.astro    # Base layout with head meta, navbar, footer
│   ├── Post.astro      # Blog post layout with TOC, tags, prev/next navigation
│   ├── PostList.astro  # List of posts grouped by year
│   ├── About.astro     # About page layout
│   └── Projects.astro  # Projects showcase layout
├── pages/          # Astro file-based routing
│   ├── index.md        # About/home page
│   ├── projects.md     # Projects page
│   ├── rss.xml.ts      # RSS feed generation
│   └── posts/          # Blog routes
│       ├── index.astro           # Post list (English)
│       ├── [slug].astro          # Individual post (English)
│       ├── zh/                   # Chinese post list and posts
│       └── tags/                 # Tag filtering pages
├── content/        # Astro content collections
│   ├── blog/       # Blog posts in Markdown
│   │   ├── *.md              # English posts
│   │   └── zh/*.md           # Chinese posts
│   ├── tags/       # Tag definitions
│   ├── _schemas.ts # Zod schemas for content validation
│   └── config.ts   # Content collection configuration
├── composables/    # Vue composables (auto-imported)
│   └── dark.ts     # Dark mode state (useDark, useToggle)
├── utils/          # Utility functions
│   ├── posts.ts    # Post filtering, sorting, grouping by year
│   ├── tags.ts     # Tag-related utilities
│   ├── readingTime.ts  # Reading time calculation
│   └── others.ts   # Date formatting, etc.
├── config.ts       # Site configuration (SITE, THEME, GISCUS)
└── types.ts        # TypeScript type definitions
```

### Content Management

Blog posts are stored as Markdown files in `src/content/blog/`:

- **English posts**: `src/content/blog/*.md` (e.g., `2023-12-24-new-homepage.md`)
- **Chinese posts**: `src/content/blog/zh/*.md` (e.g., `zh/2026-02-15-how-do-i-use-wechat-2026.md`)

Frontmatter schema (defined in `src/content/_schemas.ts`):
```yaml
---
title: string          # Required
date: 2023-12-24       # Optional, extracted from filename if not provided
tags: [tag1, tag2]     # Optional
draft: false           # Optional, drafts are excluded from build
author: string         # Optional
---
```

Post date is extracted from filename prefix (first 10 chars) via `getPostDate()` in `src/utils/posts.ts`.

### Routing Structure

- `/` - About page
- `/projects` - Projects showcase
- `/posts` - English blog post list
- `/posts/[slug]` - Individual English blog post
- `/posts/zh` - Chinese blog post list
- `/posts/zh/[slug]` - Individual Chinese blog post
- `/posts/tags/[tag]` - Posts filtered by tag (both languages)
- `/rss.xml` - RSS feed

### Styling System

Uses UnoCSS with custom shortcuts defined in `unocss.config.ts`:

- `flex-center` - Center with flexbox
- `hstack/vstack` - Horizontal/vertical flex layouts
- `text-c` - Theme-aware text color
- `bg-c` - Theme-aware background color
- `border-c` - Theme-aware border color
- `btn` - Button styling
- `prose prose-lg` - Typography from presetTypography

Colors:
- `brand`: #1772d0 (blue)
- `softGray`: #f1f0ea (light background)

Dark mode is handled via `class="dark"` on HTML element, using VueUse's `useDark()` composable.

### Auto-imports

Configured in `astro.config.ts` using `unplugin-auto-import`:

- Vue APIs (`ref`, `computed`, etc.) are auto-imported
- `@vueuse/core` and `@vueuse/head` APIs are auto-imported
- Composables in `src/composables/` are auto-imported
- Generated types are in `src/auto-imports.d.ts`

### Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@/*` maps to `src/*`

Used for imports like `import { getPosts } from "@utils"`.

## Configuration Files

- `astro.config.ts` - Astro configuration with integrations (Vue, UnoCSS, Sitemap, Auto-import)
- `unocss.config.ts` - UnoCSS configuration with custom theme and shortcuts
- `.eslintrc.js` - ESLint with TypeScript, Astro, and Vue support
- `.prettierrc` - Prettier with printWidth 90, no trailing commas
- `src/config.ts` - Site metadata (SITE.website, SITE.title, etc.)

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yaml`) builds and deploys to GitHub Pages on push to main branch. Uses pnpm 7 and Node 16.

## Adding New Blog Posts

1. Create Markdown file in `src/content/blog/` (English) or `src/content/blog/zh/` (Chinese)
2. Filename format: `YYYY-MM-DD-title.md`
3. Add frontmatter with title, optional tags, draft status
4. Run `pnpm build` to verify

## Key Dependencies

- `@astrojs/vue` - Vue integration
- `@astrojs/rss` - RSS feed generation
- `@astrojs/sitemap` - Sitemap generation
- `@vueuse/core` - Vue utility library
- `remark-toc` - Table of contents generation
- `dayjs` - Date formatting
