<script setup lang="ts">
/** 首页左栏：日历 + 友情链接入口 + 与我联系（对应参考站 SideNav） */
import { withBase } from "vitepress";
import AyoCalendar from "./calendar.vue";
import AyoContactCard from "./contact-card.vue";
</script>

<template>
  <div class="ayo-sidenav">
    <AyoCalendar />
    <a class="ayo-friends" :href="withBase('/extends/friends/')">🔗 友情链接</a>
    <AyoContactCard class="ayo-sidenav__contact" />
  </div>
</template>

<style scoped>
.ayo-sidenav {
  display: flex;
  flex-direction: column;
  /* 与中栏、右栏同一档卡片间距 */
  gap: 12px;
}

.ayo-friends {
  display: block;
  padding: 14px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  color: var(--ayo-primary);
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  box-shadow: var(--ayo-shadow);
  transition:
    border-color var(--ayo-transition),
    box-shadow var(--ayo-transition),
    transform var(--ayo-transition);
}

.ayo-friends:visited {
  color: var(--ayo-primary);
}

.ayo-friends:hover {
  border-color: var(--ayo-primary-line);
  box-shadow: var(--ayo-shadow-hover);
  transform: translateY(-2px);
}

@media (max-width: 1024px) {
  /* 左栏整体挪到文章流上方后，「与我联系」跟友链入口不再相邻，
     两处一起收起来，卡片改由右栏的 .ayo-contact-hot 实例渲染（与友链入口同一套处理） */
  .ayo-friends,
  .ayo-sidenav__contact {
    display: none;
  }
}
</style>
