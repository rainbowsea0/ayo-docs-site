import { createContentLoader } from "vitepress";
import { firstParagraph, formatDateTime } from "../utils/format.ts";

/** 一条公告在列表/焦点卡里需要的字段 */
export interface AnnouncementItem {
  url: string;
  title: string;
  /** YYYY-MM-DD HH:mm:ss，无日期时为空串 */
  date: string;
  /** frontmatter.recommended === true */
  recommended: boolean;
  /** 发文字号（frontmatter.docNo；缺省时由详情页按「站名〔年〕序号号」拼） */
  docNo: string;
  /** 正文首段纯文本 */
  excerpt: string;
}

export default createContentLoader<AnnouncementItem[]>("announcement/**/index.md", {
  includeSrc: true,
  transform(raw) {
    return (
      raw
        .map((page) => {
          const fm = page.frontmatter;
          return {
            url: page.url,
            title: String(fm.title ?? ""),
            date: formatDateTime(fm.date),
            recommended: fm.recommended === true,
            docNo: String(fm.docNo ?? "").trim(),
            excerpt: firstParagraph(page.src),
          };
        })
        // 只保留真正的公告：有标题，且排除列表页自身（/announcement/ 的 index.md）
        .filter((item) => Boolean(item.title) && item.url !== "/announcement/")
    );
  },
});
