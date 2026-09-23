/**
 * 文章解锁状态
 *
 * 只管状态与本地凭证：**要不要锁**由 utils/article-lock 的 shouldLock 判定，
 * 输入解锁码、校验、写表单是解锁墙组件的事，把正文截断是 use-lock-cut 的事。
 *
 * 解锁凭证存在 localStorage：SSR 与前几次访问一律按未解锁渲染（无 JS 也能看到解锁墙），
 * 挂载后若本地已解锁再展开全文。
 */
import type { Ref } from "vue";
import { computed, onMounted, ref } from "vue";
import { onContentUpdated } from "vitepress";
import type { LockFacts } from "@theme/utils/article-lock";
import { isUnlockedLocally, shouldLock } from "@theme/utils/article-lock";

export const useArticleLock = (facts: Ref<LockFacts>) => {
  const unlocked = ref(false);

  /** 需要解锁：声明了 locked、确实有正文、且正文够长（短文不截） */
  const lockRequired = computed(() => shouldLock(facts.value));

  /** 锁定视图：正文截断 + 显示解锁墙 */
  const lockedView = computed(() => lockRequired.value && !unlocked.value);

  /** 从本地凭证同步解锁状态（挂载时、客户端路由切换后） */
  const syncLocal = (): void => {
    unlocked.value = isUnlockedLocally();
  };

  /** 解锁成功：本次会话内立即展开（落盘由解锁墙组件负责） */
  const unlock = (): void => {
    unlocked.value = true;
  };

  onMounted(syncLocal);
  onContentUpdated(syncLocal);

  return { unlocked, lockRequired, lockedView, syncLocal, unlock };
};
