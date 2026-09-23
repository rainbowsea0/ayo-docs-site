/**
 * 列表页通用视图状态（关键词 + 分页）
 *
 * 「关键字 + trim/toLowerCase + 条件变化回到第一页 + slice 分页」这几行几乎每个列表页都在写，
 * 抄多份以后边界处理就开始不一致（有的忘了 trim、有的翻到第 3 页再搜索就空白）。这里只管视图状态，
 * 不懂业务：数据从哪来、怎么排序、额外筛选条件都由调用方决定。
 *
 * 说明：不是所有列表页都能套它——站点导航页是「分类 → 链接」的二级过滤，知识库/系列页是聚合而非分页，
 * 那几处保持各自的实现（共享的只有 normalizeKeyword 这个查询归一化）。
 */
import type { ComputedRef, Ref } from "vue";
import { computed, ref, watch } from "vue";

/** 查询串归一化：去掉首尾空白、统一小写（各列表页的搜索都用同一套口径） */
export const normalizeKeyword = (value: string): string => value.trim().toLowerCase();

export interface ListViewOptions<T> {
  /** 参与关键词匹配的文本（不传 = 不提供搜索，只做分页） */
  searchText?: (item: T) => string;
  /** 每页条数；不传或 <= 0 = 不分页 */
  pageSize?: number;
  /** 额外的筛选/排序状态：它变化时也要把页码复位（不传则只在关键词变化时复位） */
  resetOn?: () => unknown;
}

export const useListView = <T>(
  items: Ref<T[]> | ComputedRef<T[]>,
  options: ListViewOptions<T> = {}
) => {
  const keyword = ref("");
  const page = ref(1);
  const pageSize = options.pageSize ?? 0;
  const searchText = options.searchText;

  const query = computed(() => normalizeKeyword(keyword.value));

  const filtered = computed<T[]>(() => {
    if (!searchText || !query.value) return items.value;
    return items.value.filter((item) => searchText(item).toLowerCase().includes(query.value));
  });

  const total = computed(() => filtered.value.length);

  const pages = computed(() => (pageSize > 0 ? Math.max(1, Math.ceil(total.value / pageSize)) : 1));

  const pageItems = computed<T[]>(() => {
    if (pageSize <= 0) return filtered.value;
    const start = (page.value - 1) * pageSize;
    return filtered.value.slice(start, start + pageSize);
  });

  /** 条件变了就回第一页：否则翻着第 3 页再改条件会看到空列表 */
  const reset = (): void => {
    page.value = 1;
  };

  watch(options.resetOn ? [query, options.resetOn] : [query], reset);

  // 过滤后页数变少时把页码收回范围（v-model 直接改页码绕过了这里的 setPage）
  watch(pages, (max) => {
    if (page.value > max) page.value = max;
  });

  return { keyword, query, page, pageSize, pages, total, filtered, pageItems, reset };
};
