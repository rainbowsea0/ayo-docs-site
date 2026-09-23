/**
 * 文章列表数据加载器（L1 取数层）
 *
 * 只做四件事：扫文件、把 frontmatter 读成能跨进程传输的原始事实、从 git 取每篇的最近更新时间、
 * 算**只有构建期算得出来**的源文本派生量（正文是否为空 / 字数 / 首段摘要——src 在运行时不存在，
 * 这几项没法下沉；git 时间同理，浏览器端拿不到）。
 * 排序、系列解析、推荐筛选、相邻篇这些领域与展示规则全在 L2（theme/utils/post.ts），本层不参与。
 *
 * 两个坑记在这里：
 *   ① glob 必须写相对 srcDir 的路径（不能带前导 /）。Windows 上 path.resolve 会把
 *      "/posts/**\/*.md" 当成盘符根目录，结果扫到 F:/posts/**，永远为空；
 *   ② 本文件由 VitePress 直接以「配置文件」方式载入，解析不到 @theme 别名，
 *      相对引入必须带扩展名（../utils/format.ts）。
 */

import { createContentLoader, getGitTimestamp } from "vitepress";
import {
  countWords,
  firstParagraph,
  formatDateTime,
  hasContent,
  markdownToPlainText,
} from "../utils/format.ts";

/** 一篇文章在列表里需要的原始事实 */
export interface PostItem {
  url: string;
  title: string;
  /**
   * "YYYY-MM-DD HH:mm:ss"，未填时为空串
   *
   * 这里格式化不是「展示」：YAML 会把日期解析成 Date 对象，loader 数据要序列化给客户端，
   * 先统一成字符串是取数层的本分。
   */
  date: string;
  /**
   * "YYYY-MM-DD HH:mm:ss"；来源是**构建期取到的 git 提交时间**（见 gitUpdated），
   * 文件没提交过 / 不在 git 仓库里时回退 frontmatter.updated，两者都没有才是空串
   */
  updated: string;
  tags: string[];
  /** frontmatter.series 原样透传（只认嵌套写法），解析与判定见 utils/post.ts 的 postSeries */
  series: unknown;
  /** frontmatter.recommended === true */
  recommended: boolean;
  /** 原创 / 转载，缺省为空串 */
  origin: string;
  /** 正文首段摘要（源文本派生） */
  excerpt: string;
  /** 构建期统计的正文词数（详情页首帧展示用） */
  words: number;
  /** 正文是否真有内容（false = 只有 frontmatter 的壳文章） */
  hasBody: boolean;
}

/**
 * 由 URL 反推源文件路径
 *
 * createContentLoader 只给 url、不给文件路径。目录式文章是 posts/<名字>/index.md，
 * 单文件是 posts/<名字>.md，两种都要认（本站目前都是前者）。
 */
const sourceOf = (url: string): string => {
  const path = url.split(/[?#]/)[0].replace(/^\//, "");
  return path.endsWith("/") ? `${path}index.md` : `${path.replace(/\.html$/, "")}.md`;
};

/**
 * 最近更新时间：从 git 提交时间取，"YYYY-MM-DD HH:mm:ss"；取不到返回空串
 *
 * 与 wiki.data.ts 同一套口径 —— 站点所有「更新日期」只认 VitePress 导出的 getGitTimestamp
 * （config.mts 的 lastUpdated 用的就是它），列表里再手写一份 frontmatter.updated 必然与详情页打架。
 * 加载器拿不到 srcDir，而 getGitTimestamp 要一个相对 cwd 的路径，所以两种常见跑法各探一次：
 * 从 docs/ 里构建（posts/…）与从仓库根构建（docs/posts/…）。
 *
 * 与 wiki 那套的唯一差别：这里保留到秒。字段声明就是"YYYY-MM-DD HH:mm:ss"，而且列表要按它排序，
 * 批量提交会让一批文章的提交时间落在同一天，精确到日就分不开了。
 */
const gitUpdated = async (relativePath: string): Promise<string> => {
  const stamp =
    (await getGitTimestamp(relativePath)) || (await getGitTimestamp(`docs/${relativePath}`));
  return stamp > 0 ? formatDateTime(new Date(stamp)) : "";
};

export default createContentLoader<PostItem[]>("posts/**/*.md", {
  includeSrc: true,
  async transform(raw) {
    const items: PostItem[] = [];
    for (const post of raw) {
      const fm = post.frontmatter;
      const rawTags = Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : [];
      items.push({
        url: post.url,
        title: String(fm.title ?? ""),
        date: formatDateTime(fm.date),
        updated: (await gitUpdated(sourceOf(post.url))) || formatDateTime(fm.updated),
        tags: rawTags.map(String).filter((tag) => tag.trim()),
        series: fm.series,
        recommended: fm.recommended === true,
        origin: String(fm.origin ?? ""),
        excerpt: firstParagraph(post.src),
        words: post.src ? countWords(markdownToPlainText(post.src)) : 0,
        hasBody: hasContent(post.src),
      });
    }
    // 只保留真正的文章：有标题，且排除文章频道页自身（/posts/ 下的 index.md）
    return items.filter((post) => Boolean(post.title) && post.url !== "/posts/");
  },
});
