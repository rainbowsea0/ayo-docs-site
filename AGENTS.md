# AI Agent 开发指引

# 项目栈: VitePress + TypeScript / ESM

# 包管理器: npm

## 技术栈约束

- 框架: VitePress 2.0.x (Vue3 + Vite)
- 语言: TypeScript，组件用 `<script setup lang="ts">`
- 模块系统: ESM only
- 配置入口: `.vitepress/config.mts`
- Vue: 组合式 API，禁止 Options API

## 编码规范

✅ const / let ❌ var
✅ import / export ❌ require / module.exports / exports
✅ 箭头函数 / 解构 / 模板字符串 / async·await
✅ TypeScript 类型标注 ❌ 非必要 any
❌ ES5 回调 / 字符串 + 拼接 / CommonJS 格式
❌ 无特殊要求时生成 JS，优先 TS

## VitePress 文件规范

# 配置文件 (.vitepress/config.mts) —— 示例：

# import { defineConfig } from "vitepress";

# export default defineConfig({

# title: "你的文档标题",

# description: "你的文档描述",

# themeConfig: { nav: [], sidebar: {} },

# });

# Vue 组件 (.vue) —— 示例：

# <script setup lang="ts">

# // 组合式 API

# </script>

# Markdown 规范

- 代码块必须声明语言
- 内部链接用相对路径

## UI 规范

- 禁止圆角胶囊效果: border-radius 统一为 0

## 回答流程

1. 需求不明确时禁止直接输出代码
2. 确认理解正确前，禁止写或改代码
3. 分轮次提问，每轮基于上轮回答追问，并说明提问意图
4. 确认无误后输出代码，说明改动内容及原因
