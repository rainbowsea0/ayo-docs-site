<script setup lang="ts">
/**
 * 频道条（门户导航）
 *
 * 结构对齐参考站的频道条：
 *   - 无 children 的频道：扁平链接
 *   - 有 children 的频道：点击展开二级下拉
 *   - right: true 的频道推到条右端
 *   - ≤640px：只保留前 3 个频道，其余收进「更多」下拉
 *
 * 栏目页尚未建立（内容未迁移），除「首页」「文章」外先用 # 占位；
 * 真实页面建好后替换 link / activeMatch 即可。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, withBase } from "vitepress";
import { useCurrentUrl } from "@theme/composables/use-current-url";
import { AyoButton } from "@theme/components/common";

interface ChannelChild {
  text: string;
  link: string;
}

interface Channel {
  text: string;
  link: string;
  /** 命中高亮的前缀，缺省用 link 本身 */
  activeMatch?: string;
  children?: ChannelChild[];
  right?: boolean;
}

/** 频道条条目：站点导航的唯一事实来源 */
const CHANNELS: Channel[] = [
  { text: "首页", link: "/" },
  { text: "文章", link: "/posts/", activeMatch: "/posts/" },
  { text: "知识库", link: "/wiki/", activeMatch: "/wiki/" },
  // { text: "项目实战", link: "/projects/" },
  { text: "标签", link: "/tags/", activeMatch: "/tags/" },
  {
    text: "更多",
    link: "/extends/nav/",
    activeMatch: "/extends/",
    right: true,
    children: [
      { text: "站点导航", link: "/extends/nav/" },
      { text: "软件工具", link: "/extends/tools/" },
    ],
  },
];

/** ≤640px 时收进「更多」下拉的起始下标（前 3 个保留在条上） */
const COLLAPSE_FROM = 3;

const collapsedChannels = computed(() => CHANNELS.slice(COLLAPSE_FROM));

const route = useRoute();

/** 高亮判定用「去掉 base 的当前路径」：见 useCurrentUrl 的说明 */
const currentUrl = useCurrentUrl();

const dropdownOpen = ref<string | null>(null);
const moreOpen = ref(false);

const isActive = (channel: Channel): boolean => {
  if (channel.link === "#") return false;
  if (channel.link === "/") return currentUrl.value === "/";
  return currentUrl.value.startsWith(channel.activeMatch ?? channel.link);
};

const isLinkActive = (link: string): boolean => link !== "#" && currentUrl.value === link;

const toggleDropdown = (channel: Channel): void => {
  moreOpen.value = false;
  dropdownOpen.value = dropdownOpen.value === channel.text ? null : channel.text;
};

const toggleMore = (): void => {
  dropdownOpen.value = null;
  moreOpen.value = !moreOpen.value;
};

const onDocumentClick = (event: MouseEvent): void => {
  const target = event.target as HTMLElement | null;
  if (dropdownOpen.value && !target?.closest(".ayo-channel__area")) dropdownOpen.value = null;
  if (moreOpen.value && !target?.closest(".ayo-channel__more-area")) moreOpen.value = false;
};

const onDocumentKeydown = (event: KeyboardEvent): void => {
  if (event.key !== "Escape") return;
  dropdownOpen.value = null;
  moreOpen.value = false;
};

/** 路由变化后收起浮层 */
watch(
  () => route.path,
  () => {
    dropdownOpen.value = null;
    moreOpen.value = false;
  }
);

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onDocumentKeydown);
});
</script>

<template>
  <nav class="ayo-channels" aria-label="频道导航">
    <div class="ayo-channels__inner">
      <span
        v-for="channel in CHANNELS"
        :key="channel.text"
        class="ayo-channel__item"
        :class="{
          'ayo-channel__item--right': channel.right,
          'ayo-channel__area': channel.children?.length,
        }"
      >
        <a
          v-if="!channel.children?.length"
          class="ayo-channel"
          :class="{ 'is-active': isActive(channel) }"
          :href="withBase(channel.link)"
        >
          {{ channel.text }}
        </a>
        <AyoButton
          v-else
          variant="channel"
          :active="dropdownOpen === channel.text || isActive(channel)"
          :aria-expanded="dropdownOpen === channel.text"
          @click="toggleDropdown(channel)"
        >
          {{ channel.text }} ▾
        </AyoButton>

        <div v-if="dropdownOpen === channel.text" class="ayo-dropdown">
          <a
            v-for="child in channel.children"
            :key="child.text"
            class="ayo-dropdown__link"
            :class="{ 'is-active': isLinkActive(child.link) }"
            :href="withBase(child.link)"
            @click="dropdownOpen = null"
            >{{ child.text }}</a
          >
        </div>
      </span>

      <span class="ayo-channel__more-area">
        <AyoButton
          variant="bar"
          size="sm"
          :active="moreOpen"
          :aria-expanded="moreOpen"
          @click="toggleMore"
        >
          更多 ▾
        </AyoButton>
        <div v-if="moreOpen" class="ayo-dropdown ayo-dropdown--right">
          <template v-for="channel in collapsedChannels" :key="channel.text">
            <template v-if="channel.children?.length">
              <span class="ayo-dropdown__group">{{ channel.text }}</span>
              <a
                v-for="child in channel.children"
                :key="child.text"
                class="ayo-dropdown__link ayo-dropdown__link--sub"
                :href="withBase(child.link)"
                @click="moreOpen = false"
                >{{ child.text }}</a
              >
            </template>
            <a
              v-else
              class="ayo-dropdown__link"
              :class="{ 'is-active': isActive(channel) }"
              :href="withBase(channel.link)"
              @click="moreOpen = false"
              >{{ channel.text }}</a
            >
          </template>
        </div>
      </span>
    </div>
  </nav>
</template>

<style scoped>
/* 频道条：浅色标签栏（原深蓝实心条已并入「单一强调蓝」的浅底方案） */
.ayo-channels {
  border-top: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
}

.ayo-channels__inner {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  max-width: var(--ayo-page-width);
  margin: 0 auto;
  padding: 0 14px;
}

.ayo-channel__item {
  position: relative;
  display: inline-flex;
  align-items: stretch;
}

.ayo-channel__item--right {
  margin-left: auto;
}

.ayo-channel {
  padding: 5px 12px;
  color: var(--ayo-text);
  font-size: 15px;
  font-weight: bold;
  line-height: 1.8;
  text-decoration: none;
}

.ayo-channel:visited {
  color: var(--ayo-text);
}

.ayo-channel:hover {
  background-color: var(--ayo-primary-soft);
  color: var(--ayo-primary);
}

.ayo-channel.is-active {
  background-color: var(--ayo-primary-soft);
  border-bottom: 2px solid var(--ayo-primary);
  color: var(--ayo-primary);
}

.ayo-dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  z-index: 45;
  min-width: 160px;
  padding: 4px 0;
  background-color: var(--ayo-bg);
  border: 1px solid var(--ayo-border);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.ayo-dropdown--right {
  right: 0;
  left: auto;
}

.ayo-dropdown__link {
  display: block;
  padding: 6px 14px;
  color: var(--ayo-heading);
  font-size: 14px;
  white-space: nowrap;
  text-decoration: none;
}

/* 取消「看过变灰」：与上面 .ayo-channel 同一口径（条目名近黑，蓝色只留给当前项与 hover） */
.ayo-dropdown__link:visited {
  color: var(--ayo-heading);
}

.ayo-dropdown__link:hover {
  background-color: var(--ayo-primary-soft);
  color: var(--ayo-link-hover);
}

.ayo-dropdown__link.is-active {
  padding-left: 11px;
  border-left: 3px solid var(--ayo-primary);
  background-color: var(--ayo-primary-soft);
  color: var(--ayo-primary);
  font-weight: bold;
}

.ayo-dropdown__group {
  display: block;
  padding: 7px 14px 2px;
  color: var(--ayo-text-5);
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
  pointer-events: none;
}

.ayo-dropdown__link--sub {
  padding-left: 26px;
  color: var(--ayo-text-3);
  font-size: 13px;
}

/* 「更多」按钮：只在窄屏出现 */
.ayo-channel__more-area {
  position: relative;
  display: none;
  align-items: center;
  margin-left: auto;
}

@media (max-width: 640px) {
  .ayo-channels__inner > .ayo-channel__item:nth-child(n + 4) {
    display: none;
  }

  .ayo-channel__more-area {
    display: inline-flex;
  }

  .ayo-channel {
    padding: 6px 10px;
    font-size: 14px;
  }
}
</style>
