---
title: 单一职责原则（SRP）
date: 2026-09-20
tags: [设计原则]
summary: 单一职责原则（SRP）是面向对象设计的重要原则，强调一个类或模块应仅负责完成一个特定的职责或功能。通过将复杂的功能分解为多个粒度小、功能单一的类，可以提高系统的灵活性、可维护性和可扩展性
order: 101
group: 设计原则
layout: wiki
---

## 案例一【视频用户服务】


### 1. 改进前

```java [VideoUserService.java]
public class VideoUserService {

    public void serveGrade(String userType) {
        if ("VIP用户".equals(userType)) {
            System.out.println("VIP用户，视频1080P蓝光");
            System.out.println("VIP会员，视频无广告");
        } else if ("普通用户".equals(userType)) {
            System.out.println("普通用户，视频720P超清");
            System.out.println("普通用户，视频有广告");
        } else if ("访客用户".equals(userType)) {
            System.out.println("访客用户，视频480P高清");
            System.out.println("访客用户，视频有广告");
        }
    }
}
```

```java [VideoUserServiceTest.java]
public class VideoUserServiceTest {

    public static void main(String[] args) {
        VideoUserService videoUserService = new VideoUserService();
        videoUserService.serveGrade("VIP用户");
        videoUserService.serveGrade("普通用户");
        videoUserService.serveGrade("访客用户");
    }

}
```


#### 存在的问题

- `serveGrade` 一个方法同时处理**清晰度输出**和**广告策略**两类业务逻辑，职责混杂；
- 每新增一种用户类型，或新增一项权益维度（如缓存、投屏），都要修改同一个方法，违反了[对扩展开放、对修改关闭]的原则（开闭原则）；
- if-else 分支随用户类型增多而膨胀，可读性和可维护性下降。


### 2. 改进后

```java [IVideoUserService.java]
public interface IVideoUserService {

    /**
     * 清晰度
     */
    void definition();

    /**
     * 广告
     */
    void advertisement();
}
```

```java [GuestVideoUserService.java]
/**
 * 功能介绍
 * 访客视频用户服务实现
 */
public class GuestVideoUserService implements IVideoUserService {

    @Override
    public void definition() {
        System.out.println("访客用户，视频480P高清");
    }

    @Override
    public void advertisement() {
        System.out.println("访客用户，视频有广告");
    }
}
```

```java [OrdinaryVideoUserService.java]
/**
 * 功能介绍
 * 普通视频用户服务实现
 */
public class OrdinaryVideoUserService implements IVideoUserService {

    @Override
    public void definition() {
        System.out.println("普通用户，视频720P超清");
    }

    @Override
    public void advertisement() {
        System.out.println("普通用户，视频有广告");
    }
}
```

```java [VipVideoUserService.java]
/**
 * 功能介绍
 * VIP 视频用户服务实现
 */
public class VipVideoUserService implements IVideoUserService {

    @Override
    public void definition() {
        System.out.println("VIP用户，视频1080P蓝光");
    }

    @Override
    public void advertisement() {
        System.out.println("VIP会员，视频无广告");
    }
}
```

```java [VideoUserServiceTest.java]
public class VideoUserServiceTest {

    public static void main(String[] args) {
        // 访客
        IVideoUserService guest = new GuestVideoUserService();
        guest.advertisement();
        guest.definition();

        // 普通
        IVideoUserService ordinary = new OrdinaryVideoUserService();
        ordinary.advertisement();
        ordinary.definition();

        // VIP
        IVideoUserService vip = new VipVideoUserService();
        vip.advertisement();
        vip.definition();
    }
}
```


#### 改进点

- 每个用户等级对应一个实现类，类的职责单一、变化原因唯一；
- 新增用户等级时只需新增一个实现类，无需修改已有代码，符合开闭原则；
- if-else 分支消失，代码结构更清晰。


### 3. 关于[接口有两个方法]的说明

有小伙伴可能会问：IVideoUserService 里有 definition() 和 advertisement() 两个方法，这还算单一职责吗？

SRP 的判断依据**不是方法数量多少，而是类 / 接口是否只有一类变化原因**。
<br>
在本例中，每个实现类的所有方法都只因同一个原因变化——[某个用户等级的权益策略调整]，因此是符合单一职责原则的。
<br>
但如果把[清晰度策略]和[会员计费]放在同一个类里，就属于职责混杂：二者的修改动因完全不一样。


### 4. SRP 的粒度如何把控

示例中将清晰度、广告放在同一个接口，是**按用户等级维度拆分职责**；也可以按业务功能维度做更细粒度拆分。两种方式都满足 SRP，核心看业务的**变化动因**。


#### 视角 A：按[用户等级]切分（上文示例）

- 变化原因：[某个用户等级的权益策略调整]；
- 当 VIP 权益调整时（可能同时调清晰度和广告），只改 VipVideoUserService 一个类；


#### 视角 B：按[功能维度]切分（更细粒度）

- 变化原因：清晰度规则、广告规则可以各自独立变更；
- 适用场景：广告由运营团队迭代，码率清晰度由技术团队迭代，两套规则变更互不影响；

如果按照 B 视角重构（代码片段）：

```java
/** 清晰度策略：只因[码率/清晰度规则]变化 */
public interface IDefinitionService {
    void definition();
}

/** 广告策略：只因[广告投放规则]变化 */
public interface IAdvertisementService {
    void advertisement();
}
```

```java
public class VipDefinitionService implements IDefinitionService {
    @Override
    public void definition() {
        System.out.println("VIP用户，视频1080P蓝光");
    }
}

public class VipAdvertisementService implements IAdvertisementService {
    @Override
    public void advertisement() {
        System.out.println("VIP会员，视频无广告");
    }
}
```

然后通过组合把它们组装成用户服务

```java
/** 用户服务：只负责[组装和调度]，不承载具体规则 */
public class VideoUserService {

    private final IDefinitionService definitionService;
    private final IAdvertisementService advertisementService;

    public VideoUserService(IDefinitionService definitionService,
                            IAdvertisementService advertisementService) {
        this.definitionService = definitionService;
        this.advertisementService = advertisementService;
    }

    public void serve() {
        definitionService.definition();
        advertisementService.advertisement();
    }
}
```

最终调用时：

```java
VideoUserService vip = new VideoUserService(
        new VipDefinitionService(),
        new VipAdvertisementService()
);
vip.serve();
```

这样清晰度规则变化 → 只动 IDefinitionService 的实现；广告规则变化 → 只动 IAdvertisementService 的实现，两类团队互不干扰。
<br>
如何选择？ 标准是：这两个东西在业务里会不会独立变化？


如果广告和清晰度总是随[用户等级]一起调整（改 VIP 权益就一起改） → 用视角 A 就够了，而且更简单；
<br>
如果它们由不同团队、不同节奏维护 → 用视角 B，SRP 的收益才能体现。

SRP 的 “职责” 没有绝对客观标准，取决于你对业务变化的预判。
遵循原则：**经常一起变化的逻辑放在一起，会独立变化的逻辑进行隔离**。
拿不准时，优先使用较粗粒度；当业务真的出现独立变更诉求，再做拆分重构。**后期重构，远优于前期过度设计**

## 结语

:::tip SRP 常见误区
- 不是“一个类只能有一个方法”；
- 不是拆得越细越好，过度拆分会产生大量小类，提升理解成本；
- 职责划分要结合业务场景，脱离业务谈粒度没有意义。
:::