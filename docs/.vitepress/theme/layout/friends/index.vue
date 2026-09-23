<script setup lang="ts">
/**
 * 友情链接页（frontmatter.layout: friends）
 *
 * 纯数据驱动：frontmatter 的 thanks（鸣谢，跑马灯两行反向滚动）与 friends（全部好友，卡片网格）。
 * 版式对齐参考站 FriendsLayout；卡片图标同样走 utils/site-icons（失败落彩色首字母）。
 * 参考站页面下半部分是一张需要后端（scripts/mock-lock-server.mjs）的申请表单，本站不引入那套服务，
 * 改为一段「如何交换友链」的文字说明，并指到《友情链接交换公告》看具体格式与站长邮箱。
 */
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { fallbackChar, fallbackColor, useSiteIcons } from "@theme/utils/site-icons";

interface FriendEntry {
  name: string;
  url: string;
  desc?: string;
}

const { frontmatter, site } = useData();

const pickList = (key: string): FriendEntry[] => {
  const raw = (frontmatter.value as Record<string, unknown>)[key];
  if (!Array.isArray(raw)) return [];
  return (raw as FriendEntry[]).filter(
    (item) => item && typeof item === "object" && item.name && item.url
  );
};

const thanks = computed<FriendEntry[]>(() => pickList("thanks"));

/** 鸣谢超过 4 条就拆成两行反向滚动 */
const thanksRows = computed<FriendEntry[][]>(() => {
  const list = thanks.value;
  if (list.length <= 4) return list.length ? [list] : [];
  const half = Math.ceil(list.length / 2);
  return [list.slice(0, half), list.slice(half)];
});

const friends = computed<FriendEntry[]>(() => pickList("friends"));

const {
  srcOf: cardIcon,
  isLoaded: iconLoaded,
  isErrored: iconErrored,
  markLoaded: onIconLoad,
  markErrored: onIconError,
} = useSiteIcons();
</script>

<template>
  <div class="ayo-friends">
    <header class="ayo-friends__head">
      <span class="ayo-friends__square" aria-hidden="true"></span>
      <h1 class="ayo-friends__title">友情链接</h1>
    </header>

    <section v-if="thanks.length" class="ayo-friends__sec">
      <header class="ayo-friends__sec-head">
        <h2 class="ayo-friends__sec-title">鸣谢</h2>
      </header>
      <p class="ayo-friends__sec-desc">感谢航行途中为我点亮航标的朋友与项目 ——</p>

      <div class="ayo-friends__marquee-rows">
        <div
          v-for="(row, rowIndex) in thanksRows"
          :key="rowIndex"
          class="ayo-friends__marquee-wrap"
        >
          <div class="ayo-friends__marquee" :class="{ 'is-reverse': rowIndex % 2 === 1 }">
            <div
              v-for="group in 4"
              :key="group"
              class="ayo-friends__marquee-group"
              :aria-hidden="group > 1"
            >
              <a
                v-for="item in row"
                :key="`${group}-${item.url}`"
                class="ayo-friend-card"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                :title="`${item.name} — ${item.url}`"
              >
                <span
                  v-if="cardIcon(item)"
                  class="ayo-friend-card__iconbox"
                  :class="{ 'is-loaded': iconLoaded(item), 'is-err': iconErrored(item) }"
                >
                  <span
                    class="ayo-friend-card__fallback"
                    :style="{ backgroundColor: fallbackColor(item.name) }"
                    aria-hidden="true"
                  >
                    {{ fallbackChar(item.name) }}
                  </span>
                  <img
                    class="ayo-friend-card__icon"
                    :class="{ loaded: iconLoaded(item) }"
                    :src="cardIcon(item)"
                    alt=""
                    loading="lazy"
                    @load="onIconLoad(item)"
                    @error="onIconError(item)"
                  />
                </span>
                <span class="ayo-friend-card__main">
                  <span class="ayo-friend-card__name">{{ item.name }}</span>
                  <span v-if="item.desc" class="ayo-friend-card__desc">{{ item.desc }}</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="ayo-friends__sec">
      <header class="ayo-friends__sec-head">
        <span class="ayo-friends__square" aria-hidden="true"></span>
        <h2 class="ayo-friends__sec-title">全部友情链接</h2>
      </header>
      <p class="ayo-friends__sec-desc">
        收录我认可并常逛的「邻居」们，每张卡背后都是一位数字居民。
      </p>

      <div v-if="friends.length" class="ayo-friends__grid">
        <a
          v-for="item in friends"
          :key="item.url"
          class="ayo-friend-card"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          :title="`${item.name} — ${item.url}`"
        >
          <span
            v-if="cardIcon(item)"
            class="ayo-friend-card__iconbox"
            :class="{ 'is-loaded': iconLoaded(item), 'is-err': iconErrored(item) }"
          >
            <span
              class="ayo-friend-card__fallback"
              :style="{ backgroundColor: fallbackColor(item.name) }"
              aria-hidden="true"
            >
              {{ fallbackChar(item.name) }}
            </span>
            <img
              class="ayo-friend-card__icon"
              :class="{ loaded: iconLoaded(item) }"
              :src="cardIcon(item)"
              alt=""
              loading="lazy"
              @load="onIconLoad(item)"
              @error="onIconError(item)"
            />
          </span>
          <span class="ayo-friend-card__main">
            <span class="ayo-friend-card__name">{{ item.name }}</span>
            <span v-if="item.desc" class="ayo-friend-card__desc">{{ item.desc }}</span>
          </span>
        </a>
      </div>

      <div v-else class="ayo-friends__empty">
        <span class="ayo-friends__empty-icon" aria-hidden="true">🦄</span>
        <p class="ayo-friends__empty-title">空位以待</p>
        <p class="ayo-friends__empty-desc">
          还没有收录友链。想交换友链的话，把站点名、网址与一句简介发给站长即可。
        </p>
      </div>
    </section>

    <section class="ayo-friends__sec">
      <header class="ayo-friends__sec-head">
        <span class="ayo-friends__square" aria-hidden="true"></span>
        <h2 class="ayo-friends__sec-title">交换友链</h2>
      </header>
      <ul class="ayo-friends__apply">
        <li>站点名：{{ site.title }}</li>
        <li>站点简介：{{ site.description }}</li>
        <li>
          申请方式：按
          <a class="ayo-friends__apply-link" :href="withBase('/announcement/friends-exchange/')"
            >《友情链接交换公告》</a
          >
          里的格式把站点名、网址与简介发给站长（公告内有站长邮箱），也可通过首页左栏「与我联系」
          卡片里的 GitHub / 掘金入口联系。
        </li>
        <li>收录原则：内容原创为主、长期可访问、无强制弹窗与跳转广告。</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.ayo-friends {
  max-width: var(--ayo-page-width);
  margin: 0 auto;
  padding: 24px 24px 56px;
}

.ayo-friends__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--ayo-primary);
}

.ayo-friends__square {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  background-color: var(--ayo-primary);
}

.ayo-friends__title {
  margin: 0;
  color: var(--ayo-primary);
  font-size: 23px;
}

.ayo-friends__sec {
  margin-bottom: 28px;
}

.ayo-friends__sec-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.ayo-friends__sec-title {
  margin: 0;
  color: var(--ayo-blue);
  font-size: 17px;
}

.ayo-friends__sec-desc {
  margin: 0 0 12px;
  color: var(--ayo-text-3);
  font-size: 13px;
}

/* 鸣谢跑马灯：两行反向，悬停暂停 */
.ayo-friends__marquee-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ayo-friends__marquee-wrap {
  overflow: hidden;
  padding: 2px 0;
}

.ayo-friends__marquee {
  display: flex;
  width: max-content;
  animation: ayo-marquee 46s linear infinite;
}

.ayo-friends__marquee.is-reverse {
  animation-direction: reverse;
}

.ayo-friends__marquee-wrap:hover .ayo-friends__marquee {
  animation-play-state: paused;
}

.ayo-friends__marquee-group {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  padding-right: 10px;
}

@keyframes ayo-marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ayo-friends__marquee {
    animation: none;
  }
}

.ayo-friends__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

/* 好友卡片（鸣谢与全部友链共用） */
.ayo-friend-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  text-decoration: none;
  box-shadow: var(--ayo-shadow);
  transition:
    border-color var(--ayo-transition),
    box-shadow var(--ayo-transition),
    transform var(--ayo-transition);
}

.ayo-friend-card:hover {
  border-color: var(--ayo-primary-line);
  box-shadow: var(--ayo-shadow-hover);
  transform: translateY(-2px);
}

.ayo-friend-card__iconbox {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg-soft);
  overflow: hidden;
}

.ayo-friend-card__icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.2s;
}

.ayo-friend-card__icon.loaded {
  opacity: 1;
}

.ayo-friend-card__fallback {
  display: none;
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  user-select: none;
}

.ayo-friend-card__iconbox.is-err .ayo-friend-card__fallback {
  display: flex;
}

.ayo-friend-card__iconbox.is-err .ayo-friend-card__icon {
  display: none;
}

.ayo-friend-card__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ayo-friend-card__name {
  overflow: hidden;
  color: var(--ayo-text);
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ayo-friend-card:hover .ayo-friend-card__name {
  color: var(--ayo-primary);
}

.ayo-friend-card__desc {
  overflow: hidden;
  color: var(--ayo-text-4);
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ayo-friends__empty {
  padding: 28px 20px;
  border: 1px dashed var(--ayo-border);
  background-color: var(--ayo-bg);
  text-align: center;
}

.ayo-friends__empty-icon {
  font-size: 29px;
}

.ayo-friends__empty-title {
  margin: 6px 0 4px;
  color: var(--ayo-text-2);
  font-size: 15px;
  font-weight: bold;
}

.ayo-friends__empty-desc {
  margin: 0;
  color: var(--ayo-text-4);
  font-size: 13px;
}

.ayo-friends__apply {
  margin: 0;
  padding-left: 1.4em;
  color: var(--ayo-text-2);
  font-size: 13px;
  line-height: 1.9;
}

.ayo-friends__apply-link {
  color: var(--ayo-primary);
  text-decoration: none;
}

.ayo-friends__apply-link:hover {
  color: var(--ayo-link-hover);
}

@media (max-width: 640px) {
  .ayo-friends {
    padding: 16px 12px 40px;
  }

  .ayo-friends__grid {
    grid-template-columns: 1fr;
  }
}
</style>
