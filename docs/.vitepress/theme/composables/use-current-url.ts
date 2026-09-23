import { computed, type ComputedRef } from "vue";
import { useData, useRoute } from "vitepress";

/**
 * 当前页地址（已去掉部署子路径，与加载器产出的 url 同口径）
 *
 * VitePress 2 的 route.path 是**带 base** 的：SSR 取 withBase(pendingPath)、浏览器取
 * location.pathname（见 dist/client/app/router.js 的 loadPage）。而 createContentLoader
 * 产出的 url 是不带 base 的站点绝对路径，两者直接比较在子路径部署（GitHub Pages）下永远不等，
 * 频道高亮、上下篇、系列位次、知识库树高亮、公告字号、正文锁定判定都会一起失效。
 * 所以「拿当前路径与加载器 url 对比」的地方一律用本 composable，不要直接用 route.path。
 */
export const useCurrentUrl = (): ComputedRef<string> => {
  const route = useRoute();
  const { site } = useData();

  return computed(() => {
    const path = route.path;
    const base = site.value.base || "/";
    // base 必定以 / 结尾，故减 1 位正好保留路径开头的 /
    return base === "/" || !path.startsWith(base) ? path : path.slice(base.length - 1);
  });
};
