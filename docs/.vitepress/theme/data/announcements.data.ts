/**
 * 公告列表数据加载器（L1 取数层）：构建期扫描 announcement/**（每个公告一个目录，index.md 为正文）
 *
 * 与 posts.data.ts 同构：目录里可以放图片等资源；只读事实，不排序——
 * 置顶优先 / 日期倒序 / 发文字号这些规则在 L2（theme/utils/announcement.ts）。
 * 摘要在构建期用 firstParagraph 从 markdown 源码里取，和文章列表保持同一套逻辑。
 *
 * 两个坑同 posts.data.ts：glob 不能带前导 /，相对引入必须带扩展名。
 */

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
