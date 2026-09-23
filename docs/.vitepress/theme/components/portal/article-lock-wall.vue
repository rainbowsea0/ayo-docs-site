<script setup lang="ts">
/**
 * 文章解锁墙
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { withBase } from "vitepress";
import { AyoButton } from "@theme/components/common";
import { isValidUnlockCode, rememberUnlock } from "@theme/utils/article-lock";
import { LOCK_POLICY } from "@theme/settings/site";

const emit = defineEmits<{ unlocked: [] }>();

const open = ref(false);
const code = ref("");
const error = ref("");
const inputEl = ref<HTMLInputElement | null>(null);

const openModal = (): void => {
  error.value = "";
  open.value = true;
};

const closeModal = (): void => {
  open.value = false;
};

const submit = (): void => {
  if (!code.value.trim()) {
    error.value = "请输入解锁码";
    return;
  }
  if (!isValidUnlockCode(code.value)) {
    error.value = "解锁码不正确，请核对公众号回复的解锁码";
    return;
  }
  rememberUnlock();
  error.value = "";
  open.value = false;
  emit("unlocked");
};

/** 弹窗打开时锁住页面滚动，并把焦点放进输入框 */
watch(open, (value) => {
  document.body.style.overflow = value ? "hidden" : "";
  if (value) void nextTick(() => inputEl.value?.focus());
});

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape") closeModal();
};

onMounted(() => document.addEventListener("keydown", onKeydown));

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <div class="ayo-lock">
    <div class="ayo-lock__fade">
      <AyoButton variant="primary" type="button" @click="openModal">阅读全文</AyoButton>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="open" class="ayo-lock-modal" @click.self="closeModal">
      <div
        class="ayo-lock-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ayo-lock-modal-title"
      >
        <button class="ayo-lock-modal__close" type="button" aria-label="关闭" @click="closeModal">
          ×
        </button>

        <p id="ayo-lock-modal-title" class="ayo-lock-modal__title">🔒 本文已锁定</p>
        <p class="ayo-lock-modal__hint">
          扫码前往公众号回复「<b>{{ LOCK_POLICY.wechatKeyword }}</b
          >」获取解锁码
        </p>

        <img
          class="ayo-lock-modal__qr"
          :src="withBase(LOCK_POLICY.qrSrc)"
          :alt="`公众号二维码：回复「${LOCK_POLICY.wechatKeyword}」获取解锁码`"
        />

        <form class="ayo-lock-modal__form" @submit.prevent="submit">
          <input
            ref="inputEl"
            v-model="code"
            class="ayo-input ayo-lock-modal__input"
            type="text"
            placeholder="请输入解锁码"
            aria-label="解锁码"
            autocomplete="off"
            @input="error = ''"
          />
          <!-- size="sm"：28px 定高，与 .ayo-input 的 28px 严格同高（md 是 padding 撑出来的 35px） -->
          <AyoButton size="sm" type="submit">解锁</AyoButton>
        </form>

        <p v-if="error" class="ayo-lock-modal__error" role="alert">{{ error }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ayo-lock {
  position: relative;
  height: 0;
}

.ayo-lock__fade {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 200px;
  padding-bottom: 52px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, var(--ayo-bg) 92%);
  pointer-events: none;
}

.ayo-lock__fade > * {
  pointer-events: auto;
}

/* 弹窗 */
.ayo-lock-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.45);
}

.ayo-lock-modal__panel {
  position: relative;
  width: 320px;
  max-width: 100%;
  padding: 22px 20px 20px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  box-shadow: var(--ayo-shadow-hover);
  text-align: center;
}

.ayo-lock-modal__close {
  position: absolute;
  top: 2px;
  right: 6px;
  padding: 0 4px;
  border: 0;
  background: none;
  color: var(--ayo-text-4);
  font-size: 22px;
  line-height: 1.4;
  cursor: pointer;
}

.ayo-lock-modal__close:hover {
  color: var(--ayo-text);
}

.ayo-lock-modal__title {
  margin: 0;
  color: var(--ayo-text);
  font-size: 15px;
  font-weight: bold;
}

.ayo-lock-modal__hint {
  margin: 6px 0 12px;
  color: var(--ayo-text-3);
  font-size: 13px;
}

.ayo-lock-modal__hint b {
  color: var(--ayo-primary);
}

.ayo-lock-modal__qr {
  display: block;
  width: 128px;
  height: auto;
  margin: 0 auto 14px;
  padding: 4px;
  border: 1px solid var(--ayo-border);
  background-color: var(--ayo-bg);
}

.ayo-lock-modal__form {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.ayo-lock-modal__input {
  width: 176px;
  min-width: 0;
}

.ayo-lock-modal__error {
  margin: 8px 0 0;
  color: var(--ayo-red);
  font-size: 13px;
}

@media (max-width: 720px) {
  .ayo-lock__fade {
    height: 150px;
    padding-bottom: 32px;
  }
}
</style>
