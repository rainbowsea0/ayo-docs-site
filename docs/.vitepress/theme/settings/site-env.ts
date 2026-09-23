/** 环境变量原始值：loadEnv 与 import.meta.env 都是「字符串表」 */
export type RawSiteEnv = Record<string, string | undefined>;

/** 子路径归一化：VitePress 内部按 joinPath 拼接，务必保证首尾都有 / */
const normalizeBase = (value: string): string =>
  value && value !== "/" ? `/${value.replace(/^\/+|\/+$/g, "")}/` : "/";

/** 必填字段声明：desc 只用于报错文案 */
const FIELDS = {
  VITE_AYO_SITE_URL: { desc: "站点正式域名（sitemap 与文章分享链接用，结尾不带 /）" },
  VITE_AYO_EDIT_LINK_PATTERN: {
    desc: "「编辑此页」地址模板（:path 由 VitePress 替换成文件路径）",
  },
  VITE_AYO_EDIT_LINK_TYPE: { desc: "代码托管平台名（拼出「在 X 上编辑此页」文案）" },
  VITE_AYO_LOCK_UNLOCK_CODE: { desc: "固定解锁码（临时方案，见 utils/article-lock.ts）" },
} as const satisfies Record<string, { desc: string }>;

/** 可选字段声明：缺失或写空都落到 fallback，不报错 */
const OPTIONAL_FIELDS = {
  VITE_AYO_BASE: {
    desc: "部署子路径（GitHub Pages 项目站点填 /<仓库名>/，根路径部署填 /）",
    fallback: "/",
    parse: normalizeBase,
  },
} as const satisfies Record<
  string,
  { desc: string; fallback: string; parse: (v: string) => string }
>;

/** 全部必填键（顺序与 .env.example 一致） */
export const SITE_ENV_KEYS = Object.keys(FIELDS) as (keyof typeof FIELDS)[];

/** 解析后的部署配置：这里没有数字字段，所以值一律是 string */
export type SiteEnv = Record<keyof typeof FIELDS, string> &
  Record<keyof typeof OPTIONAL_FIELDS, string>;

export const readSiteEnv = (raw: RawSiteEnv): SiteEnv => {
  const values: Record<string, string> = {};
  const missing: string[] = [];

  for (const key of SITE_ENV_KEYS) {
    const value = String(raw[key] ?? "").trim();

    if (!value) {
      missing.push(`  ${key}　— ${FIELDS[key].desc}`);
      continue;
    }

    values[key] = value;
  }

  // 缺失项一次性全列出来：补配置时一轮就能补齐，不用「改一个跑一次」
  if (missing.length) {
    throw new Error(
      [
        "站点部署配置缺失 —— 请在仓库根目录 .env 中补齐（模板见 .env.example）：",
        `\n缺少 ${missing.length} 项：\n${missing.join("\n")}`,
      ].join("")
    );
  }

  // 可选键永远有值：缺失或写空都落回 fallback
  for (const key of Object.keys(OPTIONAL_FIELDS) as (keyof typeof OPTIONAL_FIELDS)[]) {
    values[key] = OPTIONAL_FIELDS[key].parse(
      String(raw[key] ?? "").trim() || OPTIONAL_FIELDS[key].fallback
    );
  }

  return values as SiteEnv;
};
