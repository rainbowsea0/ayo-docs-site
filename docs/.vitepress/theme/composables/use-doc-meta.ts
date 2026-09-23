/**
 * 文档元信息（标题 / 日期 / 原创 / 类型 / 标签 / 字数 / 阅读时长 / 编辑链接 / 上次更新）
 *
 * 这里只做「取事实 + 算派生」：frontmatter 的解析口径、DOM 词数兜底、
 * 编辑链接模板与 git 更新时间的回退顺序都收在一处，布局直接拿来渲染。
 *
 * 正文字数有两套来源：SSR 首帧用构建期统计值（L1 的 words），
 * 正文渲染完成后再按 DOM 精确统计一次——所以这里同时接 onMounted 与 onContentUpdated。
 */
import type { Ref } from "vue";
import { computed, onMounted, ref } from "vue";
import { onContentUpdated, useData } from "vitepress";
import type { PostItem } from "@theme/data/posts.data";
import { siteEnv } from "@theme/settings/env";
import { editLinkText } from "@theme/settings/site";
import { countWords, dateOnly, formatDateTime, readingTime } from "@theme/utils/format";

export const useDocMeta = (post: Ref<PostItem | null>) => {
  const { frontmatter, page, theme } = useData();

  const title = computed(() => String(frontmatter.value.title ?? "").trim());

  const created = computed(() => formatDateTime(frontmatter.value.date));

  const updated = computed(
    () => formatDateTime(page.value.lastUpdated || "") || formatDateTime(frontmatter.value.updated)
  );

  const origin = computed(() => String(frontmatter.value.origin ?? "").trim());

  const articleType = computed(() => String(frontmatter.value.type ?? "").trim());

  /** 是否隐藏标题下的信息行（frontmatter.meta: false） */
  const hideMeta = computed(() => frontmatter.value.meta === false);

  /** frontmatter.tags 支持字符串或数组 */
  const tags = computed<string[]>(() => {
    const raw = frontmatter.value.tags;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return list.map(String).filter((tag) => tag.trim());
  });

  /** DOM 精确统计值：0 表示还没统计，回退到构建期统计 */
  const domWords = ref(0);

  /** 构建期注入的字数兜底（config.mts 给知识库笔记页写入的 frontmatter.words），没有则为 0 */
  const buildWords = computed(() => Number(frontmatter.value.words) || 0);

  /** 字数：客户端 DOM 统计优先 → 文章列表的构建期统计 → 本页的构建期统计 */
  const wordCount = computed(() => domWords.value || post.value?.words || buildWords.value);

  const readingMinutes = computed(() => readingTime(wordCount.value));

  const recount = (): void => {
    const el = document.querySelector(".vp-doc");
    domWords.value = el ? countWords(el.textContent ?? "") : 0;
  };

  onMounted(recount);
  onContentUpdated(recount);

  /** 「编辑此页」：链接模板取自 themeConfig.editLink（config.mts 单一事实来源） */
  const editLink = computed(() => {
    const pattern = theme.value.editLink?.pattern ?? "";
    if (!pattern) return "";
    return typeof pattern === "function"
      ? pattern(page.value)
      : pattern.replace(/:path/g, page.value.filePath);
  });

  const editText = computed(
    () => theme.value.editLink?.text || editLinkText(siteEnv.VITE_AYO_EDIT_LINK_TYPE)
  );

  /**
   * 上次更新时间（编辑行左侧）
   *
   * 与信息行的「更新日期」同源（git 末次提交优先，回退 frontmatter.updated），只取到日。
   */
  const lastUpdated = computed(() => dateOnly(updated.value));

  return {
    title,
    created,
    updated,
    origin,
    articleType,
    hideMeta,
    tags,
    wordCount,
    readingMinutes,
    recount,
    editLink,
    editText,
    lastUpdated,
  };
};
