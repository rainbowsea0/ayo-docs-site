/**
 * 知识库数据加载器：构建期扫描 wiki/**，按「主题目录」自动聚合
 *
 * 约定（两级，与参考站一致）：
 *   docs/wiki/index.md          知识库主页（hub，不入主题）
 *   docs/wiki/<主题>/index.md   主题页：frontmatter 声明 title / summary / order（可选）
 *   docs/wiki/<主题>/<笔记>.md  单篇笔记：title / date / tags / summary / order / group（可选）
 *
 * 笔记页标题下的信息行（创建日期 / 字数 / 阅读时长）由 frontmatter.date 触发（use-doc-meta 的 created）：
 * 写了 date 才渲染这一行，所以 hub 与主题页天然不带信息行，不必再靠组件开关去挡。
 * 日期分两种口径：创建日期 = 作者手写的 frontmatter.date；更新日期全站统一取自 git 末次提交时间——
 * 页面上的「更新日期 / 上次更新于」用 VitePress 的 page.lastUpdated，本文件里的列表日期用
 * VitePress 的 getGitTimestamp（同一个实现、同一份 git 数据），所以列表与页面不会互相打架。
 * frontmatter.updated 只在拿不到 git 时兜底（例如文件尚未提交）。
 *
 * 只有两级目录：笔记再多也平铺在主题目录下，用 frontmatter.group 做视觉分组（见 byGroupThenOrder），
 * 不靠再套一层目录——第三层目录会被当成一篇笔记，分组也就塌了。
 *
 * 排序：笔记先按 group 分组，组的位置 = 该组内最小的正 order（整组都没填 order 的垫底，再按组名拼音），
 * 组内按 order（正整数升序优先，未填或 0 的按标题序）；未写 group 的笔记排在所有分组之后。
 * 主题之间仍是 order + 标题序。主页主题卡、左栏知识树、主题页笔记清单共用这一份结果。
 * 只保留「存在主题页（index.md）」的目录：约定外的孤儿目录会让树/卡片生成指向不存在
 * 路径的链接，而这类链接是运行时渲染的，ignoreDeadLinks 检查不到。
 *
 * 两个坑同 posts.data.ts：
 *   ① glob 必须写相对 srcDir 的路径（不能带前导 /，Windows 上会被当成盘符根目录）；
 *   ② 本文件由 VitePress 以「配置文件」方式载入，解析不到 @theme 别名，
 *      相对引入必须带扩展名（../utils/format.ts）。
 */

import { createContentLoader, getGitTimestamp } from "vitepress";
import { dateOnly, formatDateTime } from "../utils/format.ts";

/** 单篇知识库笔记 */
export interface WikiNote {
  url: string;
  title: string;
  /** YYYY-MM-DD，无则空串 */
  updated: string;
  tags: string[];
  summary: string;
  order: number;
  /** 视觉分组名（frontmatter.group，空串 = 不分组）。只影响排序与左栏/清单里的小标题行 */
  group: string;
}

/** 一个知识库主题（对应 wiki/<slug>/ 目录） */
export interface WikiTopic {
  slug: string;
  url: string;
  title: string;
  summary: string;
  order: number;
  updated: string;
  notes: WikiNote[];
}

/** 标签解析：支持数组 / 单个字符串，去重去空 */
const resolveTags = (value: unknown): string[] => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  const out: string[] = [];
  for (const item of list) {
    const tag = typeof item === "string" ? item.trim() : "";
    if (tag && !out.includes(tag)) out.push(tag);
  }
  return out;
};

/** 组内排序：order 为正整数者升序优先，未填（或 0）的按标题序排在其后 */
const byNoteOrder = (a: WikiNote, b: WikiNote): number =>
  (a.order || Number.MAX_SAFE_INTEGER) - (b.order || Number.MAX_SAFE_INTEGER) ||
  a.title.localeCompare(b.title, "zh");

/**
 * 组顺序表：组名 → 该组内最小的「正 order」
 *
 * 组的位置由组内最小 order 决定（例：组内写 101 / 102 的组，排在写 201 的组前面），
 * 这样组顺序与组内顺序用同一套数字控制，不必为了排序去改组名。
 * 整组都没填 order 的组不入表，由 byGroupThenOrder 垫到已定序的组之后。
 */
const collectGroupRanks = (notes: WikiNote[]): Map<string, number> => {
  const ranks = new Map<string, number>();
  for (const note of notes) {
    if (!note.group || !note.order) continue;
    const current = ranks.get(note.group);
    if (current === undefined || note.order < current) ranks.set(note.group, note.order);
  }
  return ranks;
};

/**
 * 笔记排序：先按「分组」，组内再按 order（ranks 为 collectGroupRanks 的结果）
 *
 * 有 group 的聚在一起，组间按「组内最小 order」升序，同段位（或都没填 order）再按组名拼音；
 * 没写 group 的排在所有分组之后。分组只是视觉分层（左栏树与主题页清单插一行小标题），
 * 目录层级仍是「主题 / 笔记」两层——主题页判定看的是路径段数，与 group 无关。
 */
const byGroupThenOrder =
  (ranks: Map<string, number>) =>
  (a: WikiNote, b: WikiNote): number => {
    if (!a.group !== !b.group) return a.group ? -1 : 1;
    if (a.group !== b.group) {
      const rankA = ranks.get(a.group) ?? Number.MAX_SAFE_INTEGER;
      const rankB = ranks.get(b.group) ?? Number.MAX_SAFE_INTEGER;
      if (rankA !== rankB) return rankA - rankB;
      return a.group.localeCompare(b.group, "zh");
    }
    return byNoteOrder(a, b);
  };

/**
 * 文件的更新日期：「YYYY-MM-DD」，取不到 git 时间则返回空串
 *
 * 用 VitePress 自己导出的 getGitTimestamp —— config.mts 的 lastUpdated 就是它，
 * 口径因此与页面上的「更新日期 / 上次更新于」完全一致（git 末次提交的作者时间，本地时区取到日）。
 *
 * 加载器拿不到 srcDir（createContentLoader 只给 url/src/frontmatter），而 getGitTimestamp 要
 * 一个相对 cwd 的路径，所以按两种常见 cwd 依次试：从 docs 里跑（wiki/…）与从仓库根跑（docs/wiki/…）。
 * 两次都拿不到（文件没提交过 / 不是 git 仓库 / 浅克隆里没这条记录）就交给 frontmatter.updated 兜底。
 */
const gitUpdated = async (relativePath: string): Promise<string> => {
  const stamp =
    (await getGitTimestamp(relativePath)) || (await getGitTimestamp(`docs/${relativePath}`));
  return stamp > 0 ? dateOnly(formatDateTime(new Date(stamp))) : "";
};

export default createContentLoader<WikiTopic[]>("wiki/**/*.md", {
  async transform(raw) {
    const topics = new Map<string, WikiTopic>();
    /** 有主题页（index.md）的 slug */
    const withTopicPage = new Set<string>();

    for (const page of raw) {
      // 知识库主页不入主题
      if (page.url === "/wiki/") continue;

      const fm = (page.frontmatter ?? {}) as Record<string, unknown>;
      const parts = page.url
        .replace(/^\/wiki\//, "")
        .split("/")
        .filter(Boolean);
      if (!parts.length) continue;

      const slug = parts[0];
      const isTopicPage = parts.length === 1;

      let topic = topics.get(slug);
      if (!topic) {
        topic = {
          slug,
          url: `/wiki/${slug}/`,
          title: "",
          summary: "",
          order: 0,
          updated: "",
          notes: [],
        };
        topics.set(slug, topic);
      }

      if (isTopicPage) {
        withTopicPage.add(slug);
        topic.url = page.url;
        topic.title = String(fm.title ?? "").trim() || slug;
        topic.summary = String(fm.summary ?? "").trim();
        topic.order = Number(fm.order) || 0;
        // 主题卡上的「最近更新」= 主题页与它名下笔记里最新的那个更新日期（见 topic-cards.vue）
        topic.updated =
          (await gitUpdated(`wiki/${slug}/index.md`)) || dateOnly(formatDateTime(fm.updated));
        continue;
      }

      const base = (parts[parts.length - 1] ?? "").replace(/\.html$/, "");
      const source = `wiki/${parts.join("/")}`.replace(/\.html$/, ".md");
      topic.notes.push({
        url: page.url,
        title: String(fm.title ?? "").trim() || base,
        updated: (await gitUpdated(source)) || dateOnly(formatDateTime(fm.updated)),
        tags: resolveTags(fm.tags),
        summary: String(fm.summary ?? "").trim(),
        order: Number(fm.order) || 0,
        group: String(fm.group ?? "").trim(),
      });
    }

    const clean: WikiTopic[] = [];
    for (const topic of topics.values()) {
      if (!withTopicPage.has(topic.slug)) continue;
      topic.notes.sort(byGroupThenOrder(collectGroupRanks(topic.notes)));
      clean.push(topic);
    }
    clean.sort(
      (a, b) =>
        (a.order || Number.MAX_SAFE_INTEGER) - (b.order || Number.MAX_SAFE_INTEGER) ||
        a.title.localeCompare(b.title, "zh")
    );
    return clean;
  },
});
