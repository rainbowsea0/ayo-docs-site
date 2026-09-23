<script setup lang="ts">
/**
 * 交互终端演示（markdown 里用 <r-terminal /> 调用）
 *
 * 组件名保持参考站的 `r-terminal`：文章正文是按该标签写的，改名就得改正文。
 * 用法（正文示例）：
 *   <ClientOnly>
 *     <r-terminal title="…" prompt="$" :script="[{ cmd: '…', pause: 600, out: [['输出','ok']] }]" />
 *   </ClientOnly>
 *
 * 行为：点击封面 ▶ 开始逐行播放（每步可设 pause 停顿），输出行按 out/ok/warn 着色，
 * 播完可重播；开启 prefers-reduced-motion 时直接铺满全部内容，不做打字动画。
 * 样式遵循本站 UI 规范：直角、等宽字体走 --ayo-font-mono。
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

type LineKind = "out" | "ok" | "warn";

type OutItem = string | [string, LineKind?] | { text: string; kind?: LineKind };

interface TerminalStep {
  cmd: string;
  out?: OutItem[];
  /** 该步播放后的停顿毫秒数 */
  pause?: number;
}

const props = withDefaults(
  defineProps<{
    script: TerminalStep[];
    title?: string;
    prompt?: string;
    autoPlay?: boolean;
  }>(),
  {
    title: "terminal",
    prompt: "$",
    autoPlay: false,
  }
);

interface TermLine {
  text: string;
  kind: "cmd" | LineKind;
}

const lines = ref<TermLine[]>([]);
const bodyEl = ref<HTMLElement | null>(null);
const status = ref<"idle" | "playing" | "done">("idle");
let timers: number[] = [];

const clearTimers = (): void => {
  timers.forEach((id) => window.clearTimeout(id));
  timers = [];
};

const schedule = (fn: () => void, ms: number): void => {
  timers.push(window.setTimeout(fn, ms));
};

const normalizeOut = (item: OutItem): TermLine => {
  if (typeof item === "string") return { text: item, kind: "out" };
  if (Array.isArray(item)) return { text: item[0], kind: item[1] ?? "out" };
  return { text: item.text, kind: item.kind ?? "out" };
};

/** 直接把全部内容铺出来（重播的终态 / 减少动效时的降级） */
const fillAll = (): void => {
  const all: TermLine[] = [];
  for (const step of props.script) {
    all.push({ text: step.cmd, kind: "cmd" });
    for (const item of step.out ?? []) all.push(normalizeOut(item));
  }
  lines.value = all;
  status.value = "done";
};

const play = (): void => {
  clearTimers();
  lines.value = [];
  status.value = "playing";

  let elapsed = 400;
  for (const step of props.script) {
    schedule(() => lines.value.push({ text: step.cmd, kind: "cmd" }), elapsed);
    elapsed += 240;
    for (const item of step.out ?? []) {
      const { text, kind } = normalizeOut(item);
      schedule(() => lines.value.push({ text, kind }), elapsed);
      elapsed += 200;
    }
    elapsed += step.pause ?? 300;
  }
  schedule(() => {
    status.value = "done";
  }, elapsed + 200);
};

/** 行数变化后把终端滚到底部，跟住最新输出 */
watch(
  lines,
  async () => {
    await nextTick();
    if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight;
  },
  { deep: true }
);

const replay = (): void => {
  play();
};

onMounted(() => {
  if (!props.script?.length) return;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (reduceMotion) {
    fillAll();
    return;
  }
  if (props.autoPlay) play();
});

onBeforeUnmount(clearTimers);
</script>

<template>
  <div class="ayo-term">
    <div class="ayo-term__bar">
      <span class="ayo-term__dot ayo-term__dot--r" aria-hidden="true"></span>
      <span class="ayo-term__dot ayo-term__dot--y" aria-hidden="true"></span>
      <span class="ayo-term__dot ayo-term__dot--g" aria-hidden="true"></span>
      <span class="ayo-term__title">{{ props.title }}</span>

      <span v-if="status !== 'idle'" class="ayo-term__status" :class="`is-${status}`">
        <span class="ayo-term__status-dot" aria-hidden="true"></span>
        {{ status === "playing" ? "演示中" : "演示结束" }}
      </span>
      <button
        v-if="status === 'done'"
        class="ayo-term__replay"
        type="button"
        title="重新播放演示"
        @click="replay"
      >
        ↻ 重播
      </button>
    </div>

    <div ref="bodyEl" class="ayo-term__body" role="log" aria-live="polite">
      <div
        v-for="(line, index) in lines"
        :key="index"
        class="ayo-term__line"
        :class="`is-${line.kind}`"
      >
        <span v-if="line.kind === 'cmd'" class="ayo-term__prompt">{{ props.prompt }}</span>
        <span v-if="line.text">{{ line.text }}</span>
        <span v-if="index === lines.length - 1" class="ayo-term__cursor" aria-hidden="true">▍</span>
      </div>

      <div v-if="status === 'idle' && script?.length" class="ayo-term__cover">
        <button class="ayo-term__play" type="button" title="开始播放演示" @click="play">▶</button>
        <span class="ayo-term__cover-text">点击播放演示</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ayo-term {
  margin: 16px 0;
  border: 1px solid #30363d;
  background-color: #0d1117;
  font-family: var(--ayo-font-mono);
}

.ayo-term__bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-bottom: 1px solid #30363d;
  background-color: #161b22;
}

/* 指示灯：本项目 UI 规范禁止圆角，做成直角小方块 */
.ayo-term__dot {
  width: 9px;
  height: 9px;
  background-color: #30363d;
}

.ayo-term__dot--r {
  background-color: #ff5f56;
}

.ayo-term__dot--y {
  background-color: #ffbd2e;
}

.ayo-term__dot--g {
  background-color: #27c93f;
}

.ayo-term__title {
  margin-left: 6px;
  color: #8b949e;
  font-size: 13px;
}

.ayo-term__status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 8px;
  margin-left: auto;
  color: #8b949e;
  font-size: 13px;
}

.ayo-term__status-dot {
  width: 7px;
  height: 7px;
  background-color: #8b949e;
}

.ayo-term__status.is-playing .ayo-term__status-dot {
  background-color: #d29922;
  animation: ayo-term-blink 1.1s ease-in-out infinite;
}

.ayo-term__status.is-playing {
  color: #d29922;
}

.ayo-term__status.is-done .ayo-term__status-dot {
  background-color: #3fb950;
}

.ayo-term__status.is-done {
  color: #3fb950;
}

@keyframes ayo-term-blink {
  50% {
    opacity: 0.35;
  }
}

.ayo-term__replay {
  padding: 1px 8px;
  border: 1px solid #30363d;
  background-color: #21262d;
  color: #8b949e;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
}

.ayo-term__replay:hover {
  border-color: #3fb950;
  color: #3fb950;
}

.ayo-term__body {
  position: relative;
  height: 300px;
  overflow-y: auto;
  padding: 10px 14px;
  color: #c9d1d9;
  font-size: 13px;
  line-height: 1.8;
}

.ayo-term__cover {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: rgba(13, 17, 23, 0.72);
}

.ayo-term__play {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  padding-left: 3px;
  border: 2px solid #3fb950;
  background-color: rgba(63, 185, 80, 0.12);
  color: #3fb950;
  font-family: inherit;
  font-size: 21px;
  line-height: 1;
  cursor: pointer;
}

.ayo-term__play:hover {
  background-color: #3fb950;
  color: #0d1117;
}

.ayo-term__cover-text {
  color: #8b949e;
  font-size: 13px;
}

.ayo-term__line {
  white-space: pre-wrap;
  word-break: break-all;
}

.ayo-term__line.is-cmd {
  color: #e6edf3;
}

.ayo-term__prompt {
  margin-right: 8px;
  color: #3fb950;
}

.ayo-term__line.is-ok {
  color: #3fb950;
}

.ayo-term__line.is-warn {
  color: #d29922;
}

.ayo-term__cursor {
  margin-left: 2px;
  color: #3fb950;
  animation: ayo-term-cursor 1s steps(1) infinite;
}

@keyframes ayo-term-cursor {
  50% {
    opacity: 0;
  }
}

@media (max-width: 640px) {
  .ayo-term__body {
    height: 260px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ayo-term__cursor,
  .ayo-term__status.is-playing .ayo-term__status-dot {
    animation: none;
  }
}
</style>
