<script setup lang="ts">
/**
 * 门户面板卡片：细边框 + 直角 + 标题行（色块 + 标题 + 右侧「更多>>」）
 * 对应参考站 ui/RCard
 */
import { withBase } from "vitepress";

withDefaults(
  defineProps<{
    title?: string;
    /**
     * 标题前那条 3px 色块的颜色 —— 卡片之间唯一的色相区分点
     *
     * 四支互为不同色相（蓝 / 绿 / 琥珀 / 青），按内容语义分配，不做装饰性轮换。
     * 曾经这里是 primary/blue/green/accent，而 blue 与 primary 是同一个蓝的不同深度
     * （#1d4ed8 / #2563eb），并排根本分不出来；blue 已由 cyan 取代。
     * 注意 --ayo-blue 这个 token 仍在（列表里的日期、篇数等小字用它），它不再是卡片色块色。
     */
    tone?: "primary" | "green" | "accent" | "cyan";
    /** 右侧「更多」链接；不传则不渲染，避免出现死链 */
    moreHref?: string;
    moreText?: string;
    moreTitle?: string;
    /** 标题右侧的说明文字（如「共 3 篇」） */
    note?: string;
    /** 内边距档位：default = 10px，wide = 14/16px */
    pad?: "default" | "wide";
  }>(),
  {
    tone: "primary",
    moreText: "更多>>",
    pad: "default",
  }
);
</script>

<template>
  <section class="ayo-card" :class="[`ayo-card--${tone}`, { 'ayo-card--wide': pad === 'wide' }]">
    <header v-if="title || note || moreHref || $slots.action" class="ayo-card__hd">
      <span class="ayo-card__square" aria-hidden="true"></span>
      <h3 v-if="title" class="ayo-card__title">{{ title }}</h3>
      <span v-if="note" class="ayo-card__note">{{ note }}</span>
      <a
        v-if="moreHref"
        class="ayo-card__more"
        :href="withBase(moreHref)"
        :title="moreTitle || moreText"
        >{{ moreText }}</a
      >
      <slot name="action" />
    </header>
    <div class="ayo-card__bd">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.ayo-card {
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  padding: 11px;
  box-shadow: var(--ayo-shadow);
  transition:
    border-color var(--ayo-transition),
    box-shadow var(--ayo-transition);
}

.ayo-card--wide {
  padding: 14px 16px;
}

.ayo-card__hd {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 7px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--ayo-line);
}

/* 标题前的标记：一条细竖条（原来的 9px 方块太「门户」） */
.ayo-card__square {
  flex-shrink: 0;
  width: 3px;
  height: 12px;
  background-color: var(--ayo-primary);
}

/* 卡片标题是「标签」不是「内容」：字号保持比条目标题（14px）小一档，
   但一律转近黑——以前认 tone 上蓝/绿/琥珀，一栏五张卡就有五处蓝字在抢注意力。
   层次改由标题前那条 3px 色块承担，色块才是 tone 的作用点。 */
.ayo-card__title {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--ayo-heading);
}

.ayo-card__note {
  margin-left: auto;
  font-size: 12px;
  color: var(--ayo-text-4);
}

.ayo-card__note + .ayo-card__more {
  margin-left: 0;
}

.ayo-card__more {
  margin-left: auto;
  font-size: 12px;
  font-weight: normal;
  color: var(--ayo-link);
  text-decoration: none;
}

.ayo-card__more:hover {
  color: var(--ayo-link-hover);
}

/* tone 只决定色块颜色；标题颜色已统一为 --ayo-heading，见上。
   四支色相各自对应的语义写在 card.vue 的 props 注释里 */
.ayo-card--green .ayo-card__square {
  background-color: var(--ayo-green);
}

.ayo-card--accent .ayo-card__square {
  background-color: var(--ayo-amber);
}

.ayo-card--cyan .ayo-card__square {
  background-color: var(--ayo-cyan);
}
</style>
