---
title: 依赖倒置原则（DIP）
date: 2026-09-24
tags: [设计原则]
summary: 依赖倒置原则：针对接口编程，依赖于抽象而不依赖于具体实现。
order: 106
group: 设计原则
layout: wiki
---

:::warning 注意
依赖倒置不等于简单写接口。
<br/>
核心是**控制依赖方向**；禁止为了DIP强行抽取无业务意义接口，造成过度设计。没有多实现、单元测试mock需求，不必强行抽象。
:::


依赖倒置原则（Dependency Inversion Principle，DIP）：

1. 高层模块不应该依赖低层模块，两者都应该依赖抽象。
2. 抽象不应该依赖细节，细节应该依赖抽象。

<br/>

简单理解：业务层不要直接 new 具体实现，而是面向接口编程，具体实现由外部注入。DIP 是 OCP 的底层支撑，也是单元测试、配置化、插件化的基础。
<br/>
违背 DIP 会让业务层绑定基础设施细节，基础设施一变业务层跟着改，单元测试无法 mock，扩展只能靠改代码。

## 案例一 【用户抽奖】

### 改进前

```java
/**
 * 投注用户
 */
@AllArgsConstructor
@Getter
@Setter
public class BetUser {

    /**
     * 姓名
     */
    private String username;

    /**
     * 权重
     */
    private int weight;

}
```

```java
/**
 * 抽奖控制
 */
public class DrawControl {

    /**
     * 随机抽奖指定用户数量的中奖用户
     * @param list 投注用户
     * @param count 中奖用户
     * @return 中奖用户
     */
    public List<BetUser> doDrawRandom(List<BetUser> list, int count) {
        List<BetUser> copy = new ArrayList<>(list);
        // 集合数量小于抽奖用户直接返回作为中奖用户
        if (copy.size() < count)  return copy;
        // 乱序
        Collections.shuffle(copy);
        // 取出指定数量的用户
        List<BetUser> prizeList = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            prizeList.add(copy.get(i));
        }
        return prizeList;
    }

    /**
     * 按照权重抽奖
     * @param list 投注用户
     * @param count 抽奖个数
     * @return 结果
     */
    public List<BetUser> doDrawWeight(List<BetUser> list, int count) {
        List<BetUser> copy = new ArrayList<>(list);

        // 按照权重排序
        copy.sort((o1, o2) -> Integer.compare(o2.getWeight(), o1.getWeight()));

        // 集合数量小于抽奖用户直接返回作为中奖用户
        if (copy.size() < count)  return copy;

        // 取出指数量的中奖用户
        List<BetUser> prizeList = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            prizeList.add(copy.get(i));
        }
        return prizeList;
    }

}
```

测试：
```java
@Slf4j
public class ApiTest {

    @Test
    public void test() {
        // 抽奖用户
        List<BetUser> betUserList = new ArrayList<>();
        betUserList.add(new BetUser("小飞", 5));
        betUserList.add(new BetUser("小白", 3));
        betUserList.add(new BetUser("毛毛", 1));
        betUserList.add(new BetUser("啊呦", 8));
        betUserList.add(new BetUser("小米", 2));

        DrawControl drawControl = new DrawControl();
        List<BetUser> randomUserList = drawControl.doDrawRandom(betUserList, 3);
        log.info("随机抽奖，中奖用户名单：{}", JSONUtil.toJsonStr(randomUserList));

        List<BetUser> weightUserList = drawControl.doDrawWeight(betUserList, 10);
        log.info("权重抽奖，中奖用户名单：{}", JSONUtil.toJsonStr(weightUserList));

    }
}
```

输出结果：
```md
15:05:32.948 [main] INFO cn.manihong.demo.design.dip.v1.ApiTest -- 随机抽奖，中奖用户名单：[{"username":"小米","weight":2},{"username":"啊呦","weight":8},{"username":"小白","weight":3}]
15:05:32.951 [main] INFO cn.manihong.demo.design.dip.v1.ApiTest -- 权重抽奖，中奖用户名单：[{"username":"啊呦","weight":8},{"username":"小飞","weight":5},{"username":"小白","weight":3},{"username":"小米","weight":2},{"username":"毛毛","weight":1}]

Process finished with exit code 0
```

#### 存在的问题

- DrawControl 是高层模块，却直接实现了两种具体抽奖算法，高层依赖了具体细节。
- 想新增一种抽奖方式（比如“按充值金额抽奖”），必须修改 DrawControl 类，违反 OCP。
- 调用方必须记住到底调哪个方法：随机抽奖调 doDrawRandom，权重抽奖调 doDrawWeight，方法名和策略绑死。
- 抽奖策略无法在运行时动态替换，也无法通过配置化扩展。
- 抽奖算法无法单独单元测试，只能连带 DrawControl 一起测。
- DrawControl 同时承担“调度”和“算法实现”两种职责，违反 SRP，进而违反 DIP。


### 改进后

```java
/**
 * 投注用户
 */
@AllArgsConstructor
@Getter
@Setter
public class BetUser {

    /**
     * 姓名
     */
    private String username;

    /**
     * 权重
     */
    private int weight;

}
```

```java
/**
 * 抽奖接口
 */
public interface IDraw {

    /**
     * 抽奖
     * @param list 投注用户列表
     * @param count 中奖个数
     * @return 结果
     */
    List<BetUser> prize(List<BetUser> list, int count);
}
```

```java
/**
 * 抽奖控制
 */
public class DrawControl {

    private final IDraw draw;

    public DrawControl(IDraw draw) {
        this.draw = draw;
    }

    public List<BetUser> doDraw(List<BetUser> list, int count) {
        return draw.prize(list, count);
    }

}
```

```java
/**
 * 随机抽奖
 */
public class DrawRandom implements IDraw {

    @Override
    public List<BetUser> prize(List<BetUser> list, int count) {
        List<BetUser> copy = new ArrayList<>(list);
        // 集合数量小于抽奖用户直接返回作为中奖用户
        if (copy.size() < count)  return copy;
        // 乱序
        Collections.shuffle(copy);
        // 取出指定数量的用户
        List<BetUser> prizeList = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            prizeList.add(copy.get(i));
        }
        return prizeList;
    }
}
```

```java
/**
 * 权重抽奖
 */
public class DrawWeight implements IDraw {

    @Override
    public List<BetUser> prize(List<BetUser> list, int count) {
        List<BetUser> copy = new ArrayList<>(list);

        // 按照权重排序
        copy.sort((o1, o2) -> Integer.compare(o2.getWeight(), o1.getWeight()));

        // 集合数量小于抽奖用户直接返回作为中奖用户
        if (copy.size() < count)  return copy;

        // 取出指数量的中奖用户
        List<BetUser> prizeList = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            prizeList.add(copy.get(i));
        }
        return prizeList;
    }

}
```

测试：
```java
@Slf4j
public class ApiTest {

    @Test
    public void test() {
        // 抽奖用户
        List<BetUser> betUserList = new ArrayList<>();
        betUserList.add(new BetUser("小飞", 5));
        betUserList.add(new BetUser("小白", 3));
        betUserList.add(new BetUser("毛毛", 1));
        betUserList.add(new BetUser("啊呦", 8));
        betUserList.add(new BetUser("小米", 2));

        DrawControl drawRandomControl = new DrawControl(new DrawRandom());
        List<BetUser> randomUserList = drawRandomControl.doDraw(betUserList, 2);
        log.info("随机抽奖，中奖用户名单：{}", JSONUtil.toJsonStr(randomUserList));

        DrawControl drawWeightControl = new DrawControl(new DrawWeight());
        List<BetUser> weightUserList = drawWeightControl.doDraw(betUserList, 10);
        log.info("权重抽奖，中奖用户名单：{}", JSONUtil.toJsonStr(weightUserList));

    }
}
```

输出结果：
```md
15:13:17.337 [main] INFO cn.manihong.demo.design.dip.v2.ApiTest -- 随机抽奖，中奖用户名单：[{"username":"小米","weight":2},{"username":"小飞","weight":5}]
15:13:17.340 [main] INFO cn.manihong.demo.design.dip.v2.ApiTest -- 权重抽奖，中奖用户名单：[{"username":"啊呦","weight":8},{"username":"小飞","weight":5},{"username":"小白","weight":3},{"username":"小米","weight":2},{"username":"毛毛","weight":1}]

Process finished with exit code 0
```

#### 改进核心亮点（符合 DIP）

- 高层模块 DrawControl 不再依赖具体抽奖算法，只依赖抽象 IDraw。
- 低层模块 DrawRandom、DrawWeight 都实现 IDraw，细节依赖抽象。
- 新增抽奖方式只需新增 IDraw 实现，DrawControl 完全不用改，符合 OCP。
- 抽奖策略可运行时动态替换，符合策略模式 + DIP 组合使用。
- 每个抽奖算法可以独立单元测试。
- DrawControl 只负责调度，算法实现各归其位，符合 SRP + DIP。


## 案例二 【订单通知】

### 改进前

```java
/**
 * 订单
 */
@AllArgsConstructor
@Getter
public class Order {
    private final Long id;
    private final String phone;
    private final String email;
}
```

```java
/**
 * 订单服务
 *
 * 问题：高层业务直接 new 具体通知渠道
 */
public class OrderService {

    public void placeOrder(Order order) {
        // 业务逻辑
        System.out.println("订单[" + order.getId() + "]创建成功");

        // 直接依赖具体实现：短信通知
        SmsSender smsSender = new SmsSender();
        smsSender.send(order.getPhone(), "您的订单已创建");

        // 如果还要发邮件，就得继续 new
        EmailSender emailSender = new EmailSender();
        emailSender.send(order.getEmail(), "您的订单已创建");
    }
}
```

```java
public class SmsSender {
    public void send(String phone, String msg) {
        System.out.println("短信发送到 " + phone + "：" + msg);
    }
}
```

```java
public class EmailSender {
    public void send(String email, String msg) {
        System.out.println("邮件发送到 " + email + "：" + msg);
    }
}
```

```java
public class OrderServiceTest {

    @Test
    public void testPlaceOrder() {
        Order order = new Order(10001L, "13800138000", "user@example.com");
        OrderService service = new OrderService();
        service.placeOrder(order);
    }
}
```

#### 存在的问题
- 高层 OrderService 依赖低层 SmsSender、EmailSender 具体实现。
- 想换通知方式（比如换成企微、钉钉），必须改 OrderService。
- 单元测试 OrderService 时，会真的发短信、发邮件，无法 mock。
- 通知渠道无法通过配置动态切换。
- 业务层被动绑定基础设施细节，基础设施一变，业务层跟着改。
- 违反 DIP，也违反 OCP、SRP。

### 改进后

```java
/**
 * 订单
 */
@AllArgsConstructor
@Getter
public class Order {

    /**
     * 订单ID
     */
    private final Long id;

    /**
     * 手机号（短信渠道的 target）
     */
    private final String phone;

    /**
     * 邮箱（邮件渠道的 target）
     */
    private final String email;

    /**
     * 企微ID（企微渠道的 target）
     */
    private final String wecomId;

    /**
     * 是否退款单
     */
    private final boolean refund;

    /**
     * 是否 VIP
     */
    private final boolean vip;
}
```

```java
/**
 * 通知抽象
 *
 * 具体发给谁，由实现类在创建时自己绑定
 */
public interface Notifier {

    /**
     * 发送消息
     * @param message 消息内容
     */
    void send(String message);
}
```

```java
/**
 * 短信通知
 */
public class SmsNotifier implements Notifier {

    private final String phone;

    public SmsNotifier(String phone) {
        this.phone = phone;
    }

    @Override
    public void send(String message) {
        System.out.println("短信发送到 " + phone + "：" + message);
    }
}
```

```java
/**
 * 邮件通知
 */
public class EmailNotifier implements Notifier {

    private final String email;

    public EmailNotifier(String email) {
        this.email = email;
    }

    @Override
    public void send(String message) {
        System.out.println("邮件发送到 " + email + "：" + message);
    }
}
```

```java
/**
 * 企微通知
 */
public class WeComNotifier implements Notifier {

    private final String wecomId;

    public WeComNotifier(String wecomId) {
        this.wecomId = wecomId;
    }

    @Override
    public void send(String message) {
        System.out.println("企微发送到 " + wecomId + "：" + message);
    }
}
```

```java
/**
 * 通知工厂抽象
 *
 * 高层只依赖这个抽象，不感知具体渠道怎么创建
 */
public interface NotifierFactory {

    /**
     * 根据订单上下文，创建本单需要的通知渠道列表
     * 每个 Notifier 内部已经绑定好自己需要的 target
     */
    List<Notifier> createNotifiers(Order order);
}
```

```java
/**
 * 默认通知工厂
 *
 * 两件事都在这里内聚：
 * 1. 选哪些渠道（业务规则）
 * 2. 每个渠道的 target 从 Order 哪个字段取（渠道差异）
 */
public class DefaultNotifierFactory implements NotifierFactory {

    @Override
    public List<Notifier> createNotifiers(Order order) {
        List<Notifier> notifiers = new ArrayList<>();

        // 所有订单都发短信，target = 手机号
        notifiers.add(new SmsNotifier(order.getPhone()));

        // 退款单 / VIP 单额外发邮件，target = 邮箱
        if (order.isRefund() || order.isVip()) {
            notifiers.add(new EmailNotifier(order.getEmail()));
        }

        // VIP 单额外发企微，target = 企微ID
        if (order.isVip()) {
            notifiers.add(new WeComNotifier(order.getWecomId()));
        }

        return notifiers;
    }
}
```

```java
/**
 * 订单服务
 *
 * 只依赖 NotifierFactory 和 Notifier 两个抽象
 * 既不关心渠道怎么创建，也不关心 target 怎么取
 */
public class OrderService {

    private final NotifierFactory notifierFactory;

    public OrderService(NotifierFactory notifierFactory) {
        this.notifierFactory = notifierFactory;
    }

    public void placeOrder(Order order) {
        System.out.println("订单[" + order.getId() + "]创建成功");

        List<Notifier> notifiers = notifierFactory.createNotifiers(order);
        for (Notifier notifier : notifiers) {
            // 只管发消息，不管发给谁
            notifier.send("您的订单已创建");
        }
    }
}
```

测试：
```java
public class OrderServiceTest {

    @Test
    public void testPlaceOrder() {
        OrderService service = new OrderService(new DefaultNotifierFactory());

        // 普通订单：只发短信
        Order normal = new Order(
                10001L,
                "13800138000",
                "user@example.com",
                "wx_001",
                false,
                false
        );
        service.placeOrder(normal);

        // 退款订单：短信 + 邮件
        Order refund = new Order(
                10002L,
                "13800138000",
                "user@example.com",
                "wx_001",
                true,
                false
        );
        service.placeOrder(refund);

        // VIP 订单：短信 + 邮件 + 企微
        Order vip = new Order(
                10003L,
                "13800138000",
                "user@example.com",
                "wx_001",
                false,
                true
        );
        service.placeOrder(vip);
    }
}
```

#### 改进核心亮点（符合 DIP）

- 高层依赖抽象：OrderService 只依赖 NotifierFactory 和 Notifier 两个抽象，不感知任何具体渠道，也不感知渠道创建规则。
- 抽象贴合业务语义：Notifier 只描述“发消息”，不暴露 target，不同渠道的 target 差异不再泄露到高层。
- target 差异下沉到实现类：手机号、邮箱、企微 ID 各归各的 Notifier 管，各渠道自己知道发给谁。
- 规则内聚到工厂：选哪些渠道、每个渠道用哪个 target，都属于通知装配规则，集中内聚在 DefaultNotifierFactory。
- 工厂本身也是抽象：NotifierFactory 是接口，具体工厂可替换，DIP 不被破坏。
- 新增渠道零侵入：加钉钉渠道只需新增 DingTalkNotifier，并在工厂里加一行。
- 规则变更零侵入：VIP 规则从“VIP 发企微”改成“VIP + 大额订单发企微”，只改 DefaultNotifierFactory。
- 单元测试时传入 MockNotifierFactory，不真实发短信、发邮件。
- 符合 DIP + OCP + SRP + ISP：抽象稳定，扩展开放，职责清晰，接口最小。


## 案例三 【订单缓存】

### 改进前

```java
/**
 * 商品服务
 *
 * 问题：业务层直接依赖 RedisTemplate
 */
public class ProductService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public Product getProduct(Long productId) {
        String key = "product:" + productId;

        // 业务层直接操作 Redis
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return (Product) cached;
        }

        Product product = loadFromDb(productId);
        redisTemplate.opsForValue().set(key, product, 10, TimeUnit.MINUTES);
        return product;
    }
}
```

#### 存在的问题
- 高层直接依赖 Redis API：redisTemplate.opsForValue()、set(key, value, timeout) 出现在业务层。
- 缓存策略（key 前缀、过期时间）和业务逻辑混杂。
- 想换成 Caffeine 本地缓存、二级缓存，只能改业务代码。
- 单元测试需要启动 Redis。
- 缓存序列化、反序列化异常直接暴露给业务层。
- 违反 DIP，也违反 SRP。

### 改进后

```java
/**
 * 缓存抽象
 */
public interface CacheService {

    <T> T get(String key, Class<T> type);

    void put(String key, Object value, Duration ttl);

    void evict(String key);
}
```

```java
/**
 * Redis 实现
 */
public class RedisCacheService implements CacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisCacheService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public <T> T get(String key, Class<T> type) {
        Object value = redisTemplate.opsForValue().get(key);
        return value == null ? null : type.cast(value);
    }

    @Override
    public void put(String key, Object value, Duration ttl) {
        redisTemplate.opsForValue().set(key, value, ttl);
    }

    @Override
    public void evict(String key) {
        redisTemplate.delete(key);
    }
}
```

```java
/**
 * 本地 Caffeine 实现
 */
public class CaffeineCacheService implements CacheService {
    // 实现同上，略
}
```

```java
/**
 * 商品服务
 */
public class ProductService {

    private final CacheService cacheService;

    public ProductService(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public Product getProduct(Long productId) {
        String key = "product:" + productId;
        Product cached = cacheService.get(key, Product.class);
        if (cached != null) {
            return cached;
        }
        Product product = loadFromDb(productId);
        cacheService.put(key, product, Duration.ofMinutes(10));
        return product;
    }

    private Product loadFromDb(Long productId) {
        // 略
        return null;
    }
}
```

#### 改进核心亮点（符合 DIP）
- 业务层不依赖具体缓存实现，只依赖 CacheService。
- 缓存策略（TTL、key 前缀）可以集中管理。
- 测试用 MapCacheService 内存实现，不依赖 Redis。
- 缓存实现可替换，业务代码稳定。
- 符合 DIP + SRP。


## DIP 核心判断标准

满足以下条件，才更符合依赖倒置原则：

1. 高层模块是否依赖抽象，而不是具体实现？
2. 抽象是否稳定，不依赖具体细节？
3. 具体实现能否在运行时替换，而不改高层模块？
4. 单元测试能否 mock 依赖，而不触发真实基础设施？
5. 新增实现是否只需新增类，无需修改高层模块？
6. 依赖注入是否由外部容器 / 工厂 / 配置完成，而不是高层自己 new？


## DIP 与前几大原则的联动关系

- SRP（单一职责）：职责单一，是 DIP 的基础；职责混乱的类很难抽象出稳定接口。
- ISP（接口隔离）：接口要小而专，DIP 的抽象才有意义，否则客户端被迫依赖不需要的方法。
- LSP（里氏替换）：子类必须能无缝替换父类，DIP 的多态才稳定。
- DIP（依赖倒置）：控制依赖方向，让高层稳定、低层可替换，是 OCP 落地的关键支撑。
- OCP（开闭原则）：DIP 让扩展通过新增实现完成，而不是修改高层模块，最终实现开闭。

设计原则执行顺序：先单一职责 → 再接口隔离 / 里氏替换 → 用依赖倒置控制方向 → 最终实现开闭扩展。


## DIP 适用场景 & 避坑总结

### 适用场景

- 业务层依赖基础设施：订单服务依赖通知、支付、存储、缓存等。
- 需要单元测试：希望业务层测试时能 mock 掉外部依赖。
- 需要配置化 / 插件化：通知渠道、支付渠道、存储方式可动态切换。
- 需要多实现切换：同一抽象有多种实现，如短信 / 邮件 / 企微。
- 框架扩展点设计：SPI、插件、策略容器。

### 常见违坑场景

- 高层模块直接 `new` 低层实现，业务层绑定基础设施。
- 抽象依赖细节：接口方法签名里出现具体实现类。
- 为了倒置而倒置：没有多实现、没有测试需求，硬抽接口。
- 接口粒度不合理：一个接口塞太多方法，客户端被迫依赖不需要的能力。
- 用工厂 / 容器隐藏 `new`，但依赖方向仍然是高层 → 低层具体类。
- 依赖注入只做在字段上，构造函数里仍然 `new` 具体实现。

## 结语

依赖倒置原则的本质不是“用接口”，而是**控制依赖方向**：高层模块不依赖低层模块，两者都依赖抽象；抽象不依赖细节，细节依赖抽象。
<br/>
DIP 让业务层稳定、基础设施可替换、单元测试可 mock，是 OCP 落地的关键支撑。当业务层依赖抽象、基础设施实现抽象、装配交给外部容器时，系统会自然形成高内聚、低耦合、可测试、可扩展的结构。
<br/>
DIP 不是银弹：抽象要有业务含义，不要为了倒置而倒置；接口粒度要合理，避免接口膨胀。严格遵循 DIP，配合 SRP、ISP、LSP、OCP，才能构建真正健壮的系统。