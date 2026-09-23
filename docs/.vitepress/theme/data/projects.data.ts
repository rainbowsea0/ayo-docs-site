/**
 * 项目数据加载器（L1 取数层）：构建期扫描 projects/**，按目录聚合项目与章节
 *
 * 约定（单一事实来源 = 文件结构，和参考站一致）：
 *   - 项目   = 目录下有 index.md 的 projects/<name>/（url 为 /projects/<name>/）
 *   - 章节   = 同目录下其余 md，文件名用数字前缀（01-、02-…）
 *   - 标题   = frontmatter.title；项目简介 = index.md 正文首段
 * 新增项目/章节只写 md，不用改配置。章节排序与「当前页属于哪个项目」在 L2（utils/project）。
 *
 * 两个坑同 posts.data.ts：glob 不能带前导 /，相对引入必须带扩展名。
 */

import { createContentLoader } from "vitepress";
import { dateOnly, firstParagraph, formatDateTime } from "../utils/format.ts";

/** 项目里的一章 */
export interface ProjectChapter {
  title: string;
  link: string;
}

/** 一个项目 */
export interface ProjectItem {
  name: string;
  /** 项目落地页 url，形如 /projects/<name>/ */
  home: string;
  desc: string;
  date: string;
  /** frontmatter.status：计划中 / 更新中 / 已完结… */
  status: string;
  chapters: ProjectChapter[];
}

export default createContentLoader<ProjectItem[]>("projects/**/*.md", {
  includeSrc: true,
  transform(raw) {
    const groups = new Map<string, ProjectItem>();

    for (const page of raw) {
      const matched = /^(\/projects\/[^/]+\/)/.exec(page.url);
      if (!matched) continue;
      const dir = matched[1];

      let project = groups.get(dir);
      if (!project) {
        project = { name: "", home: dir, desc: "", date: "", status: "", chapters: [] };
        groups.set(dir, project);
      }

      const fm = page.frontmatter;

      if (page.url === dir) {
        // 项目落地页 index.md
        project.name = String(fm.title ?? "").trim();
        project.desc = firstParagraph(page.src);
        project.date = dateOnly(formatDateTime(fm.date));
        project.status = String(fm.status ?? "").trim();
        continue;
      }

      // 章节页
      const fallback = (page.url.split("/").pop() ?? "").replace(/\.html$/, "");
      project.chapters.push({ title: String(fm.title ?? "").trim() || fallback, link: page.url });
    }

    // 只保留有名字的完整项目（章节顺序属于展示口径，由 L2 的 utils/project 决定）
    return [...groups.values()].filter((project) => Boolean(project.name));
  },
});
