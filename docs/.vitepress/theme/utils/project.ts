import type { ProjectChapter, ProjectItem } from "@theme/data/projects.data";
import { normalizeUrl } from "@theme/utils/format";

/** 章节顺序：按 URL 升序（文件名用 01-、02- 数字前缀，天然等于阅读顺序） */
export const sortProjectChapters = (chapters: readonly ProjectChapter[]): ProjectChapter[] =>
  [...chapters].sort((a, b) => (a.link < b.link ? -1 : 1));

/** 当前路径是否属于该项目（首页或任一章节页）；路径忽略 .html 与尾斜杠 */
export const isInProject = (project: ProjectItem, path: string): boolean => {
  const home = normalizeUrl(project.home).replace(/\/$/, "");
  const page = normalizeUrl(path).replace(/\/$/, "");
  return page === home || page.startsWith(`${home}/`);
};

/** 找出路径所属的项目（不在任何项目里时返回 null） */
export const projectOf = (projects: readonly ProjectItem[], path: string): ProjectItem | null =>
  projects.find((project) => isInProject(project, path)) ?? null;

/** 左栏章节导航的当前项判断 */
export const isCurrentProjectLink = (link: string, path: string): boolean =>
  normalizeUrl(link).replace(/\/$/, "") === normalizeUrl(path).replace(/\/$/, "");
