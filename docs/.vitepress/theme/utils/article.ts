import { siteEnv } from "@theme/settings/env";
import { AUTHORS, getAuthor } from "./authors";

/**
 * 站点正式域名（与 config.mts 的 sitemap.hostname 同源：都取 .env 的 VITE_AYO_SITE_URL）
 */
export const SITE_URL = siteEnv.VITE_AYO_SITE_URL;

export interface ResolvedAuthor {
  name: string;
  avatar?: string;
  url?: string;
}

export interface ResolvedLicense {
  name: string;
  url?: string;
}

/** 视为非原创的 origin 值 */
const NON_ORIGINAL = new Set(["转载"]);

const DEFAULT_ORIGIN = "原创";

const DEFAULT_LICENSE: ResolvedLicense = {
  name: "CC BY-NC-SA 4.0",
  url: "https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh",
};

/** frontmatter 里的 author / authors 用 key 引用，查不到时当纯名字展示 */
const resolveAuthor = (keyOrName: string): ResolvedAuthor => {
  const author = getAuthor(keyOrName);
  return author
    ? { name: author.name, avatar: author.avatar, url: author.url }
    : { name: keyOrName };
};

/** 解析作者列表：缺省回退 AUTHORS 第一位，再回退站点名 */
export const resolveAuthors = (
  frontmatter: Record<string, unknown>,
  siteTitle: string
): ResolvedAuthor[] => {
  const raw = frontmatter.authors ?? frontmatter.author;
  const list = raw ? (Array.isArray(raw) ? raw : [raw]) : null;
  if (list?.length) {
    return list.map((item) => resolveAuthor(String(item)));
  }
  const first = AUTHORS[0];
  return first
    ? [{ name: first.name, avatar: first.avatar, url: first.url }]
    : [{ name: siteTitle }];
};

/** 是否原创：origin 为「转载」返回 false，缺省 / 其它值视为原创 */
export const resolveIsOriginal = (frontmatter: Record<string, unknown>): boolean =>
  !NON_ORIGINAL.has(String(frontmatter.origin ?? DEFAULT_ORIGIN).toLowerCase());

/** 版权协议：frontmatter.license 支持字符串或 { name, url } */
export const resolveLicense = (frontmatter: Record<string, unknown>): ResolvedLicense => {
  const license = frontmatter.license;
  if (typeof license === "string" && license.trim()) return { name: license.trim() };
  if (license && typeof license === "object") {
    const obj = license as Record<string, unknown>;
    const name = String(obj.name ?? "").trim();
    if (name) return { name, url: obj.url ? String(obj.url) : undefined };
  }
  return { ...DEFAULT_LICENSE };
};

/** frontmatter.articleUrl：手工指定的本文链接（留空则按站点域名拼） */
export const resolveArticleUrl = (frontmatter: Record<string, unknown>): string =>
  String(frontmatter.articleUrl ?? "").trim();

/** 按站点域名 + 相对路径拼出可直接分享的文章链接 */
export const buildArticleUrl = (siteUrl: string, base: string, relativePath: string): string => {
  if (!siteUrl) return "";
  let path = relativePath.replace(/^\/+/, "");
  if (path === "index.md") {
    path = "";
  } else if (path.endsWith("/index.md")) {
    path = `${path.slice(0, -"/index.md".length)}/`;
  } else if (path.endsWith(".md")) {
    path = `${path.slice(0, -3)}.html`;
  }
  const parts = [siteUrl.replace(/\/+$/, "")];
  const cleanBase = base.replace(/^\/+|\/+$/g, "");
  if (cleanBase) parts.push(cleanBase);
  if (path) parts.push(path);
  return parts.join("/");
};
