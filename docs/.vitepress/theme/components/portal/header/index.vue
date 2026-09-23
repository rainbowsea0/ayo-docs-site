<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { AyoButton } from "@theme/components/common";
import { formatToday } from "@theme/utils/format";
import AyoNav from "./nav.vue";

const { site, theme } = useData();

const logoSrc = computed(() => withBase((theme.value.logo as string | undefined) ?? "/logo.webp"));
const subtitle = computed(() => site.value.description ?? "");

/** 页头日期：外层套 ClientOnly，构建期不会把构建时间写进静态 HTML */
const today = formatToday(new Date());
</script>

<template>
  <header class="ayo-header">
    <div class="ayo-logo-row">
      <a class="ayo-logo" :href="withBase('/')">
        <img class="ayo-logo__img" :src="logoSrc" alt="站点 logo" />
        <span class="ayo-logo__text">
          <span class="ayo-logo__title">{{ site.title }}</span>
          <span v-if="subtitle" class="ayo-logo__sub">{{ subtitle }}</span>
        </span>
      </a>

      <div class="ayo-logo-right">
        <div class="ayo-date">
          <ClientOnly>{{ today }}</ClientOnly>
        </div>

        <form class="ayo-search" title="搜索功能待接入（占位）" @submit.prevent>
          <input
            class="ayo-input ayo-search__input"
            type="text"
            placeholder="全站搜索"
            aria-label="全站搜索"
            autocomplete="off"
          />
          <AyoButton type="submit" size="sm">搜索</AyoButton>
        </form>
      </div>
    </div>

    <AyoNav />
  </header>
</template>

<style scoped>
.ayo-header {
  background-color: var(--ayo-bg);
  border-bottom: 1px solid var(--ayo-border);
}

.ayo-logo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  max-width: var(--ayo-page-width);
  margin: 0 auto;
  padding: 16px 16px 14px;
}

.ayo-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.ayo-logo:visited {
  color: inherit;
}

.ayo-logo__img {
  width: 44px;
  height: 44px;
  border: 1px solid var(--ayo-line);
}

.ayo-logo__text {
  display: flex;
  flex-direction: column;
}

.ayo-logo__title {
  color: var(--ayo-primary);
  font-family: var(--ayo-font-serif);
  font-size: 28px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: 4px;
}

.ayo-logo__sub {
  color: var(--ayo-text-5);
  font-size: 12px;
  letter-spacing: 1px;
}

.ayo-logo-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.ayo-date {
  color: var(--ayo-text);
  font-size: 13px;
}

.ayo-search {
  display: flex;
}

.ayo-search__input {
  width: 200px;
  border-right: 0;
}

@media (max-width: 640px) {
  .ayo-logo-row {
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
  }

  .ayo-logo__img {
    width: 30px;
    height: 30px;
  }

  .ayo-logo__title {
    font-size: 19px;
    letter-spacing: 2px;
  }

  .ayo-logo__sub {
    display: none;
  }

  .ayo-logo-right {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
  }

  .ayo-date {
    flex-shrink: 0;
    font-size: 12px;
    white-space: nowrap;
  }

  .ayo-search {
    flex: 1;
    min-width: 0;
  }

  .ayo-search__input {
    flex: 1;
    width: auto;
    min-width: 0;
  }
}
</style>
