import { ref } from "vue";

/** 图标来源描述（导航条目 / 友链条目都满足该结构） */
export interface SiteIconTarget {
  /** 站点链接（仅 http(s) 会取图标） */
  url: string;
  /** 手动指定图标（URL / emoji），优先于自动探测 */
  icon?: string;
}

const ICON_API = "https://faviconsnap.com/api/favicon";

/** 兜底底色候选：按名称哈希取固定色（同一站点始终同色） */
const FALLBACK_COLORS = ["#0455a4", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2"];

/** 兜底字符：中文名取前 2 字（如「雷池」），其它取首字母大写 */
export const fallbackChar = (name: string): string => {
  const text = name.trim();
  if (!text) return "?";
  const chars = Array.from(text);
  const first = chars[0];
  if (/[\u4e00-\u9fff]/.test(first)) return chars.slice(0, 2).join("");
  return first.toUpperCase();
};

/** 兜底底色：按名称哈希取固定色 */
export const fallbackColor = (name: string): string => {
  let hash = 0;
  for (const ch of name) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined) hash = (hash * 31 + cp) % 9973;
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
};

export const useSiteIcons = () => {
  /** 已加载完成的站点 url 集合（驱动「转圈 → 淡入」） */
  const loaded = ref(new Set<string>());
  /** 加载失败、已降级为彩色首字母的站点 url 集合 */
  const errored = ref(new Set<string>());

  /** 图标地址：手动 icon 优先；外部站点走 faviconsnap（按域名）；站内路径返回空串 */
  const srcOf = (target: SiteIconTarget): string => {
    if (target.icon) return target.icon;
    if (!/^https?:\/\//i.test(target.url)) return "";
    try {
      const host = new URL(target.url).hostname;
      return `${ICON_API}?url=${encodeURIComponent(host)}`;
    } catch {
      return "";
    }
  };

  const isLoaded = (target: SiteIconTarget): boolean => loaded.value.has(target.url);

  const isErrored = (target: SiteIconTarget): boolean => errored.value.has(target.url);

  const markLoaded = (target: SiteIconTarget): void => {
    loaded.value = new Set(loaded.value).add(target.url);
  };

  const markErrored = (target: SiteIconTarget): void => {
    errored.value = new Set(errored.value).add(target.url);
  };

  return { srcOf, isLoaded, isErrored, markLoaded, markErrored };
};
