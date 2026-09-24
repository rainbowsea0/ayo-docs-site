<script setup lang="ts">
/**
 * 悬浮操作（跳转评论 / 返回顶部）
 *
 * 结构对齐参考站 FloatingActions；按本项目 UI 规范去掉圆形，改为直角方块。
 *
 * 显示规则：
 *   - 滚过阈值后这组工具才出现（页面顶部不需要它）；
 *   - 「跳转评论」还要求当前页真的有评论区（.ayo-comments，见 common/giscus-comment.vue）——
 *     首页、404、以及以后关掉评论的页面不该出现一个点了没反应的按钮；
 *   - 评论区已经进视口时也收起，免得点了原地不动。
 *
 * 找评论区用 class 而不是 <Giscus> 上的 id="comments"：后者是 giscus 自己的容器标识，
 * 且要等组件挂载（懒加载）后才有这个元素，冷启动时探测会扑空。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vitepress";

const SHOW_THRESHOLD = 320;

/** 评论区容器（giscus-comment.vue 的根节点） */
const COMMENTS_SELECTOR = ".ayo-comments";

const route = useRoute();

/** 滚过阈值：这组按钮整体出现 */
const scrolled = ref(false);
/** 当前页有评论区 */
const hasComments = ref(false);
/** 评论区已经在视口里 */
const commentsInView = ref(false);

let observer: IntersectionObserver | null = null;

const showJump = computed(() => scrolled.value && hasComments.value && !commentsInView.value);

const onScroll = (): void => {
  scrolled.value = window.scrollY > SHOW_THRESHOLD;
};

/** 路由切换后正文是另一批 DOM 节点，观察目标要重新认领 */
const syncComments = (): void => {
  observer?.disconnect();
  observer = null;
  commentsInView.value = false;

  const el = document.querySelector<HTMLElement>(COMMENTS_SELECTOR);
  hasComments.value = Boolean(el);
  if (!el || typeof IntersectionObserver === "undefined") return;

  observer = new IntersectionObserver((entries) => {
    commentsInView.value = entries.some((entry) => entry.isIntersecting);
  });
  observer.observe(el);
};

const scrollToComments = (): void => {
  document
    .querySelector<HTMLElement>(COMMENTS_SELECTOR)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  onScroll();
  syncComments();
  window.addEventListener("scroll", onScroll, { passive: true });
});

// 新页面的正文要等这一帧渲染完才在 DOM 里，所以放到 nextTick 之后再去认评论区
watch(
  () => route.path,
  () => {
    nextTick(syncComments);
  }
);

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <div class="ayo-float">
    <button
      v-show="showJump"
      class="ayo-float__btn"
      type="button"
      title="跳转评论"
      aria-label="跳转评论"
      @click="scrollToComments"
    >
      <svg
        class="ayo-float__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>

    <button
      v-show="scrolled"
      class="ayo-float__btn"
      type="button"
      title="返回顶部"
      aria-label="返回顶部"
      @click="scrollToTop"
    >
      <svg
        class="ayo-float__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.ayo-float {
  position: fixed;
  right: 20px;
  bottom: 32px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ayo-float__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--ayo-primary-solid-active);
  background-color: var(--ayo-primary-solid);
  color: #fff;
  cursor: pointer;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.15);
}

.ayo-float__btn:hover {
  background-color: var(--ayo-primary-solid-hover);
}

.ayo-float__icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .ayo-float {
    right: 14px;
    bottom: 22px;
  }

  .ayo-float__btn {
    width: 36px;
    height: 36px;
  }
}
</style>
