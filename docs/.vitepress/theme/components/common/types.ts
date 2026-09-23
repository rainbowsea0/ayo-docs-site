/**
 * 组件层共享类型
 *
 * 放 .ts 而不是 .vue：`<script setup>` 里的 `export interface` 在 TS 看来
 * 属于 `*.vue` 环境声明（只声明了 default 导出），barrel 再 `export type` 就会报
 * TS2614「Module '*.vue' has no exported member」。
 */

/** 顶部滚动条（免责声明/要闻）的条目 */
export interface TickerItem {
  text: string;
  url: string;
}
