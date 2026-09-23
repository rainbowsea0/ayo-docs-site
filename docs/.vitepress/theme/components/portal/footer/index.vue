<script setup lang="ts">
import { useData, withBase } from "vitepress";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";

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
      <p class="ayo-footer__links">
        <a class="ayo-footer__link" :href="withBase('/announcement/disclaimer/')">📜 免责声明</a>
        <a class="ayo-footer__link" :href="withBase('/extends/friends/')">🔗 友情链接</a>
      </p>
      <p class="ayo-footer__copy">
        Copyright © <ClientOnly>{{ currentYear }}</ClientOnly> {{ site.title }} ·
        本站为非经营性个人网站，内容仅供学习交流 · 转载需注明出处
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

.ayo-footer__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 12px 0 0;
  font-size: 13px;
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
  font-size: 11px;
}

@media (max-width: 640px) {
  .ayo-footer__links {
    gap: 14px;
    font-size: 12px;
  }
}
</style>
