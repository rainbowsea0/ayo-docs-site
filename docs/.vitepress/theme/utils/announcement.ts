/**
 * 公告领域逻辑（L2）
 *
 * 排序、焦点条目、发文字号、位次都只在这里实现一份：公告列表页、首页焦点卡、详情页红头
 * 各自写过一套，改口径要满仓库找。本模块不 import loader（类型 type-only），也不碰 DOM。
 */
import type { AnnouncementItem } from "@theme/data/announcements.data";
import { formatDateTime, normalizeUrl } from "@theme/utils/format";

/** 公告排序：置顶（frontmatter.recommended）优先，其次按日期倒序 */
export const sortAnnouncements = (items: readonly AnnouncementItem[]): AnnouncementItem[] =>
  [...items].sort(
    (a, b) => Number(b.recommended) - Number(a.recommended) || (a.date < b.date ? 1 : -1)
  );

/** 焦点条目：置顶优先的第一条（首页中栏「公告」卡用） */
export const focusAnnouncement = (items: readonly AnnouncementItem[]): AnnouncementItem | null =>
  sortAnnouncements(items)[0] ?? null;

/** 当前公告在列表里的位次（从 1 起；0 = 不在列表里） */
export const announcementIndexOf = (items: readonly AnnouncementItem[], url: string): number =>
  sortAnnouncements(items).findIndex((item) => normalizeUrl(item.url) === normalizeUrl(url)) + 1;

/**
 * 发文字号
 *
 * 优先用 frontmatter 手写的 docNo；缺省时按公文格式拼「站名〔年〕序号号」。
 * 序号由调用方给出（公告列表里的位次），这里只负责格式与兜底：
 * 日期缺失时取当前年份，序号非法时退回 1 号——宁可号码不精确，也不显示 NaN。
 */
export const announceNo = (options: {
  manual?: unknown;
  date?: unknown;
  siteTitle?: string;
  serial?: number;
}): string => {
  const manual = String(options.manual ?? "").trim();
  if (manual) return manual;

  const year = formatDateTime(options.date).slice(0, 4) || String(new Date().getFullYear());
  const serial = Number(options.serial);
  const no = Number.isFinite(serial) && serial > 0 ? Math.floor(serial) : 1;

  return `${options.siteTitle ?? ""}〔${year}〕${no}号`;
};
