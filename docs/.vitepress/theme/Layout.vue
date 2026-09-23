<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useData, withBase } from "vitepress";
import { AyoFloatingActions, AyoFooter, AyoHeader } from "@theme/components/portal";
import AyoDocLayout from "@theme/layout/doc/index.vue";
import { FEEDBACK_MAIL } from "@theme/settings/site";

const { frontmatter, page } = useData();

const layoutName = computed(() => {
  const value = frontmatter.value.layout;
  return typeof value === "string" ? value : "";
});

const feedbackUrl = `mailto:${FEEDBACK_MAIL}?subject=${encodeURIComponent("站点反馈")}`;

const isNotFound = computed(() => Boolean((page.value as { isNotFound?: boolean }).isNotFound));

/** 页头高度写入 CSS 变量，供吸顶侧栏与锚点避让使用 */
const headerEl = ref<HTMLElement | null>(null);
let observer: ResizeObserver | null = null;

const syncHeaderHeight = (): void => {
  if (!headerEl.value) return;
  document.documentElement.style.setProperty("--ayo-header-h", `${headerEl.value.offsetHeight}px`);
};

onMounted(() => {
  syncHeaderHeight();
  if (headerEl.value && typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(headerEl.value);
  }
  window.addEventListener("resize", syncHeaderHeight);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  window.removeEventListener("resize", syncHeaderHeight);
});
</script>

<template>
  <div ref="headerEl" class="ayo-portal-header">
    <AyoHeader />
  </div>

  <main class="ayo-shell__main">
    <div v-if="isNotFound" class="ayo-404">
      <div class="ayo-404__code">404</div>
      <p class="ayo-404__desc">抱歉，您访问的页面不存在，可能已被移除或网址有误。</p>
      <p class="ayo-404__actions">
        <a class="ayo-404__link" :href="withBase('/')">← 返回首页</a>
        <a class="ayo-404__link" :href="feedbackUrl">向站长反馈</a>
      </p>
    </div>

    <component :is="layoutName" v-else-if="layoutName" />

    <AyoDocLayout v-else />
  </main>

  <AyoFooter />
  <AyoFloatingActions />
</template>

<style scoped>
.ayo-shell__main {
  flex: 1;
}

.ayo-404 {
  max-width: var(--ayo-page-width);
  margin: 40px auto;
  padding: 56px 24px;
  border: 1px solid var(--ayo-border);
  background-color: var(--ayo-bg);
  text-align: center;
}

.ayo-404__code {
  color: var(--ayo-primary);
  font-family: var(--ayo-font-serif), system-ui;
  font-size: 65px;
  font-weight: 900;
  line-height: 1.2;
}

.ayo-404__desc {
  margin: 16px 0 20px;
  color: var(--ayo-text-2);
  font-size: 15px;
}

.ayo-404__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  font-size: 15px;
}

.ayo-404__link {
  color: var(--ayo-link);
}

@media (max-width: 720px) {
  .ayo-404 {
    margin: 20px 12px;
    padding: 36px 16px;
  }

  .ayo-404__code {
    font-size: 49px;
  }
}
</style>
