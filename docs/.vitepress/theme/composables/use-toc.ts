/**
 * 页内目录（右栏，只取 h2 / h3）
 *
 * VitePress 2 的 `page.headers` 构建期恒为空数组（官方默认主题也改成从 DOM 读取），
 * 所以目录在正文渲染后扫 `.vp-doc` 里的标题自行构建，并跟随滚动高亮。
 *
 * 采集、高亮、监听生命周期都归这里：布局只负责把 items 画出来，
 * 不用再自己维护 ref + scroll/resize/contentUpdated 三处监听。
 */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { onContentUpdated } from "vitepress";

export interface TocItem {
  text: string;
  href: string;
  level: number;
}

export const useToc = () => {
  const items = ref<TocItem[]>([]);
  const activeSlug = ref("");
  const hasToc = computed(() => items.value.length > 0);

  const headings = (): HTMLElement[] =>
    Array.from(document.querySelectorAll<HTMLElement>(".vp-doc h2[id], .vp-doc h3[id]"));

  const collect = (): void => {
    items.value = headings().map((node) => ({
      // 标题里的锚点会带一个零宽空格，去掉再展示
      text: (node.textContent ?? "").replace(/[\u200b\u00a0]/g, "").trim(),
      href: `#${node.id}`,
      level: node.tagName === "H3" ? 3 : 2,
    }));
  };

  /**
   * 重算当前滚动到的标题
   *
   * 阈值必须跟着吸顶页头高度算：锚点落位在「页头高 + scroll-margin-top」处，
   * 阈值若小于它，刚跳过去的那一节就不算「已滚过」，高亮会停在上一节
   * （曾经写死 120px，而桌面页头 111px + 24px = 135px，就是这么错的）。
   * 另外滚到页面底部时锁定最后一条：末尾的小节可能永远滚不到阈值上方。
   */
  const updateActive = (): void => {
    const nodes = headings();
    if (!nodes.length) {
      activeSlug.value = "";
      return;
    }

    const headerHeight =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--ayo-header-h")
      ) || 0;
    // 比 scroll-margin-top 多留 8px 余量，保证刚跳过去的标题被判为「已滚过」
    const threshold = headerHeight + 32;

    let current = "";
    for (const node of nodes) {
      if (node.getBoundingClientRect().top <= threshold) current = node.id;
    }

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = nodes[nodes.length - 1].id;
    }

    activeSlug.value = current;
  };

  let queued = false;

  /** 滚动处理按帧节流：一帧最多算一次 */
  const onScroll = (): void => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      updateActive();
    });
  };

  /** 窗口尺寸变化：页头可能折行，阈值跟着变 */
  const onResize = (): void => {
    onScroll();
  };

  /** 点击目录时立刻高亮，不等下一帧 */
  const setActive = (href: string): void => {
    activeSlug.value = href.replace(/^#/, "");
  };

  onMounted(() => {
    collect();
    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
  });

  // 客户端路由切换后正文变了，重新采集并定位
  onContentUpdated(() => {
    collect();
    updateActive();
  });

  return { items, activeSlug, hasToc, collect, updateActive, setActive };
};
