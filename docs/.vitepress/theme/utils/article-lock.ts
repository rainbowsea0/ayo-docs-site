import { siteEnv } from "@theme/settings/env";
import { LOCK_POLICY } from "@theme/settings/site";

export const LOCK_UNLOCK_CODE = siteEnv.VITE_AYO_LOCK_UNLOCK_CODE;
export const LOCK_STORAGE_KEY = "_unlock";

export interface LockFacts {
  /** frontmatter.locked（未声明时为 undefined） */
  locked?: unknown;
  /** 正文是否已随站点公开 */
  hasBody?: boolean;
  /** 正文字数（构建期统计值） */
  words?: number;
}

/**
 * 是否上锁
 */
export const shouldLock = (facts: LockFacts): boolean =>
  facts.locked === true && facts.hasBody === true && (facts.words ?? 0) >= LOCK_POLICY.minWords;

/** 校验解锁码：忽略大小写与首尾空白 */
export const isValidUnlockCode = (input: string): boolean =>
  input.trim().toLowerCase() === LOCK_UNLOCK_CODE.toLowerCase();

/** 本地是否已解锁 */
export const isUnlockedLocally = (): boolean => {
  try {
    return localStorage.getItem(LOCK_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

/** 记下解锁状态（localStorage 不可用时静默失败：本次会话内仍会解开） */
export const rememberUnlock = (): void => {
  try {
    localStorage.setItem(LOCK_STORAGE_KEY, "1");
  } catch {
    // 隐私模式 / 禁用存储：忽略，不阻断阅读
  }
};
