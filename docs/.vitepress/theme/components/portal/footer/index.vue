<script setup lang="ts">
import { useData, withBase } from "vitepress";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";
import AyoThemeSwitch from "./theme-switch.vue";

const { site } = useData();

const articleCount = (posts as PostItem[]).length;

/** 原创篇数：frontmatter.origin 不是「转载」的都算原创 */
const originalCount = (posts as PostItem[]).filter((post) => post.origin !== "转载").length;

/** 版权年份：客户端取当年，避免构建年与访问年不一致 */
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="ayo-footer">
    <div class="ayo-footer__inner">
      <p class="ayo-footer__stat">
        本站共收录了 {{ articleCount }} 篇技术文章，其中原创文章 {{ originalCount }} 篇
      </p>
      <div class="ayo-footer__bar">
        <p class="ayo-footer__links">
          <a class="ayo-footer__link" :href="withBase('/announcement/disclaimer/')">免责声明</a>
          <a class="ayo-footer__link" :href="withBase('/extends/friends/')">友情链接</a>
        </p>
        <AyoThemeSwitch class="ayo-footer__theme" />
      </div>
      <p class="ayo-footer__copy">
        Copyright &copy; <ClientOnly>{{ currentYear }}</ClientOnly> {{ site.title }}. All Rights
        Reserved.
      </p>
      <p class="ayo-footer__powered">Powered by VitePress</p>
    </div>
  </footer>
</template>

<style scoped>
.ayo-footer {
  margin-top: 24px;
  border-top: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg-band);
  color: var(--ayo-text-3);
  text-align: center;
}

.ayo-footer__inner {
  max-width: var(--ayo-page-width);
  margin: 0 auto;
  padding: 18px 16px;
}

.ayo-footer__hint,
.ayo-footer__stat {
  color: var(--ayo-text-3);
  font-size: 12px;
}

/* 链接行：中列放链接、右列放明暗切换（左列留空占位），这样链接始终在页脚正中，
   切换按钮贴在可用宽度的右端；两侧 fr 均分剩余空间，窄屏也不会把链接挤偏 */
.ayo-footer__bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px 24px;
  padding-top: 12px;
}

.ayo-footer__links {
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 24px;
  font-size: 12px;
}

.ayo-footer__theme {
  grid-column: 3;
  justify-self: end;
}

.ayo-footer__link {
  color: var(--ayo-text-2);
  text-decoration: none;
}

.ayo-footer__link:visited {
  color: var(--ayo-text-2);
}

.ayo-footer__link:hover {
  color: var(--ayo-link);
}

.ayo-footer__copy {
  padding-top: 12px;
  color: var(--ayo-text-3);
  font-size: 12px;
}

.ayo-footer__powered {
  padding-top: 8px;
  color: var(--ayo-text-5);
  font-size: 10px;
}

@media (max-width: 640px) {
  .ayo-footer__bar {
    gap: 8px 14px;
  }

  .ayo-footer__links {
    gap: 14px;
    font-size: 12px;
  }
}
</style>
