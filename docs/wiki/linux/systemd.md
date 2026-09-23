---
title: systemd 服务管理速查
date: 2026-09-20
tags: [Linux, systemd]
summary: 编写 Unit + 开机自启 + 滚动日志配置
order: 2
layout: wiki
---

## 最小 Unit 示例

`/etc/systemd/system/demo.service`：

```ini
[Unit]
Description=demo service

[Service]
ExecStart=/opt/demo/bin/start.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## 常用命令

- `systemctl daemon-reload`：重载 Unit
- `systemctl enable --now demo`：开机自启 + 立即启动
- `journalctl -u demo -f`：跟随查看服务日志
