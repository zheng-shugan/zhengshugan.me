<template>
  <button
    type="button"
    class="nav-item search-trigger"
    title="搜索文章（⌘/Ctrl+K）"
    aria-label="搜索文章"
    aria-haspopup="dialog"
    aria-controls="blog-search"
    @click="openSearch"
  >
    <span i-carbon:search aria-hidden="true" />
  </button>

  <Teleport to="body">
    <dialog
      id="blog-search"
      ref="dialog"
      class="search-dialog bg-c text-c font-sans"
      lang="zh"
      aria-labelledby="search-title"
      @close="onClose"
      @click="onBackdropClick"
      @keydown.esc="onEscape"
      @cancel="onCancel"
    >
      <header class="search-header border-c">
        <div>
          <h2 id="search-title">搜索文章</h2>
          <p>在中英文博客中查找标题、标签和正文</p>
        </div>
        <button
          type="button"
          class="search-close"
          aria-label="关闭搜索"
          @click="closeSearch"
        >
          <span i-carbon:close aria-hidden="true" />
        </button>
      </header>

      <form class="search-form" role="search" @submit.prevent="retry">
        <label class="search-label" for="blog-search-input">关键词</label>
        <input
          id="blog-search-input"
          ref="input"
          v-model="query"
          type="search"
          placeholder="搜索文章…"
          autocomplete="off"
          enterkeyhint="search"
          aria-describedby="search-status"
          @compositionstart="onCompositionStart"
          @compositionend="onCompositionEnd"
        />
      </form>

      <div class="search-content" :aria-busy="loading">
        <p id="search-status" class="search-status" role="status" aria-live="polite">
          {{ status }}
        </p>
        <div v-if="failed" class="search-error">
          <p v-if="isDev">
            本地搜索需要构建索引，请运行 <code>pnpm build &amp;&amp; pnpm serve</code>
            后在预览站点打开搜索。
          </p>
          <button type="button" class="search-action border-c" @click="retry">
            重试
          </button>
        </div>
        <ol v-if="results.length" class="search-results">
          <li v-for="result in results" :key="result.url" class="border-c">
            <a :href="result.url" class="search-result">
              <h3>{{ result.meta.title }}</h3>
              <p class="search-meta">
                {{ result.meta.language === "zh" ? "中文" : "English" }}
                <span aria-hidden="true"> · </span>
                <time :datetime="result.meta.date">{{ result.meta.date }}</time>
              </p>
              <p class="search-excerpt">
                <template v-for="(part, index) in result.parts" :key="index">
                  <mark v-if="part.highlight">{{ part.text }}</mark>
                  <template v-else>{{ part.text }}</template>
                </template>
              </p>
            </a>
          </li>
        </ol>
        <button
          v-if="!failed && results.length < matches.length"
          type="button"
          class="search-action search-more border-c"
          :disabled="loading"
          @click="loadMore()"
        >
          {{ loading ? "加载中…" : "加载更多" }}
        </button>
      </div>
      <footer class="search-footer border-c">
        按 Esc 关闭 · Tab 切换结果 · Enter 打开文章
      </footer>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

interface SearchData {
  url: string;
  excerpt: string;
  meta: { title: string; language: string; date: string };
}
interface SearchMatch {
  data: () => Promise<SearchData>;
}
interface SearchEngine {
  init: () => Promise<void>;
  search: (query: string) => Promise<{ results: SearchMatch[] }>;
}
interface ExcerptPart {
  text: string;
  highlight: boolean;
}

const isDev = import.meta.env.DEV;
const dialog = ref<HTMLDialogElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
const query = ref("");
const matches = ref<SearchMatch[]>([]);
const results = ref<(SearchData & { parts: ExcerptPart[] })[]>([]);
const loading = ref(false);
const failed = ref(false);
const composing = ref(false);
let enginePromise: Promise<SearchEngine> | undefined;
let importAttempt = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let requestId = 0;
let previousFocus: HTMLElement | null = null;
let previousOverflow = "";
let scrollLocked = false;

const status = computed(() => {
  if (failed.value) return "搜索加载失败，请检查网络后重试。";
  if (loading.value) return "正在搜索…";
  if (!query.value.trim()) return "输入关键词，查找你想读的文章。";
  if (!matches.value.length) return "没有找到相关文章，试试其他关键词。";
  return `找到 ${matches.value.length} 篇文章，已显示 ${results.value.length} 篇。`;
});

async function getEngine() {
  if (!enginePromise) {
    // Generated after Astro builds; Vite must leave this URL for the browser.
    const attempt = importAttempt++;
    // Failed module fetches are cached by browsers; retry with a fresh module URL.
    const url = `/pagefind/pagefind.js${attempt ? `?retry=${attempt}` : ""}`;
    enginePromise = (async () => {
      const engine: SearchEngine = await import(/* @vite-ignore */ url);
      await engine.init();
      return engine;
    })().catch((error: unknown) => {
      enginePromise = undefined;
      throw error;
    });
  }
  return enginePromise;
}

// Render only text and highlight markers, never arbitrary HTML from article excerpts.
function excerptParts(excerpt: string): ExcerptPart[] {
  const document = new DOMParser().parseFromString(excerpt, "text/html");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const parts: ExcerptPart[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    parts.push({
      text: node.textContent || "",
      highlight: !!node.parentElement?.closest("mark")
    });
  }
  return parts;
}

async function loadMore(id = requestId) {
  loading.value = true;
  try {
    const batch = await Promise.all(
      matches.value
        .slice(results.value.length, results.value.length + 10)
        .map(async (match) => {
          const data = await match.data();
          return { ...data, parts: excerptParts(data.excerpt) };
        })
    );
    if (id === requestId) results.value.push(...batch);
  } catch {
    if (id === requestId) {
      enginePromise = undefined;
      failed.value = true;
    }
  } finally {
    if (id === requestId) loading.value = false;
  }
}

async function search(id: number) {
  try {
    const engine = await getEngine();
    if (id !== requestId) return;
    if (!query.value.trim()) return;
    const response = await engine.search(query.value.trim());
    if (id !== requestId) return;
    matches.value = response.results;
    await loadMore(id);
  } catch {
    if (id === requestId) {
      enginePromise = undefined;
      failed.value = true;
    }
  } finally {
    if (id === requestId) loading.value = false;
  }
}

function scheduleSearch(delay = 200) {
  clearTimeout(timer);
  const id = ++requestId;
  matches.value = [];
  results.value = [];
  failed.value = false;
  loading.value = !composing.value;
  if (!composing.value) timer = setTimeout(() => void search(id), delay);
}

function retry() {
  scheduleSearch(0);
}

function onCompositionStart() {
  composing.value = true;
  scheduleSearch();
}

function onCompositionEnd(event: CompositionEvent) {
  composing.value = false;
  query.value = (event.target as HTMLInputElement).value;
  scheduleSearch();
}

async function openSearch() {
  if (!dialog.value || dialog.value.open) return;
  previousFocus = document.activeElement as HTMLElement | null;
  previousOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";
  scrollLocked = true;
  dialog.value.showModal();
  await nextTick();
  input.value?.focus();
  scheduleSearch(0);
}

function closeSearch() {
  dialog.value?.close();
}

function onEscape(event: KeyboardEvent) {
  if (composing.value || event.isComposing) return;
  // Search inputs otherwise consume the first Escape to clear their value.
  event.preventDefault();
  closeSearch();
}

function onCancel(event: Event) {
  if (composing.value) event.preventDefault();
}

function onClose() {
  clearTimeout(timer);
  requestId++;
  if (scrollLocked) document.documentElement.style.overflow = previousOverflow;
  scrollLocked = false;
  previousFocus?.focus({ preventScroll: true });
}

function onBackdropClick(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return;
  const rect = dialog.value.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    closeSearch();
}

function onShortcut(event: KeyboardEvent) {
  if (
    (event.metaKey || event.ctrlKey) &&
    event.key.toLowerCase() === "k" &&
    !event.isComposing
  ) {
    event.preventDefault();
    void openSearch();
  }
}

watch(query, () => {
  if (dialog.value?.open) scheduleSearch();
});
onMounted(() => document.addEventListener("keydown", onShortcut));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onShortcut);
  dialog.value?.close();
  onClose();
});
</script>

<style scoped>
.search-trigger {
  min-width: 1.5rem;
  min-height: 2.5rem;
  justify-content: center;
}
.search-dialog {
  width: min(42rem, calc(100% - 2rem));
  max-height: calc(100vh - 4rem);
  max-height: calc(100dvh - 4rem);
  margin: 2rem auto auto;
  padding: 0;
  border: 1px solid;
  @apply border-c;
  border-radius: 1rem;
  box-shadow: 0 20px 80px rgb(0 0 0 / 20%);
  overflow: hidden;
  text-align: left;
  color-scheme: light;
}
:global(html.dark .search-dialog) {
  color-scheme: dark;
}
.search-dialog[open] {
  display: flex;
  flex-direction: column;
}
.search-dialog::backdrop {
  background: rgb(0 0 0 / 45%);
}
.search-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom-width: 1px;
  flex-shrink: 0;
}
.search-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}
.search-header p,
.search-meta,
.search-footer,
.search-status {
  font-size: 0.875rem;
  opacity: 0.7;
}
.search-header p {
  margin: 0.25rem 0 0;
}
.search-close {
  display: grid;
  place-items: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  border-radius: 0.5rem;
}
.search-form {
  padding: 1rem 1.25rem 0;
  flex-shrink: 0;
}
.search-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}
.search-form input {
  width: 100%;
  min-width: 0;
  padding: 0.75rem;
  font: inherit;
  font-size: 16px;
  background: transparent;
  border: 1px solid;
  @apply border-c-dark;
  border-radius: 0.5rem;
}
.search-form input:focus-visible {
  outline: 2px solid #1772d0;
  outline-offset: 2px;
}
.search-content {
  padding: 0 1.25rem 1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  overflow-wrap: anywhere;
  min-height: 0;
}
.search-status {
  margin: 1rem 0;
}
.search-results {
  padding: 0;
  margin: 0;
  list-style: none;
}
.search-results li + li {
  border-top-width: 1px;
}
.search-result {
  display: block;
  padding: 1rem 0.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
}
.search-result:focus-visible {
  outline-offset: -2px;
}
.search-result h3 {
  font-size: 1.0625rem;
  font-weight: 700;
  margin: 0;
}
.search-meta {
  margin: 0.375rem 0;
}
.search-excerpt {
  margin: 0;
  line-height: 1.7;
  font-size: 0.9375rem;
}
.search-excerpt mark {
  color: inherit;
  background: rgb(234 179 8 / 25%);
  border-radius: 0.15rem;
}
.search-action {
  padding: 0.625rem 1rem;
  border-width: 1px;
  border-radius: 0.5rem;
}
.search-action:disabled {
  opacity: 0.5;
}
.search-more {
  display: block;
  margin: 1rem auto 0;
}
.search-footer {
  padding: 0.75rem 1.25rem;
  border-top-width: 1px;
  flex-shrink: 0;
}
button,
.search-result {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
button {
  user-select: none;
}
button:active,
.search-result:active {
  background: rgb(127 127 127 / 15%);
}
@media (hover: hover) and (pointer: fine) {
  .search-close:hover,
  .search-action:hover,
  .search-result:hover {
    background: rgb(127 127 127 / 10%);
  }
}
@media (max-width: 640px) {
  .search-dialog {
    margin-top: 1rem;
    max-height: calc(100vh - 2rem);
    max-height: calc(100dvh - 2rem);
  }
}
</style>
