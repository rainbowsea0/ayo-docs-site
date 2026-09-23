<script setup lang="ts">
/**
 * 知识库笔记页脚注（作者/维护说明）
 *
 * 参考站从 settings/authors.ts 取作者资料（本站没有这份配置，也不打算为一个脚注
 * 新增设置目录），因此改为用站点自身信息：作者即站点，交流入口取 themeConfig.socialLinks。
 */
import { computed } from "vue";
import { useData } from "vitepress";

const { site, theme } = useData();

/** 社交链接（config.mts 的 socialLinks）里的第一个，作为「交流入口」 */
const contact = computed(() => {
  const links = (theme.value.socialLinks ?? []) as { icon: string; link: string }[];
  return links[0] ?? null;
});
</script>

<template>
  <div class="ayo-wiki-author">
    <p class="ayo-wiki-author__line">
      <span class="ayo-wiki-author__label">作者</span>
      <a
        v-if="contact"
        class="ayo-wiki-author__name"
        :href="contact.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ site.title }}
      </a>
      <span v-else class="ayo-wiki-author__name">{{ site.title }}</span>
      <span class="ayo-wiki-author__role">· 本站作者</span>
    </p>
    <p class="ayo-wiki-author__note">本页为知识库笔记，由作者持续整理维护；如有错误欢迎指正。</p>
  </div>
</template>

<style scoped>
.ayo-wiki-author {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px dashed var(--ayo-line);
}

.ayo-wiki-author__line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  font-size: 14px;
  line-height: 1.7;
}

.ayo-wiki-author__label {
  color: var(--ayo-text-2);
  font-weight: bold;
}

.ayo-wiki-author__label::after {
  content: "：";
}

.ayo-wiki-author__name {
  color: var(--ayo-primary);
  font-weight: bold;
  text-decoration: none;
}

.ayo-wiki-author__name:hover {
  color: var(--ayo-link-hover);
}

.ayo-wiki-author__role {
  color: var(--ayo-text-5);
  font-size: 13px;
}

.ayo-wiki-author__note {
  margin: 2px 0 0;
  color: var(--ayo-text-4);
  font-size: 13px;
  line-height: 1.7;
}
</style>
