---
title: '一键部署可视化 Docker 管理平台（Portainer CE）'
date: 2026-09-15
origin: 原创
author: zhangheng
tags:
  - Docker
  - Portainer
locked: true
---

:::warning 注意
安装前需要确保对应端口未被占用。
<br>
生产环境<span style="color: red">**严禁直接暴露到公网环境**</span>，建议使用 https 或者 反向代理，或者更安全的内网访问。
:::

| 端口 | 介绍          |
|------|---------------|
| 9000 | Web 端访问地址（HTTP） |
| 9443 | Web 端访问地址（HTTPS） |
| 8000 | Edge Agent 隧道端口，不用 Edge 可不开放 |

## 一、什么是 Portainer CE？
Portainer 是一个轻量级的 Docker 可视化管理平台，提供 Web UI，用于管理容器、镜像、网络、数据卷、Compose 应用栈、日志与终端等。
<br>
Portainer 也可以在一个轻量级的 GitOps 中充当 CD，这里就不做过多赘述了，想要了解的小伙伴可以看站长的另一篇文章[【部署轻量级 GitOps】](/posts/260915_gitea_gitops/)。
<br>
版本选择：镜像标签常用 lts（长期支持）与 sts（短期支持）。生产环境建议固定到具体版本号（如 2.21.x）以保证可回滚。
<br>
具体最新版本请以 Docker Hub 上 portainer/portainer-ce 的实际标签为准。


## 二、部署方式

:::warning 前提条件
1. 选择 Docker 部署需要首先[【安装 Docker】](https://docs.docker.top/engine/install/ubuntu/index.htm#install-using-the-repository)
<br>
2. 选择 Compose 部署需要首先[【安装 Docker Compose】](https://docs.docker.com/compose/install/linux/#install-using-the-repository)，如果有不熟悉的小伙伴建议百度或者使用 AI 工具安装完成后再来执行操作。
<br>
可以通过命令 `docker compose version` 来验证是否安装成功
:::

### 1. Docker 一键部署脚本

```shell
docker run -d \
  --name portainer \
  --restart=always \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_dat:/data \
  portainer/portainer-ce:lts
```

### 2. Compose 部署【推荐】

```yaml [compose.yml]
# 数据卷
volumes:
  data:
    name: portainer_dat

services:
  portainer:
    container_name: portainer
    image: portainer/portainer-ce:2.45.0
    restart: unless-stopped
    ports:
      - 9000:9000
    volumes:
      - data:/data
      - /var/run/docker.sock:/var/run/docker.sock
    network_mode: 'bridge'
```

## 三、初始化账户

部署成功后需要前往 Web 端创建一个默认的`管理员`账户，通过浏览器访问`127.0.0.1:9000`进入 Web 端配置。

## 四、部署 hello world

接下来部署一个官方默认的 hello world 来测试部署环境是否正常

## 结语
恭喜你已经学会了如何部署 社区版 Portainer，相对来说使用友好的 WebUI 界面操作还是非常方便的！