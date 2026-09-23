/**
 * 锁定页的正文截断（免费预览高度）
 */
import type { Ref } from "vue";
import { onBeforeUnmount, onMounted } from "vue";
import { onContentUpdated } from "vitepress";
import { LOCK_POLICY } from "@theme/settings/site";

export const useLockCut = (lockedView: Ref<boolean>) => {
  /** 正文容器：内容页里就是带 .vp-doc 的那层 */
  const findContent = (): HTMLElement | null =>
    document.querySelector<HTMLElement>(".ayo-doc__content");

  /** 截断容器：CSS 的 max-height 变量写在这层 */
  const findWrap = (): HTMLElement | null =>
    document.querySelector<HTMLElement>(".ayo-doc__lock-wrap");

  const apply = (): void => {
    const content = findContent();
    const wrap = findWrap();
    if (!content || !wrap) return;
    const preview = Math.round(content.scrollHeight * LOCK_POLICY.previewRatio);
    wrap.style.setProperty("--ayo-lock-max-h", `${preview}px`);
  };

  /** 等两帧再算：字体度量、行号这类改动通常在首帧之后才生效 */
  const applyAfterLayout = (): void => {
    requestAnimationFrame(() => requestAnimationFrame(apply));
  };

  onMounted(() => {
    apply();
    applyAfterLayout();
    // 窗口宽度变了会重排正文（图片高度、表格换行），预览高度得跟着重算
    window.addEventListener("resize", apply);
    window.addEventListener("load", apply);
    void document.fonts?.ready.then(apply).catch(() => undefined);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", apply);
    window.removeEventListener("load", apply);
  });

  // 客户端路由切换后正文换了，重新算比例（图片同样可能晚到）
  onContentUpdated(() => {
    apply();
    applyAfterLayout();
  });

  return { apply, reapply: apply };
};
