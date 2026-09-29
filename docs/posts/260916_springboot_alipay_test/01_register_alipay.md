---
title: 'Spring Boot 接入支付宝沙箱环境【注册配置沙箱】'
date: 2026-09-23
origin: 转载
articleUrl: https://opendocs.alipay.com/common/02kkv7?pathHash=9a45a6d6
author: 支付宝
series:
  name: '支付宝沙箱接入'
  order: 1
  title: '注册配置支付宝沙箱'
tags:
  - Spring Boot
locked: false
---

:::info 前提条件
已经入驻支付宝开放平台，详情请参见 [开发者账号注册](https://opendocs.alipay.com/common/08yegz)。
:::

## 一、什么是沙箱环境？

沙箱环境是支付宝开放平台为开发者提供的与生产环境完全隔离的联调测试环境，开发者在沙箱环境中完成的接口调用不会对生产环境中的数据造成任何影响。
<br/>
沙箱为开放的产品提供 有限功能范围 的支持，可以覆盖产品的绝大部分核心链路和对接逻辑，便于开发者快速学习、尝试、开发和调试。
<br/>
沙箱环境会自动完成或忽略一些场景的业务门槛，例如：开发者无需等待产品开通，即可直接在沙箱环境调用接口，使得开发集成工作可以与业务流程并行，从而提高项目整体的交付效率。

注意：
- 由于沙箱环境并非 100% 与生产环境一致，接口的实际响应逻辑请以生产环境为准，沙箱环境开发调试完成后，**仍然需要在生产环境进行测试验收**。
- 沙箱环境拥有完全独立的数据体系，沙箱环境下返回的数据（例如用户 ID 等）在生产环境中都是不存在的，开发者不可将沙箱环境返回的数据与生产环境中的数据混淆。

## 二、配置沙箱应用环境

### 进入沙箱界面

使用开发者账号登录 [开放平台控制台](https://openhome.alipay.com/develop/manage) > **开发工具推荐**，点击 沙箱 即可进入 [沙箱环境](https://openhome.alipay.com/develop/sandbox/app)。
![沙箱界面图片](./assets/sandbox.webp)

### 查询支持产品

**说明**：沙箱环境支持的产品，可以在沙箱控制台 **沙箱应用** > **产品列表** 中查看。
![沙箱支持产品图片](./assets/zc-products.webp)

## 三、配置接口加签方式

在沙箱进行调试前需要确保已经配置密钥/证书用于加签，支付宝提供了 **系统默认密钥** 及 **自定义密钥** 两种方式进行配置。

### 系统默认密钥

开发者如需使用系统默认密钥/证书，可在 **开发信息** 中选择 **系统默认密钥**。
<br/>
注意：使用 [API 在线调试工具](https://open.alipay.com/api/apiDebug) 调试 OpenAPI 必须使用 **系统默认密钥**。
![系统默认密钥图片](./assets/sys_type.webp)

### 自定义密钥

开发者如需自定义密钥/证书信息，可在 **开发信息** 中选择 **自定义密钥**。


## 四、准备环境

注意：不同版本间可能存在差异，请严格按照下方版本号进行测试，以免出现与站长不同的错误。

| 环境        | 版本       |
|-------------|------------|
| JDK         | OpenJDK 25 |
| maven       | 3.9.16     |


## 五、Maven 配置

项目使用单模块 Maven 工程，pom.xml 如下。
```xml [pom.xml]
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>cn.ayostack.demo</groupId>
    <artifactId>ayo-alipay-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>25</maven.compiler.source>
        <maven.compiler.target>25</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven-surefire-plugin.version>3.6.0</maven-surefire-plugin.version>
        <maven-compiler-plugin.version>3.16.0</maven-compiler-plugin.version>

        <spring-boot.version>4.1.1</spring-boot.version>
        <lombok.version>1.18.48</lombok.version>
    </properties>

    <dependencies>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-freemarker</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Source: https://mvnrepository.com/artifact/com.alipay.sdk/alipay-sdk-java -->
        <dependency>
            <groupId>com.alipay.sdk</groupId>
            <artifactId>alipay-sdk-java</artifactId>
            <version>4.40.1014.ALL</version>
        </dependency>

        <!-- Source: https://mvnrepository.com/artifact/com.alipay.sdk/alipay-easysdk -->
        <dependency>
            <groupId>com.alipay.sdk</groupId>
            <artifactId>alipay-easysdk</artifactId>
            <version>2.2.3</version>
        </dependency>

        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
            <scope>compile</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-surefire-plugin</artifactId>
                    <version>${maven-surefire-plugin.version}</version>
                </plugin>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>${maven-compiler-plugin.version}</version>
                    <configuration>
                        <compilerArgs>
                            <arg>-parameters</arg>
                        </compilerArgs>
                        <source>${maven.compiler.source}</source>
                        <target>${maven.compiler.target}</target>
                        <annotationProcessorPaths>
                            <path>
                                <groupId>org.springframework.boot</groupId>
                                <artifactId>spring-boot-configuration-processor</artifactId>
                                <version>${spring-boot.version}</version>
                            </path>
                            <path>
                                <groupId>org.projectlombok</groupId>
                                <artifactId>lombok</artifactId>
                                <version>${lombok.version}</version>
                            </path>
                            <path>
                                <groupId>org.projectlombok</groupId>
                                <artifactId>lombok-mapstruct-binding</artifactId>
                                <version>0.2.0</version>
                            </path>
                        </annotationProcessorPaths>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>

</project>
```

## 六、项目配置

### 1. Config 配置类

AlipayConfigurationProperties.java 配置属性类
```java [AlipayConfigurationProperties.java]
package cn.ayostack.demo.alipay.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @author zhangh0803
 * @description
 * @create 2026-09-28 10:57
 */
@Data
@ConfigurationProperties(prefix = "alipay", ignoreInvalidFields = true)
public class AlipayConfigurationProperties {

    /**
     * APP ID
     */
    private String appId;

    /**
     * 协议
     */
    private String protocol;

    /**
     * 支付宝网关主机
     */
    private String gatewayHost;

    /**
     * 网关服务地址
     */
    private String serverUrl;

    /**
     * 签名类型
     */
    private String signType = "RSA2";

    private String format = "json";

    private String charset = "utf-8";

    /**
     * 应用私钥
     */
    private String merchantPrivateKey;

    /**
     * 支付宝公钥
     */
    private String alipayPublicKey;

    /**
     * 异步通知回调地址
     */
    private String notifyUrl;

    /**
     * 结果页面地址
     */
    private String returnUrl;

}
```

AlipayConfiguration.java 支付宝 Bean 配置
```java [AlipayConfiguration.java]
package cn.ayostack.demo.alipay.config;

import com.alipay.api.AlipayClient;
import com.alipay.api.DefaultAlipayClient;
import com.alipay.easysdk.factory.Factory;
import com.alipay.easysdk.kernel.Config;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author zhangh0803
 * @description
 * @create 2026-09-28 10:49
 */
@Configuration
@EnableConfigurationProperties(AlipayConfigurationProperties.class)
public class AlipayConfiguration {

    private final AlipayConfigurationProperties properties;
    public AlipayConfiguration(AlipayConfigurationProperties properties) {
        this.properties = properties;
    }


    /**
     * 全局初始化 Factory 用于调用 支付宝 EasySDK
     */
    @PostConstruct
    public void init() {
        Config options = new Config();
        options.appId = properties.getAppId();
        options.protocol = properties.getProtocol();
        options.gatewayHost = properties.getGatewayHost();
        options.signType = properties.getSignType();
        options.alipayPublicKey = properties.getAlipayPublicKey();
        options.merchantPrivateKey = properties.getMerchantPrivateKey();
        options.notifyUrl = properties.getNotifyUrl();
        Factory.setOptions(options);
    }

    @Bean
    public AlipayClient alipayClient() {
        return new DefaultAlipayClient(
                properties.getServerUrl(),
                properties.getAppId(),
                properties.getMerchantPrivateKey(),
                properties.getFormat(),
                properties.getCharset(),
                properties.getAlipayPublicKey(),
                properties.getSignType()
        );
    }


}
```

### 2. yml 配置

```yaml
server:
  port: 8000

spring:
  freemarker:
    content-type: text/html
    charset: UTF-8
    suffix: .ftlh
    check-template-location: true
    template-loader-path:
      - classpath:/templates/
    expose-spring-macro-helpers: true


alipay:
  app-id: 沙箱应用 ID
  protocol: https
  gateway-host: openapi-sandbox.dl.alipaydev.com
  server-url: https://openapi-sandbox.dl.alipaydev.com/gateway.do
  sign-type: RSA2
  merchant-private-key: 应用私钥
  alipay-public-key: 支付宝公钥
  notify-url: http://zhangh0803.natapp1.cc/api/v1/alipay/notify
  return-url: https://docs.ayostack.cn:441
```

## 结语

现在你已经成功搭建好了项目框架，后续章节项目环境全部根据这个框架配置来做的。