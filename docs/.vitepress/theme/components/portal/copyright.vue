<script setup lang="ts">
/**
 * 文章底部版权块（对齐参考站 Copyright.vue）
 *
 * 三行：文章作者（人像图标 + 名字，配了主页则可点）/ 文章链接（可直接分享的规范地址）/ 版权声明。
 * 数据全部来自 frontmatter（author、origin、license、articleUrl），解析规则见 utils/article.ts。
 * 仅原创文章给「文章链接」：转载文的规范链接应是原文地址，本站没有那份数据就不编。
 * 整块要不要出现由布局决定（公告页不要这块）：本组件挂载即渲染，不认版式。
 */
import { computed } from "vue";
import { useData } from "vitepress";
import {
  buildArticleUrl,
  resolveArticleUrl,
  resolveAuthors,
  resolveIsOriginal,
  resolveLicense,
  SITE_URL,
} from "@theme/utils/article";

const { frontmatter, page, site } = useData();

const fm = computed(() => (frontmatter.value ?? {}) as Record<string, unknown>);

const isOriginal = computed(() => resolveIsOriginal(fm.value));

const authors = computed(() => resolveAuthors(fm.value, site.value.title));

const license = computed(() => resolveLicense(fm.value));

const articleUrl = computed(() => {
  const override = resolveArticleUrl(fm.value);
  if (override) return override;
  if (!isOriginal.value) return "";
  return buildArticleUrl(SITE_URL, site.value.base ?? "", page.value.relativePath ?? "");
});
</script>

<template>
  <div class="ayo-copyright" aria-label="文章版权信息">
    <p v-if="authors.length" class="ayo-copyright__item">
      <span class="ayo-copyright__label">文章作者</span>
      <span class="ayo-copyright__authors">
        <span v-for="author in authors" :key="author.name" class="ayo-copyright__author">
          <svg
            class="ayo-copyright__icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
          <a
            v-if="author.url"
            class="ayo-copyright__author-link"
            :href="author.url"
            target="_blank"
            rel="noopener noreferrer"
            >{{ author.name }}</a
          >
          <span v-else class="ayo-copyright__author-name">{{ author.name }}</span>
        </span>
      </span>
    </p>

    <p v-if="articleUrl" class="ayo-copyright__item">
      <span class="ayo-copyright__label">文章链接</span>
      <a class="ayo-copyright__link" :href="articleUrl" target="_blank" rel="noopener noreferrer">{{
        articleUrl
      }}</a>
    </p>

    <p class="ayo-copyright__item">
      <span class="ayo-copyright__label">版权声明</span>
      <span v-if="isOriginal" class="ayo-copyright__value">
        本站文章除特别声明外，均采用
        <a
          v-if="license.url"
          class="ayo-copyright__link"
          :href="license.url"
          target="_blank"
          rel="noopener noreferrer"
          >{{ license.name }}</a
        >
        <span v-else class="ayo-copyright__license">{{ license.name }}</span>
        许可协议，转载请注明来自 {{ site.title }}！
      </span>
      <span v-else class="ayo-copyright__value"
        >本文为转载 / 整理内容，版权归原作者所有；如涉版权问题请联系删除。</span
      >
    </p>
  </div>
</template>

<style scoped>
.ayo-copyright {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 22px;
  padding: 14px 16px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg-soft);
  color: var(--ayo-text-2);
  font-size: 13px;
  line-height: 1.8;
}

.ayo-copyright__item {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin: 0;
}

.ayo-copyright__label {
  flex-shrink: 0;
  color: var(--ayo-text);
  font-weight: bold;
  user-select: none;
}

.ayo-copyright__label::after {
  content: "：";
}

.ayo-copyright__value {
  min-width: 0;
  word-break: break-word;
}

.ayo-copyright__authors {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
}

.ayo-copyright__author {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ayo-copyright__icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  color: var(--ayo-text-4);
}

.ayo-copyright__author-link,
.ayo-copyright__link {
  color: var(--ayo-primary);
  text-decoration: none;
  word-break: break-all;
}

.ayo-copyright__author-link:hover,
.ayo-copyright__link:hover {
  color: var(--ayo-link-hover);
}

.ayo-copyright__author-name,
.ayo-copyright__license {
  color: var(--ayo-text);
  font-weight: bold;
}
</style>
