<script setup lang="ts">
/**
 * 关注与支持挂件：微信公众号 + 赞赏二维码（图片在 docs/public 下）
 */
import { withBase } from "vitepress";
import { AyoCard } from "@theme/components/common";
</script>

<template>
  <AyoCard title="关注与支持" tone="accent">
    <div class="ayo-support">
      <figure class="ayo-support__item">
        <img :src="withBase('/wxid.webp')" alt="微信公众号二维码" loading="lazy" />
        <figcaption>微信公众号</figcaption>
      </figure>
      <figure class="ayo-support__item">
        <img :src="withBase('/wxpay.webp')" alt="赞赏支持二维码" loading="lazy" />
        <figcaption>赞赏支持</figcaption>
      </figure>
    </div>
  </AyoCard>
</template>

<style scoped>
/* 二维码给死上限：≤1024px 时卡片会铺满整栏（约 1000px），
   图片 flex:1 会被拉伸到 490px 见方，整张卡撑到 340px 高。
   这里宽 216px 的栏里两张各约 92px，单栏时居中留白而不是继续长 */
.ayo-support {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.ayo-support__item {
  flex: 0 1 120px;
  min-width: 0;
  margin: 0;
  text-align: center;
}

.ayo-support__item img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--ayo-line);
  background-color: #fff;
}

.ayo-support__item figcaption {
  margin-top: 4px;
  color: var(--ayo-text-3);
  font-size: 12px;
}
</style>
