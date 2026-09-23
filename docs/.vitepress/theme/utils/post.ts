import type { PostItem } from "@theme/data/posts.data";
import { normalizeUrl } from "@theme/utils/format";

/** 系列信息（解析后的形态） */
export interface PostSeries {
  /** 系列名，未归系列时为空串 */
  name: string;
  /** 系列内序号，从 1 起；未归系列或非法值时为 0 */
  order: number;
  /** 侧栏用的章节短标题，未填时为空串 */
  title: string;
}

/** 归一化章节序号：只接受正数（1 起），其余一律 0 */
const normalizeOrder = (value: unknown): number => {
  const order = Number(value);
  return Number.isFinite(order) && order > 0 ? Math.floor(order) : 0;
};

/** 解析文章的系列声明 */
export const postSeries = (post: PostItem | null | undefined): PostSeries => {
  const raw = post?.series;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { name: "", order: 0, title: "" };
  }

  const obj = raw as Record<string, unknown>;
  return {
    name: String(obj.name ?? "").trim(),
    order: normalizeOrder(obj.order),
    title: String(obj.title ?? "").trim(),
  };
};

/** 是否归入某个系列（列表筛选、系列页聚合、首页挂件共用这一个判定） */
export const isSeriesPost = (post: PostItem): boolean => {
  const series = postSeries(post);
  return Boolean(series.name) && series.order > 0;
};

/** 章节显示名：优先 frontmatter 的章节短标题，未填时回退文章标题 */
export const postSeriesTitle = (post: PostItem): string => postSeries(post).title || post.title;

/** 发布时间倒序（不修改入参）；同一天的顺序由稳定排序保住扫描顺序，不再兜底 */
export const sortPostsByDate = (posts: readonly PostItem[]): PostItem[] =>
  [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

/**
 * 最近更新倒序
 *
 * updated 由 L1 从 git 提交时间取（见 posts.data.ts 的 gitUpdated），为空（文件没提交过）时回退创建时间。
 * 第二、三个键是兜底：一次批量提交会让一批文章的提交时间完全相同，
 * 只比 updated 的话顺序会退化成文件扫描顺序；同刻时按创建时间倒序、再按标题，结果才稳定。
 */
export const sortPostsByUpdated = (posts: readonly PostItem[]): PostItem[] =>
  [...posts].sort((a, b) => {
    const left = a.updated || a.date;
    const right = b.updated || b.date;
    if (left !== right) return left < right ? 1 : -1;
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.title.localeCompare(b.title, "zh");
  });

/** 按 URL 找文章：忽略 .html、尾斜杠与 index（详情页判定当前文章用） */
export const findPostByUrl = (posts: readonly PostItem[], url: string): PostItem | null =>
  posts.find((post) => normalizeUrl(post.url) === normalizeUrl(url)) ?? null;

/** 推荐文章：带推荐标记的文章按发布时间倒序；count > 0 时只取前 count 篇 */
export const recommendedPosts = (posts: readonly PostItem[], count = 0): PostItem[] => {
  const list = sortPostsByDate(posts).filter((post) => post.recommended);
  return count > 0 ? list.slice(0, count) : list;
};

/** 最近更新：按更新时间倒序取前 count 篇 */
export const latestPosts = (posts: readonly PostItem[], count: number): PostItem[] =>
  sortPostsByUpdated(posts).slice(0, count);

/**
 * 同一系列的章节，按 order 升序
 *
 * 同序号时用发布时间兜底：源数据里出现过两篇都写 order: 1 的情况，
 * 至少让顺序稳定，不随文件扫描顺序抖动。
 */
export const postsInSeries = (posts: readonly PostItem[], name: string): PostItem[] => {
  const keyword = name.trim();
  if (!keyword) return [];
  return posts
    .filter((post) => {
      const series = postSeries(post);
      return series.name === keyword && series.order > 0;
    })
    .sort((a, b) => postSeries(a).order - postSeries(b).order || (a.date < b.date ? -1 : 1));
};

/** 全部系列：按篇数降序（同篇数按名称，保证顺序稳定） */
export const groupPostsBySeries = (
  posts: readonly PostItem[]
): { name: string; posts: PostItem[] }[] => {
  const names = new Set<string>();
  for (const post of posts) {
    if (isSeriesPost(post)) names.add(postSeries(post).name);
  }
  return [...names]
    .map((name) => ({ name, posts: postsInSeries(posts, name) }))
    .sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, "zh"));
};

/** 当前文章在系列里的位次（从 1 起；不在系列里为 0） */
export const seriesIndexOf = (chapters: readonly PostItem[], url: string): number =>
  chapters.findIndex(
    (post) => normalizeUrl(post.url).replace(/\/$/, "") === normalizeUrl(url).replace(/\/$/, "")
  ) + 1;

/**
 * 上下篇
 *
 * 入参需按发布时间倒序（列表页就是这个顺序）：prev = 更新的一篇，next = 更早的一篇。
 * 当前文章不在列表里时两端都是 null（例如知识库笔记、公告）。
 */
export const adjacentPosts = (
  posts: readonly PostItem[],
  url: string
): { prev: PostItem | null; next: PostItem | null } => {
  const index = posts.findIndex((post) => normalizeUrl(post.url) === normalizeUrl(url));
  if (index < 0) return { prev: null, next: null };
  return { prev: posts[index - 1] ?? null, next: posts[index + 1] ?? null };
};
