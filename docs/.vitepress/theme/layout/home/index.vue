<script setup lang="ts">
/**
 * 门户首页（frontmatter.layout: home）
 *
 * 版式对齐参考站首页：顶部公告滚动条 + 三栏（左：日历/友情链接，中：文章流，右：推荐/更新/站点信息）
 * 内容未迁移，三栏里的数据全部来自构建期文章加载器，无数据时显示空态。
 */
import { withBase } from "vitepress";
import { AyoTicker } from "@theme/components/common";
import type { TickerItem } from "@theme/components/common";
import AyoSideNav from "./components/side-nav.vue";
import AyoNewsColumn from "./components/news-column.vue";
import AyoSideColumn from "./components/side-column.vue";
import AyoSiteInfo from "./components/site-info.vue";
import AyoSupportCard from "./components/support-card.vue";
import AyoContactCard from "./components/contact-card.vue";

/** 公告滚动条：与参考站一致指向免责声明（公告栏目已迁入 /announcement/） */
const NOTICES: TickerItem[] = [
  { text: "本站内容仅供学习交流和技术参考使用", url: "/announcement/disclaimer/" },
  {
    text: "部署操作请先在测试环境充分验证，生产环境务必先备份数据并准备回滚方案",
    url: "/announcement/disclaimer/",
  },
  {
    text: "因参考本站内容进行部署而产生的损失、数据丢失或安全问题，由用户自行承担",
    url: "/announcement/disclaimer/",
  },
  { text: "本免责声明最终解释权归本站所有", url: "/announcement/disclaimer/" },
];
</script>

<template>
  <div class="ayo-home">
    <div class="ayo-home__inner">
      <AyoTicker
        label="免责声明"
        :items="NOTICES"
        more-url="/announcement/disclaimer/"
        more-text="查看详情"
        more-fixed
      />

      <div class="ayo-home__grid">
        <aside class="ayo-home__col ayo-home__col--side">
          <AyoSideNav />
        </aside>

        <main class="ayo-home__col ayo-home__col--news">
          <AyoNewsColumn />
        </main>

        <aside class="ayo-home__col ayo-home__col--hot">
          <AyoSideColumn />
          <!-- 窄屏时左栏收起，友情链接入口与「与我联系」卡片挪到右栏顶部（与参考站一致） -->
          <a class="ayo-friends-hot" :href="withBase('/extends/friends/')">🔗 友情链接</a>
          <AyoContactCard class="ayo-contact-hot" />
          <AyoSupportCard />
          <AyoSiteInfo />
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ayo-home__inner {
  max-width: var(--ayo-page-width);
  margin: 0 auto;
  padding: 0 16px;
}

.ayo-home__grid {
  display: grid;
  grid-template-columns:
    var(--ayo-side-width) minmax(0, 1fr)
    var(--ayo-hot-width);
  gap: var(--ayo-gap);
  align-items: start;
  margin-top: 16px;
}

.ayo-home__col {
  min-width: 0;
}

/* 左右栏吸附：中栏是最长的一栏（971px vs 522 / 838），不吸附的话两栏底部
   各留 450px / 133px 空白，页面右下角像缺一块。top 与栏间距同值，
   滚动时侧栏和视口上沿保持一格呼吸。
   （只在 ≥1025px 生效：单栏时栏内顺序已重排，吸附会把整段内容钉在屏幕上） */
.ayo-home__col--side,
.ayo-home__col--hot {
  position: sticky;
  top: var(--ayo-gap);
  align-self: start;
}

/* 栏内卡片统一 12px 节奏：以前这里 16、卡片组内部 10，同一页有四种间距 */
.ayo-home__col--hot {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ayo-friends-hot {
  display: none;
  padding: 14px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  color: var(--ayo-primary);
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  box-shadow: var(--ayo-shadow);
}

.ayo-friends-hot:visited {
  color: var(--ayo-primary);
}

.ayo-friends-hot:hover {
  background-color: var(--ayo-bg-soft);
  color: var(--ayo-link-hover);
}

/* 「与我联系」卡片：桌面端在左栏友情链接入口下方，这里这份只在 ≤1024px 出现 */
.ayo-contact-hot {
  display: none;
}

@media (max-width: 1024px) {
  .ayo-home__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .ayo-home__col--side {
    order: 0;
  }

  .ayo-home__col--news {
    order: 1;
  }

  .ayo-home__col--hot {
    order: 2;
    /* 单栏后右栏本来是竖着一条条拉满 1000px：站点信息的标签与数值会分居屏幕两端。
       改成两列铺开，顺带让友链入口与「与我联系」并排。
       .ayo-hot（系列/推荐/最近）自己就是两列网格，占满整行 */
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }

  .ayo-home__col--hot > .ayo-hot {
    grid-column: 1 / -1;
  }

  .ayo-home__col--side,
  .ayo-home__col--hot {
    position: static;
  }

  .ayo-friends-hot {
    display: block;
  }

  .ayo-contact-hot {
    display: block;
  }
}

@media (max-width: 640px) {
  .ayo-home__inner {
    padding: 0 8px;
  }

  .ayo-home__col--hot {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
