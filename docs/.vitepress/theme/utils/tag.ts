import { tagSlug } from "@theme/utils/format";

export interface TagSource {
  url: string;
  title: string;
  date: string;
  source: "post" | "wiki";
  tags: string[];
}

export interface TagGroup {
  tag: string;
  slug: string;
  count: number;
  entries: TagSource[];
}

/**
 * 按标签聚合
 *
 * 组内条目按日期倒序；组间按条数倒序（同条数按标签名，保证顺序稳定）。
 * 没有任何标签的条目会被自然跳过。
 */
export const groupByTag = (entries: readonly TagSource[]): TagGroup[] => {
  const groups = new Map<string, TagGroup>();

  for (const entry of entries) {
    for (const tag of entry.tags) {
      const key = tagSlug(tag);
      let group = groups.get(key);
      if (!group) {
        group = { tag, slug: key, count: 0, entries: [] };
        groups.set(key, group);
      }
      group.count += 1;
      group.entries.push(entry);
    }
  }

  const byDateDesc = (a: TagSource, b: TagSource): number =>
    a.date === b.date ? 0 : a.date < b.date ? 1 : -1;

  return [...groups.values()]
    .map((group) => ({ ...group, entries: [...group.entries].sort(byDateDesc) }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh"));
};
