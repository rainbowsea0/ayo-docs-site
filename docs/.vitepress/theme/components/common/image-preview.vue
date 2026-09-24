<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const url = ref("");
const alt = ref("");

const close = (): void => {
  url.value = "";
};

const onClick = (event: MouseEvent): void => {
  const target = event.target;
  if (!(target instanceof HTMLImageElement)) return;
  if (!target.closest(".vp-doc")) return;
  // 图片套在链接里时（徽章、可点击截图）预览优先，否则点一下又开图又跳页
  if (target.closest("a")) event.preventDefault();
  // 懒加载的图用 currentSrc 更准（markdown.image.lazyLoad 只加 loading 属性，src 始终可用）
  url.value = target.currentSrc || target.src;
  alt.value = target.alt;
};

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape") close();
};

watch(url, (value) => {
  document.body.style.overflow = value ? "hidden" : "";
});

onMounted(() => {
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClick);
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="url"
      class="ayo-image-preview"
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      @click.self="close"
    >
      <button class="ayo-image-preview__close" type="button" aria-label="关闭预览" @click="close">
        ×
      </button>

      <img class="ayo-image-preview__img" :src="url" :alt="alt" />
    </div>
  </Teleport>
</template>

<style scoped>
.ayo-image-preview {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: rgba(0, 0, 0, 0.82);
  cursor: zoom-out;
}

.ayo-image-preview__img {
  max-width: 100%;
  max-height: 100%;
  cursor: default;
}

.ayo-image-preview__close {
  position: absolute;
  top: 12px;
  right: 16px;
  padding: 0 6px;
  border: 0;
  background: none;
  color: rgba(255, 255, 255, 0.75);
  font-size: 28px;
  line-height: 1.2;
  cursor: pointer;
}

.ayo-image-preview__close:hover {
  color: #fff;
}

@media (max-width: 720px) {
  .ayo-image-preview {
    padding: 12px;
  }
}
</style>
