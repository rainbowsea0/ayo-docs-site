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
  date: string;
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

const sourceOf = (url: string): string => {
  const path = url.split(/[?#]/)[0].replace(/^\//, "");
  return path.endsWith("/") ? `${path}index.md` : `${path.replace(/\.html$/, "")}.md`;
};

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
