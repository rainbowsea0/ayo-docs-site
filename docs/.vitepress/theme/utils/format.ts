/**
 * 门户纯函数工具集（构建期数据加载器与运行期组件共用）
 *
 * 两点约束：
 *   ① 不依赖任何第三方库（本站不引入 dayjs）。日期格式化只用 Date 与 Intl；
 *   ② 构建期数据加载器（*.data.ts）由 VitePress 以「配置文件」方式载入，**解析不到 @theme 别名**，
 *      所以加载器只能相对引入本文件，且必须带扩展名（../utils/format.ts）；
 *      本文件也不得反向引入 @theme 下的任何东西。
 */

/** 补零 */
const pad = (value: number): string => String(value).padStart(2, "0");

/**
 * 首段摘要的字数上限（含结尾的省略号）
 *
 * 列表里的摘要只作预览，100 字足够看清一段在讲什么；改动这里会影响所有列表的摘要长度。
 */
const EXCERPT_MAX = 100;

/** 用本地时区把 Date 格式化为 "YYYY-MM-DD HH:mm:ss" */
const formatDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

/**
 * 统一 frontmatter 里的日期为 "YYYY-MM-DD HH:mm:ss"
 *
 * gray-matter 会把 YAML 的 `2026-09-18` 解析成 Date，写成字符串的则原样保留；
 * 只给日期的补 00:00:00，保证字符串比较排序等价于时间排序。
 */
export const formatDateTime = (value: unknown): string => {
  if (value instanceof Date) return formatDate(value);
  if (typeof value === "number") return formatDate(new Date(value));
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return "";
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text} 00:00:00` : text;
  }
  return "";
};

/** 只取日期部分，列表里展示用 */
export const dateOnly = (value: string): string => (value ? value.slice(0, 10) : "");

/**
 * "YYYY-MM-DD HH:mm:ss" → "MM-DD"
 *
 * 窄栏（首页右栏内宽只有 194px）里日期不能占掉标题一半宽度，年份收进 title，
 * 列表上只留月日；沿用 dateOnly 的字符串切片口径，不再引第二套日期解析。
 */
export const monthDay = (value: string): string => (value ? value.slice(5, 10) : "");

/** 页头日期：2026年9月18日 星期五（Intl 自带中文星期，无需 dayjs） */
export const formatToday = (date: Date = new Date()): string => {
  const weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][
    date.getDay()
  ];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekday}`;
};

/** 距起始日期已过去多少天（站点运行时间用；按自然日相减） */
export const daysSince = (start: string, now: Date = new Date()): number => {
  const from = new Date(`${dateOnly(start)}T00:00:00`);
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (Number.isNaN(from.getTime())) return 0;
  return Math.floor((to.getTime() - from.getTime()) / 86400000);
};

/** 把天数写成「N 年 M 天」 */
export const formatDuration = (days: number): string => {
  if (days < 0) return "刚刚起步";
  const years = Math.floor(days / 365);
  const rest = days % 365;
  return years > 0 ? `${years} 年 ${rest} 天` : `${days} 天`;
};

/** 统计正文字数：中文按字、西文按词近似合计 */
export const countWords = (text: string): number => {
  const han = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const words = text.match(/[A-Za-z0-9_]+/g)?.length ?? 0;
  return han + words;
};

/** 阅读时长（分钟，按 300 字/分钟估） */
export const readingTime = (words: number): number => Math.max(1, Math.round(words / 300));

/** 去掉开头的 frontmatter，返回正文源码 */
export const stripFrontmatter = (src: string): string => src.replace(/^---[\s\S]*?---\r?\n?/, "");

/**
 * 正文是否真有内容
 *
 * 用来识别「只有 frontmatter 的壳文章」（正文尚未随站公开的锁定文）：
 * 去掉 frontmatter 与 HTML 注释后还有非空白文本才算有正文。
 */
export const hasContent = (src: string | undefined): boolean => {
  if (!src) return false;
  return (
    stripFrontmatter(src)
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim().length > 0
  );
};

/** 取 markdown 源码首段纯文本，作为列表摘要 */
export const firstParagraph = (src: string | undefined): string => {
  if (!src) return "";
  const body = stripFrontmatter(src);
  for (const block of body.split(/\n{2,}/)) {
    const text = block.trim();
    if (!text) continue;
    // 跳过标题、代码块、图片、容器、引用等非正文首段
    if (/^(#{1,6}\s|```|~~~|:::|>|\||<|!\[)/.test(text)) continue;
    const plain = text
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`~]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    // 超过 100 字就是**截断**：补省略号。少了这一笔，列表上会出现
    // 「……而不是登录服」这种半截句子收尾，看起来像排版坏了。
    // 截断与否只有本层知道（拿到的是源文本），所以标记留在这一层。
    return plain.length > EXCERPT_MAX ? `${plain.slice(0, EXCERPT_MAX)}…` : plain;
  }
  return "";
};

/** 去掉 .html 后缀：把加载器产出的 url 与运行时 route.path 对齐 */
export const normalizeUrl = (url: string): string => url.replace(/\.html$/, "");

/**
 * 标签 → 锚点 id：去首尾空白、连续空白折叠成一个连字符
 *
 * 文章页底部的标签链接（/tags/#slug）与标签页分组标题的 id 共用本函数，
 * 保证两端锚点永远一致（中文标签直接做 id，HTML5 允许，浏览器也能定位）。
 */
export const tagSlug = (tag: string): string => tag.trim().replace(/\s+/g, "-");

/** 系列名 → 锚点 id：规则同 tagSlug（系列页分组 id 与系列云链接共用） */
export const seriesSlug = (name: string): string => name.trim().replace(/\s+/g, "-");

/** 把 markdown 源码粗剥成纯文本（只用于字数统计，不求精确） */
export const markdownToPlainText = (src: string): string =>
  stripFrontmatter(src)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[*_~>|]/g, " ");
