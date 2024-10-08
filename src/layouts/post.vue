<template>
  <Layout class="post">
    <template v-if="isToc" #navbar>
      <button nav-item title="Toggle toc" @click="isTocOpen = !isTocOpen">
        <div v-if="isTocOpen" i-ri:menu-3-line />
        <div v-else i-ri:menu-fold-line />
      </button>
    </template>

    <div prose-lg mx-auto mt-6 mb-8>
      <h1 class="text-4xl font-bold leading-12">{{ title }}</h1>
      <p class="opacity-50 mt-2">
        {{ formatDate(date) }} · {{ readingTime }} min

        <span v-if="tags?.length">
          ·
          <span i-uil:tag-alt mr-1 text-sm />
          <span v-for="(tag, i) in tags" :key="tag">
            <router-link :to="tagURL(tag)" hover:underline>
              {{ tag }}
            </router-link>
            <span v-if="i !== tags.length - 1">, </span>
          </span>
        </span>
      </p>
    </div>

    <article ref="content" :class="isTocOpen && 'toc-open'">
      <RouterView />
    </article>

    <div prose-lg mx-auto mt-16>
      <div class="grid md:grid-cols-2 pb-3 text-[0.95em]">
        <a
          :href="editLink.url"
          title="Edit link"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline text-c-active"
        >
          <span i-tabler:edit w-4.5 h-4.5 align-text-top />
          {{ editLink.text }}
        </a>
        <span text="md:right c-light">
          <span i-ic:round-update w-4.5 h-4.5 />
          {{ lastUpdatedText }} {{ lastUpdated }}
        </span>
      </div>

      <div
        v-if="prevBlog || nextBlog"
        class="grid md:grid-cols-2 pt-3 text-[0.95em] border-t border-c"
      >
        <span class="prev">
          <RouterLink v-if="prevBlog" :to="prevBlog.path" hover:underline>
            {{ prevBlog.title }}
          </RouterLink>
        </span>
        <span class="next text-right">
          <RouterLink v-if="nextBlog" :to="nextBlog.path" hover:underline>
            {{ nextBlog.title }}
          </RouterLink>
        </span>
      </div>

      <!--      <Giscus-->
      <!--        v-if="!disableGiscus"-->
      <!--        :key="router.currentRoute.value.fullPath"-->
      <!--        mt-20-->
      <!--      />-->
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { isClient, slugify } from "@renovamen/utils";
import { formatDate } from "~/utils";
import { lastUpdatedText } from "../../shared";

const router = useRouter();

const meta = computed(() => router.currentRoute.value.meta);
const path = computed(() => router.currentRoute.value.path);

const title = computed(() => meta.value.frontmatter.title);
const tags = computed(() => meta.value.frontmatter.tags);
const disableGiscus = computed(() => meta.value.frontmatter.giscus === false);
const date = computed(() => meta.value.date);
const readingTime = computed(() => meta.value.readingTime.minutes);
const lastUpdated = computed(() => meta.value.lastUpdated);
const editLink = useEditLink();

const prevBlog = computed(() => meta.value.prev);
const nextBlog = computed(() => meta.value.next);

// Navigate to anchors

const content = ref<HTMLDivElement>();

onMounted(() => {
  const navigate = () => {
    if (location.hash) {
      document
        .querySelector(decodeURIComponent(location.hash))
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAnchors = (event: MouseEvent & { target: HTMLElement }) => {
    const link = event.target.closest("a");

    if (
      !event.defaultPrevented &&
      link &&
      event.button === 0 &&
      link.target !== "_blank" &&
      link.rel !== "external" &&
      !link.download &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;

      event.preventDefault();
      const { pathname, hash } = url;
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, "", hash);
        navigate();
      } else {
        router.push({ path: pathname, hash });
      }
    }
  };

  useEventListener(window, "hashchange", navigate);
  useEventListener(content.value!, "click", handleAnchors, { passive: false });

  navigate();
  setTimeout(navigate, 500);
});

// Table of content

const { width } = useWindowSize();
const isTocOpen = ref(width.value > 1200);
const isToc = ref(false);

onMounted(() => {
  const initToc = () =>
    nextTick(() => {
      if (isClient) {
        const toc = document.querySelector(".table-of-contents");
        isToc.value = toc ? true : false;
      }
    });

  initToc();
  watch(path, initToc);
});

// Tags
const lang = useLang();
const tagURL = (tag: string) =>
  lang.value === "en"
    ? `/posts/tags/${slugify(tag)}`
    : `/posts/${lang.value}/tags/${slugify(tag)}`;
</script>

<style scoped>
.prev a::before {
  content: "← ";
}
.next a::after {
  content: " →";
}
</style>
