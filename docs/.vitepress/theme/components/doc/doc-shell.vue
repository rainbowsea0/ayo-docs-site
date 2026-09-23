<script setup lang="ts">
/**
 * 文档族三栏骨架（doc / wiki / announcement / project 共用）
 *
 * 只做两件事：栅格（左栏插槽 + 正文插槽 + 右栏目录）、决定要不要显示左右栏。
 * 页内目录的采集与高亮在 composables/use-toc 里，这里不碰 DOM。
 *
 * props 说明：
 *   - announce：公告版式（单栏白纸，没有左栏，正文卡片由 announce.css 排版）
 *   - locked：正文处于锁定截断状态，此时不显示页内目录（目录会指向看不见的章节）
 */
import { computed } from "vue";
import { AyoCard } from "@theme/components/common";
import { useToc } from "@theme/composables/use-toc";

const props = withDefaults(defineProps<{ announce?: boolean; locked?: boolean }>(), {
  announce: false,
  locked: false,
});

const { items: tocItems, activeSlug, hasToc, setActive } = useToc();

const showToc = computed(() => hasToc.value && !props.announce && !props.locked);
</script>

<template>
  <div class="ayo-doc" :class="{ 'ayo-doc--announce': announce }">
    <div class="ayo-doc__grid" :class="{ 'ayo-doc__grid--no-toc': !showToc }">
      <aside v-if="!announce" class="ayo-doc__side">
        <slot name="side" />
      </aside>

      <main class="ayo-doc__main">
        <slot />
      </main>

      <aside v-if="showToc" class="ayo-doc__toc">
        <AyoCard title="目录">
          <ul class="ayo-list">
            <li v-for="item in tocItems" :key="item.href">
              <a
                class="ayo-doc__toc-link"
                :class="[
                  `ayo-doc__toc-link--${item.level}`,
                  { 'is-active': activeSlug === item.href.slice(1) },
                ]"
                :href="item.href"
                :title="item.text"
                @click="setActive(item.href)"
                >{{ item.text }}</a
              >
            </li>
          </ul>
        </AyoCard>
      </aside>
    </div>
  </div>
</template>
