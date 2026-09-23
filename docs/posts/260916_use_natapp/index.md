---
title: '使用 NATAPP 实现内网穿透'
date: 2026-09-16
origin: 原创
author: zhangheng
tags:
  - 内网穿透
locked: true
---

:::info 简介
在对接微信、支付宝等第三方平台时，回调接口的开发测试往往需要频繁打包上传代码，流程繁琐且效率低下。

**内网穿透**可以将本地指定端口映射到公网，使得第三方平台能够直接回调到本地服务，从而实现无需部署的本地开发与调试。

本文介绍内网穿透工具 [NATAPP](https://natapp.cn) 的基本使用方法。

**如果你拥有一台公网服务器，也可以使用 [FRP](https://github.com/fatedier/frp)、[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) 等方案，本文不再赘述。**
:::

:::warning 安全提示
内网穿透会将你的本地服务暴露到公网，请**勿用于生产环境**。调试完成后请及时关闭隧道，避免接口被恶意调用。涉及支付、用户信息等敏感业务时尤其要注意。
:::

## 一、为什么需要内网穿透？

本地开发环境中，你的电脑处于内网（局域网）中，没有公网 IP，外部服务无法直接访问你本地运行的服务。

### 1.1 典型场景

- **微信公众号 / 小程序开发**：需要配置回调 URL，微信服务器必须能访问到该地址
- **支付宝 / 微信支付回调**：支付结果通知需要回调到你的服务端
- **Webhook 调试**：GitHub、飞书等平台的 Webhook 无法推送到 localhost
- **远程演示**：临时将本地项目分享给客户预览

内网穿透的本质是：**借助一台具有公网 IP 的中转服务器，将外部请求转发到你的本地服务。**

### 1.2 整体流程

整体流程如下图所示 **[建议放大观看]** ：

```mermaid
sequenceDiagram
    participant 用户 as 终端用户
    participant 平台 as 第三方平台<br>(微信/支付宝)
    participant 服务器 as NATAPP服务器<br>(公网)
    participant 客户端 as NATAPP客户端<br>(本地)
    participant 服务 as 本地开发服务<br>(localhost:8080)

    Note over 客户端, 服务器: 隧道建立（客户端启动时）
    客户端->>服务器: 携带 authtoken 发起认证
    服务器-->>客户端: 认证通过，分配公网域名
    客户端->>服务器: 建立持久 TCP 长连接

    Note over 用户, 服务: 请求转发（业务触发时）
    用户->>平台: 触发操作（扫码/支付/消息）
    平台->>服务器: 发送回调请求至公网域名
    服务器->>客户端: 通过隧道转发请求
    客户端->>服务: 转发至 localhost:8080

    Note over 用户, 服务: 响应回传
    服务-->>客户端: 返回业务处理结果
    客户端-->>服务器: 通过隧道回传响应
    服务器-->>平台: 返回 HTTP 响应
    平台-->>用户: 展示最终结果
```


## 二、NATAPP 是什么？

[NATAPP](https://natapp.cn) 是一个基于 NAT 技术的内网穿透服务平台，核心特点：

- 免费版可用，付费版支持自定义域名和固定端口
- 无需公网服务器，注册后即可使用
- 支持 HTTP / HTTPS / TCP 协议
- 提供客户端覆盖 Windows / macOS / Linux，也可在树莓派等设备上运行

:::tip 免费版的限制
免费隧道分配的公网域名是随机生成的，且每次重启客户端都会变化。

这意味着每次重启后，你都需要回到微信 / 支付宝后台重新配置回调 URL。如果只是临时调试可以接受，但对接支付回调这类需要稳定地址的场景，建议使用付费版的固定域名。
:::

## 三、快速上手

整体流程为：注册账号 → 实名认证 → 领取免费隧道 → 复制 authtoken → 启动客户端

由于操作过于简单，具体安装以及操作步骤请按照官网文档中使用，这里就不在叙述了。

- [NATAPP 下载方式](https://natapp.cn/download)
- [NATAPP 安装方式](https://natapp.cn/article/natapp_newbie)
- [NATAPP 配置启动](https://natapp.cn/article/config_ini)

### 3.1 直接附带 `authtoken` 启动

在对应 netapp.exe 文件目录下通过 cmd 运行如下命令
```shell [CMD 命令面板]
.\natapp.exe -authtoken=你的token -log=none
```

:::tip
-log=none 会关闭日志输出。初次调试建议去掉该参数，方便查看连接日志；确认隧道正常后再关闭。
:::

### 3.2 读取配置文件启动

在对应 natapp.exe 文件目录下创建一个名为 config.ini文件配置如右侧所示，然后运行
::: code-group

```shell [CMD 命令面板]
.\natapp.exe
```

```ini [config.ini]
# 将本文件放置于 natapp 同级目录，程序将读取 [default] 段
# 在命令行参数模式如 natapp -authtoken=xxx 等相同参数将会覆盖掉此配置
# 命令行参数 -config= 可以指定任意 config.ini 文件
[default]
authtoken=                      # 对应一条隧道的 authtoken
log=none                        # log 日志文件，可指定本地文件，none=不做记录，stdout=直接屏幕输出，默认为 none
loglevel=ERROR                  # 日志等级 DEBUG, INFO, WARNING, ERROR 默认为 DEBUG
http_proxy=                     # 代理设置 如 http://10.123.10.10:3128 非代理上网用户请务必留空
```
:::


## 四、常见问题
### Q：启动后提示 authtoken 无效？
检查 token 是否复制完整（不要带空格），以及隧道是否已过期或被删除。

### Q：公网域名每次重启都变？
这是免费版的限制。需要固定域名请升级付费版，或改用 FRP + 自有服务器。

### Q：如何关闭隧道？
在运行客户端的终端按 Ctrl + C 即可。若需后台运行，可用 nohup（Linux/macOS）或注册为系统服务。

### Q：连不上、没有任何输出？
去掉 -log=none，把 loglevel 调为 DEBUG，查看具体报错。

## 五、小结
NATAPP 适合临时、快速地将本地服务暴露到公网，用于第三方平台回调调试。免费版够用但有域名不固定的限制，正式对接建议使用付费固定域名，或自建 FRP / Cloudflare Tunnel 方案。

恭喜！到此你已经学会了如何使用内网穿透。
