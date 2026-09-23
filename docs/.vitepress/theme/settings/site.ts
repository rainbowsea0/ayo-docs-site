/** 站点标题（页头 / <title> / 作者回退名） */
export const SITE_TITLE = "国王号航行日志";

/** 站点描述（页头副标题） */
export const SITE_DESCRIPTION = "一个学习，生活记录的个人站";

/** 站长邮箱（404 页「向站长反馈」的收件地址） */
export const FEEDBACK_MAIL = "849758831@qq.com";

/** 「在 X 上编辑此页」句式：X 取 .env 的 VITE_AYO_EDIT_LINK_TYPE，config 与客户端兜底共用这一份 */
export const editLinkText = (platform: string): string => `在 ${platform} 上编辑此页`;

/** 社交入口：喂给 config.mts 的 themeConfig.socialLinks，首页「与我联系」卡片跟着走 */
export const SOCIAL_LINKS: { icon: string; link: string }[] = [
  { icon: "github", link: "https://github.com/rainbowsea0" },
  { icon: "juejin", link: "https://juejin.cn/user/2803113451627931" },
];

/**
 * giscus 评论区参数（讨论存在 GitHub Discussions）
 *
 * repo / repoId / categoryId 都是公开字符串：giscus 前端本来就要把它们带在 iframe 地址上。
 * origin 只用于校验父页面收到的 postMessage 来源，只有自建 giscus 时才需要改。
 */
export const GISCUS = {
  origin: "https://giscus.app",
  repo: "rainbowsea0/ayo-docs-site",
  repoId: "R_kgDOUjJetw",
  category: "General",
  categoryId: "DIC_kwDOUjJet84DGDrZ",
} as const;

/**
 * 文章锁定策略
 *
 * 解锁码不在这里：它是唯一「随环境变化 / 可能临时更换」的值，仍取 .env。
 * 下面四个是改一次长期不动的口味与文案，跟着代码走即可（构建期校验见 utils/article-lock.ts）。
 */
export const LOCK_POLICY = {
  /** 免费预览比例：正文总高 × 该值（0~1 之间的小数）*/
  previewRatio: 0.3,
  /** 上锁的最少字数：少于这个字数即使写了 locked 也直接放行（避免把短文截成一句话） */
  minWords: 200,
  /** 公众号自动回复关键词（解锁文案里引导读者回复的那个词） */
  wechatKeyword: "文章解锁",
  /** 解锁墙上的公众号二维码（docs/public 下的静态资源） */
  qrSrc: "/wxid.webp",
} as const;
