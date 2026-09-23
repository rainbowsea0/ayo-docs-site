---
title: 常用命令速查
date: 2026-09-20
tags: [Linux]
summary: 磁盘 / 内存 / 网络 / 日志排查高频命令
order: 1
layout: wiki
---

## 资源排查

- 磁盘：`df -h`、`du -sh */`
- 内存：`free -h`
- CPU / 进程：`top`、`ps aux --sort=-%cpu`
- 网络：`ss -tlnp`、`curl -v`

## 日志

`tail -f` 跟随、`grep -n -C 5` 带上下文、`journalctl -u 服务名 -n 100` 看服务日志。
