<script setup lang="ts">
/**
 * 农历日历挂件（首页左栏）
 *
 * 农历数据用 lunar-typescript（依赖已由项目引入，见 package.json）。
 * 这个库打包后约 400KB，而日历只在首页出现、且组件本身在 ClientOnly 里，
 * 因此这里用动态 import 按需加载：先出公历格子，农历行等库到位后自动补上，
 * 既不会让其它页面替首页付这份体积，也不会出现「空白日历」的闪烁。
 */
import { computed, onMounted, ref } from "vue";
import { AyoCard } from "@theme/components/common";

/** 农历日文案（如「初一」）；库未就绪时为 null */
type LunarDayOf = (year: number, month: number, day: number) => string;

let lunarDayOf: LunarDayOf | null = null;

/** 农历库是否已就绪：驱动 cells 重算 */
const lunarReady = ref(false);

const today = new Date();

const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth() + 1);

const WEEK_HEAD = ["日", "一", "二", "三", "四", "五", "六"];

/**
 * 当月 1 号是星期几（0 = 周日）
 *
 * 网格必须先在前面补这么多空格子，否则 1 号永远落在「日」列：
 * 2026-09-01 是周二，却排在日列下、今天（9/20 周日）显示在「五」列下面，
 * 而周末红字是按真实星期算的——「数字颜色对、列全错」，一眼就是坏日历。
 */
const firstWeekday = computed(() => new Date(viewYear.value, viewMonth.value - 1, 1).getDay());

interface DayCell {
  day: number;
  lunar: string;
  isToday: boolean;
  isWeekend: boolean;
}

const cells = computed<DayCell[]>(() => {
  const year = viewYear.value;
  const month = viewMonth.value;
  const lead = firstWeekday.value;
  const daysInMonth = new Date(year, month, 0).getDate();
  const list: DayCell[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = (lead + day - 1) % 7;
    list.push({
      day,
      // 读一下 lunarReady，农历库到位后触发重算
      lunar: lunarReady.value && lunarDayOf ? lunarDayOf(year, month, day) : "",
      isToday:
        year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate(),
      isWeekend: weekday === 0 || weekday === 6,
    });
  }
  return list;
});

const prevMonth = (): void => {
  viewMonth.value -= 1;
  if (viewMonth.value < 1) {
    viewMonth.value = 12;
    viewYear.value -= 1;
  }
};

const nextMonth = (): void => {
  viewMonth.value += 1;
  if (viewMonth.value > 12) {
    viewMonth.value = 1;
    viewYear.value += 1;
  }
};

const goToday = (): void => {
  viewYear.value = today.getFullYear();
  viewMonth.value = today.getMonth() + 1;
};

onMounted(async () => {
  try {
    const { Solar } = await import("lunar-typescript");
    lunarDayOf = (year, month, day) => Solar.fromYmd(year, month, day).getLunar().getDayInChinese();
    lunarReady.value = true;
  } catch (error) {
    // 加载失败就退化成普通公历日历，不再显示农历行
    console.warn("[calendar] 农历库加载失败，已退化为公历日历", error);
  }
});
</script>

<template>
  <ClientOnly>
    <AyoCard class="ayo-cal-card" title="农历日历" tone="accent">
      <template #action>
        <button class="ayo-cal__today" type="button" title="回到当月" @click="goToday">今</button>
      </template>

      <div class="ayo-cal">
        <div class="ayo-cal__head">
          <button class="ayo-cal__nav" type="button" aria-label="上个月" @click="prevMonth">
            ◀
          </button>
          <span class="ayo-cal__ym">{{ viewYear }} 年 {{ viewMonth }} 月</span>
          <button class="ayo-cal__nav" type="button" aria-label="下个月" @click="nextMonth">
            ▶
          </button>
        </div>

        <div class="ayo-cal__week">
          <span
            v-for="week in WEEK_HEAD"
            :key="week"
            :class="{ 'is-weekend': week === '日' || week === '六' }"
          >
            {{ week }}
          </span>
        </div>

        <div class="ayo-cal__grid">
          <!-- 前置空格子：把 1 号推到它真正的星期列（见 firstWeekday 注释） -->
          <div
            v-for="n in firstWeekday"
            :key="`lead-${n}`"
            class="ayo-cal__cell ayo-cal__cell--lead"
            aria-hidden="true"
          ></div>
          <div
            v-for="cell in cells"
            :key="cell.day"
            class="ayo-cal__cell"
            :class="{ 'is-today': cell.isToday }"
            :title="`${viewYear}-${viewMonth}-${cell.day}${cell.lunar ? ` 农历${cell.lunar}` : ''}`"
          >
            <span class="ayo-cal__day" :class="{ 'is-weekend': cell.isWeekend }">{{
              cell.day
            }}</span>
            <span class="ayo-cal__lunar">{{ cell.lunar }}</span>
          </div>
        </div>
      </div>
    </AyoCard>
  </ClientOnly>
</template>

<style scoped>
/* ≤1024px 单栏后这一栏只剩日历一张卡，会铺满整行：
   7 列被拉成 141px 一格，数字散在空格子中间，看着像坏掉的表格。
   给个宽度上限（每格约 60px）并居中——这一行只有它一个元素，
   靠左反而像两栏布局塌了一半。
   注意不能用 margin: 0 auto：本卡是纵向 flex 的条目，交叉轴上的 auto 外边距
   会取消 stretch，卡片会缩回内容的收缩宽度（实测只剩 184px） */
@media (max-width: 1024px) {
  .ayo-cal-card {
    align-self: center;
    width: 100%;
    max-width: 448px;
  }
}

.ayo-cal__today {
  margin-left: auto;
  padding: 0 5px;
  border: 1px solid var(--ayo-primary);
  background: none;
  color: var(--ayo-primary);
  font-family: inherit;
  font-size: 12px;
  line-height: 1.5;
  cursor: pointer;
}

.ayo-cal__today:hover {
  background-color: var(--ayo-primary-solid);
  color: #fff;
}

.ayo-cal {
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  padding: 6px;
}

.ayo-cal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 8px;
  color: var(--ayo-heading);
  /* 卡片正文统一 12px（月份行是卡内正文，不是卡片标题） */
  font-size: 12px;
}

.ayo-cal__nav {
  width: 24px;
  border: 1px solid var(--ayo-line);
  background: none;
  color: var(--ayo-text-2);
  font-family: inherit;
  font-size: 11px;
  line-height: 1.6;
  cursor: pointer;
}

.ayo-cal__nav:hover {
  border-color: var(--ayo-primary);
  color: var(--ayo-primary);
}

.ayo-cal__week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 3px;
  padding-bottom: 3px;
  border-bottom: 1px solid var(--ayo-line);
  color: var(--ayo-text-3);
  font-size: 11px;
  text-align: center;
}

.ayo-cal__week .is-weekend {
  color: var(--ayo-primary);
}

.ayo-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.ayo-cal__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1px 0;
  line-height: 1.2;
}

/* 前置空格子只是占位，不画东西（网格默认 stretch，高度自动跟齐首行） */
.ayo-cal__cell--lead {
  visibility: hidden;
}

.ayo-cal__day {
  color: var(--ayo-text);
  /* 卡片正文统一 12px；农历行（10px）仍比它小一档 */
  font-size: 12px;
  font-weight: bold;
}

.ayo-cal__day.is-weekend {
  color: var(--ayo-primary);
}

.ayo-cal__lunar {
  color: var(--ayo-text-5);
  font-size: 10px;
  white-space: nowrap;
}

.ayo-cal__cell.is-today {
  outline: 1px solid var(--ayo-primary);
  outline-offset: -1px;
  background-color: var(--ayo-primary-soft);
}

.ayo-cal__cell.is-today .ayo-cal__day {
  color: var(--ayo-primary);
}
</style>
