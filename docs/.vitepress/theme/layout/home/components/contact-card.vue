<script setup lang="ts">
/**
 * 与我联系挂件（首页左栏，友情链接入口下方）
 *
 * 入口地址不写死在这里：从 themeConfig.socialLinks 读，改地址只动 config.mts 一处。
 * 展示名与品牌图形都取自 @theme/utils/brand-icons（L2 的注册表），本组件只管排版。
 * 页脚原来把 socialLinks 的 icon 名当文字渲染，页面上就是「github」「juejin」两个英文单词；
 * 挪成卡片后按「品牌图标 + 名称」呈现。
 */
import { computed } from "vue";
import { useData } from "vitepress";
import { AyoBrandIcon, AyoCard } from "@theme/components/common";
import { brandIcon } from "@theme/utils/brand-icons";

interface SocialLink {
  icon: string;
  link: string;
}

const { theme } = useData();

/**
 * 只渲染 brand-icons 里登记过的入口：socialLinks 里将来加了别的站点，
 * 没登记就没有展示名与图形，直接不上卡片（避免又出现一个裸 icon 单词）。
 */
const links = computed(() =>
  ((theme.value.socialLinks ?? []) as SocialLink[]).flatMap((item) => {
    const brand = brandIcon(item.icon);
    return brand ? [{ ...item, label: brand.label }] : [];
  })
);
</script>

<template>
  <AyoCard title="与我联系">
    <ul v-if="links.length" class="ayo-list ayo-contact">
      <li v-for="item in links" :key="item.link">
        <a
          class="ayo-contact__link"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          :title="`在新窗口打开 ${item.label}`"
        >
          <AyoBrandIcon :name="item.icon" class="ayo-contact__icon" />
          <span class="ayo-contact__name">{{ item.label }}</span>
        </a>
      </li>
    </ul>
    <p class="ayo-contact__note">通过微信公众号或上述入口均可联系站长</p>
  </AyoCard>
</template>

<style scoped>
/* 左栏内宽只有 172px（比右栏还窄 20px）：入口一行一个，名称不换行；卡片正文统一 12px */
.ayo-contact {
  font-size: 12px;
}

.ayo-contact__link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ayo-primary);
  text-decoration: none;
}

.ayo-contact__link:visited {
  color: var(--ayo-primary);
}

.ayo-contact__link:hover {
  color: var(--ayo-link-hover);
}

.ayo-contact__name {
  white-space: nowrap;
}

/* 联系说明：窄栏里必然折成两行，行高给足，字号略小于入口 */
.ayo-contact__note {
  margin-top: 7px;
  padding-top: 7px;
  border-top: 1px solid var(--ayo-line);
  color: var(--ayo-text-3);
  font-size: 12px;
  line-height: 1.6;
}
</style>
