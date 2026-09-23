<script setup lang="ts">
/**
 * 站点导航 / 软件工具页（frontmatter.layout: navlinks）
 *
 * 纯数据驱动：frontmatter.categories 就是全部内容，两个页面（extends/nav、extends/tools）共用本布局。
 * 版式对齐参考站 NavLinksLayout：顶部统计 + 关键字过滤 + 吸顶分类跳转条 + 站点卡片网格；
 * 卡片图标走 utils/site-icons（拿不到就落彩色首字母），tag 是特性标签、magic 表示需代理访问。
 */
import { computed, ref } from "vue";
import { useData } from "vitepress";
import { normalizeKeyword } from "@theme/composables/use-list-view";
import { fallbackChar, fallbackColor, useSiteIcons } from "@theme/utils/site-icons";

interface NavLink {
  name: string;
  desc?: string;
  url: string;
  icon?: string;
  tag?: string;
  magic?: boolean;
}

interface NavCategory {
  title: string;
  links: NavLink[];
}

const { frontmatter } = useData();

const categories = computed<NavCategory[]>(() => {
  const raw = (frontmatter.value as { categories?: unknown }).categories;
  return Array.isArray(raw) ? (raw as NavCategory[]) : [];
});

const totalLinks = computed(() =>
  categories.value.reduce((sum, cat) => sum + (cat.links?.length ?? 0), 0)
);

const keyword = ref("");

/**
 * 分类 → 链接的二级过滤：命中链接的分类才保留，分类里的链接也要收窄。
 * 这不是「一层列表 + 分页」的形状，所以没套 useListView，只共用查询归一化。
 */
const filteredCategories = computed<NavCategory[]>(() => {
  const query = normalizeKeyword(keyword.value);
  if (!query) return categories.value;
  const hit = (link: NavLink): boolean =>
    link.name.toLowerCase().includes(query) ||
    (link.desc ?? "").toLowerCase().includes(query) ||
    (link.tag ?? "").toLowerCase().includes(query);
  return categories.value
    .map((cat) => ({ title: cat.title, links: cat.links.filter(hit) }))
    .filter((cat) => cat.links.length > 0);
});

const jumpTrackEl = ref<HTMLElement | null>(null);

const jumpTo = (index: number): void => {
  document
    .getElementById(`nav-cat-${index}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scrollJump = (direction: number): void => {
  jumpTrackEl.value?.scrollBy({ left: direction * 280, behavior: "smooth" });
};

/** 站内链接当前窗口打开，站外新标签 */
const linkTarget = (url: string): string => (url.startsWith("/") ? "_self" : "_blank");

const {
  srcOf: linkIcon,
  isLoaded: iconLoaded,
  isErrored: iconErrored,
  markLoaded: onIconLoad,
  markErrored: onIconError,
} = useSiteIcons();
</script>

<template>
  <div class="ayo-navlinks">
    <div class="ayo-navlinks__head">
      <p class="ayo-navlinks__intro">
        📑 {{ categories.length }} 个分类 · {{ totalLinks }} 个网址，点击直达对应站点
      </p>
      <div class="ayo-navlinks__search">
        <span class="ayo-navlinks__search-icon" aria-hidden="true">🔍</span>
        <input
          v-model="keyword"
          class="ayo-navlinks__search-input"
          type="text"
          placeholder="搜索站点名称 / 简介 / 标签…"
          autocomplete="off"
        />
        <button
          v-if="keyword"
          class="ayo-navlinks__search-clear"
          type="button"
          title="清空"
          aria-label="清空搜索"
          @click="keyword = ''"
        >
          ✕
        </button>
      </div>
    </div>

    <div v-if="filteredCategories.length > 1" class="ayo-navlinks__jump">
      <button
        class="ayo-navlinks__jump-btn"
        type="button"
        title="向左滚动"
        aria-label="向左滚动分类"
        @click="scrollJump(-1)"
      >
        ❮
      </button>
      <div ref="jumpTrackEl" class="ayo-navlinks__jump-track">
        <button
          v-for="(cat, index) in filteredCategories"
          :key="cat.title"
          class="ayo-navlinks__chip"
          type="button"
          @click="jumpTo(index)"
        >
          {{ cat.title }}
          <span class="ayo-navlinks__chip-count">{{ cat.links.length }}</span>
        </button>
      </div>
      <button
        class="ayo-navlinks__jump-btn"
        type="button"
        title="向右滚动"
        aria-label="向右滚动分类"
        @click="scrollJump(1)"
      >
        ❯
      </button>
    </div>

    <section
      v-for="(cat, index) in filteredCategories"
      :id="`nav-cat-${index}`"
      :key="cat.title"
      class="ayo-navlinks__cat"
    >
      <header class="ayo-navlinks__cat-head">
        <h3 class="ayo-navlinks__cat-title">{{ cat.title }}</h3>
        <span class="ayo-navlinks__cat-count">{{ cat.links.length }} 个</span>
      </header>

      <div class="ayo-navlinks__grid">
        <a
          v-for="link in cat.links"
          :key="link.url"
          class="ayo-navlink"
          :href="link.url"
          :target="linkTarget(link.url)"
          :rel="link.url.startsWith('/') ? undefined : 'noopener noreferrer'"
          :title="`${link.name} — ${link.url}`"
        >
          <span
            v-if="linkIcon(link)"
            class="ayo-navlink__iconbox"
            :class="{
              'is-loaded': iconLoaded(link),
              'is-err': iconErrored(link),
            }"
          >
            <span
              class="ayo-navlink__fallback"
              :style="{ backgroundColor: fallbackColor(link.name) }"
              aria-hidden="true"
            >
              {{ fallbackChar(link.name) }}
            </span>
            <img
              class="ayo-navlink__icon"
              :class="{ loaded: iconLoaded(link) }"
              :src="linkIcon(link)"
              alt=""
              loading="lazy"
              @load="onIconLoad(link)"
              @error="onIconError(link)"
            />
          </span>

          <span class="ayo-navlink__main">
            <span class="ayo-navlink__name-row">
              <span class="ayo-navlink__name">{{ link.name }}</span>
              <span class="ayo-navlink__badges">
                <span
                  v-if="link.magic"
                  class="ayo-navlink__magic"
                  title="国内需代理访问"
                  aria-label="国内需代理访问"
                  >🔒</span
                >
                <span v-if="link.tag" class="ayo-navlink__tag">{{ link.tag }}</span>
              </span>
            </span>
            <span v-if="link.desc" class="ayo-navlink__desc">{{ link.desc }}</span>
          </span>
        </a>
      </div>
    </section>

    <p v-if="!categories.length" class="ayo-navlinks__empty">
      暂无分类（在页面 frontmatter 里写 categories: 分类名 / links 列表即可）。
    </p>
    <p v-else-if="!filteredCategories.length" class="ayo-navlinks__empty">
      没有匹配「{{ keyword }}」的站点，换个关键字试试
    </p>

    <p class="ayo-navlinks__foot">发现好站？告诉站长收录进来 →</p>
  </div>
</template>

<style scoped>
.ayo-navlinks {
  max-width: var(--ayo-page-width);
  margin: 0 auto;
  padding: 24px 24px 56px;
}

.ayo-navlinks__head {
  margin-bottom: 14px;
}

.ayo-navlinks__intro {
  margin: 0 0 10px;
  color: var(--ayo-text-3);
  font-size: 14px;
}

.ayo-navlinks__search {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 460px;
}

.ayo-navlinks__search-icon {
  position: absolute;
  left: 12px;
  opacity: 0.7;
  font-size: 14px;
  pointer-events: none;
}

.ayo-navlinks__search-input {
  width: 100%;
  height: 34px;
  padding: 0 34px 0 32px;
  border: 1px solid var(--ayo-border);
  background-color: var(--ayo-bg);
  color: var(--ayo-text);
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.ayo-navlinks__search-input:focus {
  border-color: var(--ayo-primary);
}

.ayo-navlinks__search-input::placeholder {
  color: var(--ayo-text-5);
}

.ayo-navlinks__search-clear {
  position: absolute;
  right: 8px;
  padding: 4px;
  border: 0;
  background: none;
  color: var(--ayo-text-4);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
}

.ayo-navlinks__search-clear:hover {
  color: var(--ayo-primary);
}

/* 吸顶分类跳转条 */
.ayo-navlinks__jump {
  position: sticky;
  top: calc(var(--ayo-header-h, 0px) + 8px);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 14px;
  padding: 4px 6px;
  border: 1px solid var(--ayo-border);
  background-color: var(--ayo-bg);
}

.ayo-navlinks__jump-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--ayo-border);
  background-color: var(--ayo-bg);
  color: var(--ayo-text-3);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
}

.ayo-navlinks__jump-btn:hover {
  border-color: var(--ayo-primary);
  color: var(--ayo-primary);
}

.ayo-navlinks__jump-track {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.ayo-navlinks__jump-track::-webkit-scrollbar {
  display: none;
}

.ayo-navlinks__chip {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border: 1px solid var(--ayo-border);
  background-color: var(--ayo-bg);
  color: var(--ayo-text-2);
  font-family: inherit;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}

.ayo-navlinks__chip:hover {
  border-color: var(--ayo-primary);
  background-color: var(--ayo-primary-soft);
  color: var(--ayo-primary);
}

.ayo-navlinks__chip-count {
  padding: 0 4px;
  border: 1px solid var(--ayo-line);
  color: var(--ayo-text-5);
  font-size: 11px;
  line-height: 1.5;
}

.ayo-navlinks__cat {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid var(--ayo-border);
  background-color: var(--ayo-bg);
  scroll-margin-top: calc(var(--ayo-header-h, 0px) + 72px);
}

.ayo-navlinks__cat-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ayo-line);
}

.ayo-navlinks__cat-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--ayo-primary);
  font-size: 16px;
  letter-spacing: 1px;
}

.ayo-navlinks__cat-title::before {
  content: "";
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  background-color: var(--ayo-primary);
}

.ayo-navlinks__cat-count {
  color: var(--ayo-text-5);
  font-size: 12px;
}

.ayo-navlinks__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

/* 站点卡片 */
.ayo-navlink {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--ayo-border);
  background-color: var(--ayo-bg);
  text-decoration: none;
}

.ayo-navlink:hover {
  border-color: var(--ayo-primary);
  background-color: var(--ayo-primary-soft);
}

.ayo-navlink__iconbox {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg-soft);
  overflow: hidden;
}

/* 加载中：细圆环转圈（切到已加载/失败即隐藏） */
.ayo-navlink__iconbox::before {
  content: "";
  position: absolute;
  inset: 13px;
  border: 2px solid var(--ayo-line);
  border-top-color: var(--ayo-primary);
  border-radius: 50%;
  animation: ayo-icon-spin 0.8s linear infinite;
}

.ayo-navlink__iconbox.is-loaded::before,
.ayo-navlink__iconbox.is-err::before {
  display: none;
}

@keyframes ayo-icon-spin {
  to {
    transform: rotate(360deg);
  }
}

.ayo-navlink__icon {
  position: relative;
  width: 26px;
  height: 26px;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.2s;
}

.ayo-navlink__icon.loaded {
  opacity: 1;
}

.ayo-navlink__fallback {
  display: none;
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  user-select: none;
}

.ayo-navlink__iconbox.is-err .ayo-navlink__fallback {
  display: flex;
}

.ayo-navlink__iconbox.is-err .ayo-navlink__icon {
  display: none;
}

.ayo-navlink__main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.ayo-navlink__name-row {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.ayo-navlink__name {
  overflow: hidden;
  color: var(--ayo-text);
  font-size: 15px;
  font-weight: bold;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ayo-navlink:hover .ayo-navlink__name {
  color: var(--ayo-primary);
}

.ayo-navlink__badges {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 3px;
}

.ayo-navlink__tag {
  padding: 0 3px;
  border: 1px solid currentcolor;
  color: var(--ayo-amber-dark);
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
}

.ayo-navlink__magic {
  font-size: 12px;
  line-height: 1.4;
  cursor: help;
}

.ayo-navlink__desc {
  display: -webkit-box;
  overflow: hidden;
  color: var(--ayo-text-4);
  font-size: 12px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.ayo-navlink::after {
  content: "→";
  position: absolute;
  right: 9px;
  bottom: 5px;
  opacity: 0;
  color: var(--ayo-primary);
  font-size: 13px;
  line-height: 1;
}

.ayo-navlink:hover::after {
  opacity: 1;
}

.ayo-navlinks__empty {
  padding: 32px 24px;
  border: 1px dashed var(--ayo-border);
  background-color: var(--ayo-bg);
  color: var(--ayo-text-4);
  font-size: 14px;
  text-align: center;
}

.ayo-navlinks__foot {
  margin: 16px 0 0;
  color: var(--ayo-text-4);
  font-size: 13px;
  text-align: right;
}

@media (max-width: 640px) {
  .ayo-navlinks {
    padding: 16px 12px 40px;
  }

  .ayo-navlinks__grid {
    grid-template-columns: 1fr;
  }
}
</style>
