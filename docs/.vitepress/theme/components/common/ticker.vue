<script setup lang="ts">
/**
 * 免责声明/要闻滚动条：老门户首页顶部那条黄底字跑马灯
 * 对应参考站 ui/RTicker；条目类型放在 ./types（.vue 里 export 类型 TS 看不到）
 */
import type { TickerItem } from "./types";
import { withBase } from "vitepress";

withDefaults(
  defineProps<{
    items: TickerItem[];
    label?: string;
    moreUrl?: string;
    moreText?: string;
    /** 右侧固定「更多」按钮（不做跑马灯内嵌链接） */
    moreFixed?: boolean;
  }>(),
  {
    label: "今日要闻",
    moreUrl: "/posts/",
    moreText: "更多精彩内容，请进入文章频道……",
    moreFixed: false,
  }
);
</script>

<template>
  <div class="ayo-ticker">
    <span class="ayo-ticker__label">{{ label }}</span>

    <div class="ayo-ticker__viewport">
      <div class="ayo-ticker__track">
        <!-- 复制两组，配合 translateX(-50%) 实现无缝循环 -->
        <div v-for="group in 2" :key="group" class="ayo-ticker__group" :aria-hidden="group === 2">
          <a
            v-for="item in items"
            :key="`${group}-${item.url}`"
            class="ayo-ticker__item"
            :href="withBase(item.url)"
            >★ {{ item.text }}</a
          >
          <a v-if="!moreFixed" class="ayo-ticker__item" :href="withBase(moreUrl)"
            >★ {{ moreText }}</a
          >
        </div>
      </div>
    </div>

    <a
      v-if="moreFixed && moreUrl"
      class="ayo-ticker__more"
      :href="withBase(moreUrl)"
      :title="moreText"
      >{{ moreText }} »</a
    >
  </div>
</template>

<style scoped>
.ayo-ticker {
  display: flex;
  align-items: stretch;
  margin: 16px 0;
  border: 1px solid var(--ayo-border);
  background-color: var(--ayo-bg-band);
}

.ayo-ticker__label {
  flex-shrink: 0;
  padding: 0 16px;
  background-color: var(--ayo-primary);
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  line-height: 34px;
  letter-spacing: 1px;
}

.ayo-ticker__viewport {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  line-height: 34px;
}

.ayo-ticker__track {
  display: flex;
  width: max-content;
  animation: ayo-ticker 36s linear infinite;
}

.ayo-ticker:hover .ayo-ticker__track {
  animation-play-state: paused;
}

.ayo-ticker__group {
  display: flex;
  flex-shrink: 0;
  padding: 0 10px;
}

.ayo-ticker__more {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 0 16px;
  border-left: 1px dashed var(--ayo-line);
  color: var(--ayo-primary);
  font-size: 13px;
  font-weight: bold;
  line-height: 34px;
  white-space: nowrap;
  text-decoration: none;
}

.ayo-ticker__more:hover {
  color: var(--ayo-link-hover);
}

.ayo-ticker__item {
  margin-right: 32px;
  color: var(--ayo-text);
  font-size: 13px;
  text-decoration: none;
  white-space: nowrap;
}

/* 取消「看过变灰」：公告滚动也是清单一类，颜色只由 hover 表达
   （条目名本来就是近黑 --ayo-text，蓝色留给「更多>>」这类单点动作） */
.ayo-ticker__item:visited {
  color: var(--ayo-text);
}

.ayo-ticker__item:hover {
  color: var(--ayo-primary);
}

@keyframes ayo-ticker {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 640px) {
  .ayo-ticker__label {
    padding: 0 8px;
    font-size: 13px;
  }

  .ayo-ticker__track {
    animation-duration: 24s;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ayo-ticker__track {
    animation: none;
  }
}
</style>
