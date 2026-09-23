import AyoAnnouncementLayout from "./announcement/index.vue";
import AyoDocLayout from "./doc/index.vue";
import AyoFriendsLayout from "./friends/index.vue";
import AyoHomeLayout from "./home/index.vue";
import AyoNavLinksLayout from "./navlinks/index.vue";
import AyoPostsLayout from "./posts/index.vue";
import AyoProjectLayout from "./project/index.vue";
import AyoProjectsLayout from "./projects/index.vue";
import AyoSeriesLayout from "./series/index.vue";
import AyoTagsLayout from "./tags/index.vue";
import AyoWikiLayout from "./wiki/index.vue";

export {
  AyoAnnouncementLayout,
  AyoDocLayout,
  AyoFriendsLayout,
  AyoHomeLayout,
  AyoNavLinksLayout,
  AyoPostsLayout,
  AyoProjectLayout,
  AyoProjectsLayout,
  AyoSeriesLayout,
  AyoTagsLayout,
  AyoWikiLayout,
};

/**
 * frontmatter.layout 名称 → 布局组件
 *
 * home     = 门户首页
 * posts    = 文章频道列表页
 * doc      = 文档/文章详情页（默认页）
 * post     = 文章详情页：与 doc 同一套版式，保留别名以便 `layout: post` 继续可用
 * wiki     = 知识库（/wiki/**：主页 / 主题页 / 笔记页三态）
 * announcement = 公告详情页（单栏公文排版 + 红头）
 * project  = 项目落地页 / 章节页（左栏章节导航；与下面的频道列表页 projects 不是一回事）
 * tags     = 标签归档页
 * series   = 系列文章页
 * projects = 项目频道列表页（项目落地页/章节页走 doc 布局的项目分支）
 * navlinks = 站点导航 / 软件工具（数据来自 frontmatter.categories）
 * friends  = 友情链接（数据来自 frontmatter.thanks / friends）
 */
export const layouts = {
  home: AyoHomeLayout,
  posts: AyoPostsLayout,
  doc: AyoDocLayout,
  post: AyoDocLayout,
  wiki: AyoWikiLayout,
  announcement: AyoAnnouncementLayout,
  project: AyoProjectLayout,
  tags: AyoTagsLayout,
  series: AyoSeriesLayout,
  projects: AyoProjectsLayout,
  navlinks: AyoNavLinksLayout,
  friends: AyoFriendsLayout,
};
