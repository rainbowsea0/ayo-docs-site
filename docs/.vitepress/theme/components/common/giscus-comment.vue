<script setup lang="ts">
/**
 * 评论区（giscus：讨论存在 GitHub Discussions，访客用 GitHub 账号评论）
 */
import Giscus from "@giscus/vue";
import { useData, useRoute } from "vitepress";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { GISCUS } from "@theme/settings/site";

const route = useRoute();
const { isDark } = useData();

/**
 * giscus 报「这一页还没有讨论」的那条 error 文案（小写后做包含匹配）
 *
 * 这条消息不参与本地化：界面 lang 设成 zh-CN 时它照样是英文，所以能按文案认出来。
 * 用 includes 而不是全等，是为了容忍大小写与标点的微调；真改了措辞也只是退回原来的
 * 「显示报错」，不会把空态错判成失败以外的更坏结果。
 */
const NO_DISCUSSION_HINT = "discussion not found";

/** 挂载后才显示遮罩：静态 HTML 里不留一个「加载中」，无 JS 时也不会挂着一句假提示 */
const mounted = ref(false);
const loading = ref(true);
const errorText = ref("");

const onMessage = (event: MessageEvent): void => {
  if (event.origin !== GISCUS.origin) return;
  const payload = (
    event.data as { giscus?: { resizeHeight?: unknown; error?: unknown } } | null | undefined
  )?.giscus;
  if (!payload) return;

  if (typeof payload.error === "string" && payload.error) {
    // 空态不是失败：撤掉遮罩，把 giscus 自己的评论框（含「发第一条」入口）露出来
    if (payload.error.toLowerCase().includes(NO_DISCUSSION_HINT)) {
      loading.value = false;
      return;
    }
    errorText.value = payload.error;
    loading.value = false;
    return;
  }
  // 第一次 resizeHeight 就说明 iframe 已经渲染出内容了
  if (typeof payload.resizeHeight === "number") loading.value = false;
};

onMounted(() => {
  mounted.value = true;
  window.addEventListener("message", onMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", onMessage);
});

// 换页时组件是被复用的（article-shell 不重挂），加载态要自己复位，否则新页面直接显示「已加载」
watch(
  () => route.path,
  () => {
    loading.value = true;
    errorText.value = "";
  }
);
</script>

<template>
  <section class="ayo-comments" aria-label="评论区">
    <div class="ayo-comments__head">
      <span class="ayo-comments__title">评论</span>
      <span class="ayo-comments__hint">使用 GitHub 账号登录后即可评论</span>
    </div>

    <div class="ayo-comments__body">
      <Giscus
        class="ayo-comments__widget"
        :key="route.path"
        :repo="GISCUS.repo"
        :repo-id="GISCUS.repoId"
        :category="GISCUS.category"
        :category-id="GISCUS.categoryId"
        mapping="pathname"
        strict="0"
        reactions-enabled="1"
        emit-metadata="0"
        input-position="top"
        :theme="isDark ? 'dark' : 'light'"
        lang="zh-CN"
        loading="lazy"
      />

      <div v-if="mounted && (loading || errorText)" class="ayo-comments__mask">
        <template v-if="errorText">
          <span class="ayo-comments__error">评论加载失败：{{ errorText }}</span>
        </template>
        <template v-else>
          <span class="ayo-comments__spinner" aria-hidden="true"></span>
          <span>评论加载中…</span>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ayo-comments {
  margin-top: 28px;
  padding: 12px 14px 14px;
  border: 1px dashed var(--ayo-line);
  background-color: var(--ayo-bg);
  scroll-margin-top: calc(var(--ayo-header-h, 0px) + 24px);
}

.ayo-comments__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 2px 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--ayo-line);
}

.ayo-comments__title {
  color: var(--ayo-text);
  font-size: 14px;
  font-weight: bold;
}

.ayo-comments__hint {
  color: var(--ayo-text-4);
  font-size: 12px;
}

.ayo-comments__body {
  position: relative;
  min-height: 150px;
  margin-top: 12px;
}

.ayo-comments__widget {
  display: block;
}

.ayo-comments__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  background-color: var(--ayo-bg);
  color: var(--ayo-text-4);
  font-size: 12px;
  text-align: center;
}

.ayo-comments__spinner {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border: 2px solid var(--ayo-border);
  border-top-color: var(--ayo-primary);
  animation: ayo-comments-spin 0.8s linear infinite;
}

.ayo-comments__error {
  color: var(--ayo-red);
  word-break: break-word;
}

@keyframes ayo-comments-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ayo-comments__spinner {
    animation-duration: 2.4s;
  }
}

@media (max-width: 720px) {
  .ayo-comments {
    padding: 10px 12px 12px;
  }
}
</style>
