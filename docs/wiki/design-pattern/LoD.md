---
title: 最少知道原则（LoD）
date: 2026-09-24
tags: [设计原则]
summary: 迪米特法则(最少知道原则LoD)：一个对象应当对其它对象保持最少的了解，不要穿透访问对象内部成员；只和直接朋友通信，降低类之间耦合。
order: 105
group: 设计原则
layout: wiki
---

:::warning 注意
迪米特法则不是让我们完全消除依赖，核心是**不要穿透访问对象内部细节**；会带来一定数量包装方法，不要过度封装。
:::

迪米特法则（Law of Demeter，LoD），也叫**最少知道原则**。

> 核心定义：**只和你的直接朋友交谈**。一个对象应当对其它对象保持尽可能少的了解。

- 直接朋友：类成员变量、方法入参、方法返回对象、本类内部new出来的对象。
- 反面行为：不要通过getter拿到「朋友的朋友」，调用其方法；典型就是长链式调用 `a.getB().getC().doSomething()`。

迪米特法则本质是封装思想的延伸。违背LoD会暴露对象内部实现，模块之间耦合加剧；底层类内部改动，会连锁影响上层调用代码，系统变得脆弱难维护。


## 案例一 【汽车启动】

### 改进前

```java
/**
 * 启动装置
 */
public class Starter {

    public void ignite() {
        System.out.println("点火启动");
    }

}
```

```java
/**
 * 引擎
 */
@Getter
public class Engine {

    private final Starter starter = new Starter();

}
```

```java
/**
 * 司机
 */
@Getter
public class Driver {

    private final Car car = new Car();

}
```

```java
/**
 * 汽车
 */
@Getter
public class Car {

    private final Engine engine = new Engine();

}
```

测试：
```java
public class DriverTest {

    /**
     * 启动汽车需要一级级拿到 Engine，再拿到 Starter，然后点火
     * 这违反了 最少知道原则
     */
    @Test
    public void start_car() {
        // 司机
        Driver driver = new Driver();
        // 启动汽车
        driver.getCar().getEngine().getStarter().ignite();
    }

}
```

#### 存在的核心问题

- 上层测试代码链式 get 穿透多层对象，Driver 需要感知 Car 内部 Engine、Engine 内部 Starter 的存在。
- 对象内部实现细节向外泄露。
- 如果 Car 内部组件结构发生变更，所有上层链式调用代码都需要跟着修改。
- 对象之间耦合度高，内部改动影响外部调用方。


### 改进后

```java
/**
 * 启动装置
 *
 * @author zhangh0803
 */
public class Starter {

    public void ignite() {
        System.out.println("点火启动");
    }
}
```


```java
/**
 * 引擎
 */
public class Engine {

    private final Starter starter = new Starter();

    /**
     * 引擎启动
     */
    public void start() {
        starter.ignite();
        System.out.println("引擎正在运行");
    }

}
```

```java
/**
 * 司机
 */
public class Driver {

    private final Car car = new Car();

    /**
     * 司机可以直接启动车 - 无需关心内部引擎等动作
     */
    public void startCar() {
        car.start();
        System.out.println("车子启动起来了");
    }

}
```


```java
/**
 * 汽车
 */
public class Car {

    private final Engine engine = new Engine();

    /**
     * 汽车可以启动 - 不关心内部如何实现
     */
    public void start() {
        engine.start();
        System.out.println("车辆成功打火");
    }

}
```

测试：
```java
public class DriverTest {

    @Test
    public void test_driverCar() {
        // 创建司机
        Driver driver = new Driver();
        // 司机可以直接启动车辆，无需关心内部如何运作，符合最少知道原则
        driver.startCar();
    }

}
```

#### 改进核心亮点（符合 LoD）

- Driver 只和直接朋友 Car 交互，不需要感知 Engine、Starter 这些内部组件。
- Car、Engine 对外暴露行为方法，内部对象细节被封装隐藏。
- 消除长链式 getter 穿透调用。
- 内部组件改动不会影响上层调用，耦合降低。


## 案例二 【库存校验与优惠计算】

电商下单——库存校验与优惠计算

### 改进前

领域对象结构：
```java
/**
 * 商品
 */
@Getter
public class Product {
    private final String name;
    private final BigDecimal price;
    private final Inventory inventory;

    public Product(String name, BigDecimal price, Inventory inventory) {
        this.name = name;
        this.price = price;
        this.inventory = inventory;
    }
}
```

```java
/**
 * 库存
 */
@Getter
public class Inventory {
    private int stock;

    public Inventory(int stock) {
        this.stock = stock;
    }

    public void reduce(int quantity) {
        this.stock -= quantity;
    }
}
```

```java
/**
 * 订单项
 */
@Getter
public class OrderItem {
    private final Product product;
    private final int quantity;

    public OrderItem(Product product, int quantity) {
        this.product = product;
        this.quantity = quantity;
    }
}
```

```java
/**
 * 会员
 */
@Getter
public class Member {
    private final int level;

    public Member(int level) {
        this.level = level;
    }
}
```

```java
/**
 * 用户
 */
@Getter
public class User {
    private final Member member;

    public User(Member member) {
        this.member = member;
    }
}
```

```java
/**
 * 订单
 */
@Getter
public class Order {
    private final Long orderId;
    private final User user;
    private final List<OrderItem> items;

    public Order(Long orderId, User user, List<OrderItem> items) {
        this.orderId = orderId;
        this.user = user;
        this.items = items;
    }
}
```

下单服务直接穿透访问订单内部结构：
```java
/**
 * 下单服务
 *
 * 问题：为了完成下单，需要穿透 Order → OrderItem → Product → Inventory 校验库存
 * 还需要穿透 Order → OrderItem → Product → Price 计算总价
 * 还需要穿透 Order → User → Member → Level 计算会员折扣
 * 最后还要穿透 Order → OrderItem → Product → Inventory 扣减库存
 */
public class OrderService {

    public void placeOrder(Order order) {

        // 穿透 1：Order → OrderItem → Product → Inventory，校验库存
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            Inventory inventory = product.getInventory();
            if (inventory.getStock() < item.getQuantity()) {
                throw new RuntimeException("库存不足：" + product.getName());
            }
        }

        // 穿透 2：Order → OrderItem → Product → Price，计算总价
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            BigDecimal price = item.getProduct().getPrice();
            total = total.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // 穿透 3：Order → User → Member → Level，计算会员折扣
        int level = order.getUser().getMember().getLevel();
        if (level >= 3) {
            total = total.multiply(new BigDecimal("0.95"));
        }

        // 穿透 4：Order → OrderItem → Product → Inventory，扣减库存
        for (OrderItem item : order.getItems()) {
            item.getProduct().getInventory().reduce(item.getQuantity());
        }

        System.out.println("订单[" + order.getOrderId() + "]下单成功，实付：" + total);
    }
}
```

测试：
```java
public class OrderServiceTest {

    @Test
    public void testPlaceOrder() {
        Product p1 = new Product("键盘", new BigDecimal("200"), new Inventory(10));
        Product p2 = new Product("鼠标", new BigDecimal("100"), new Inventory(5));

        List<OrderItem> items = Arrays.asList(
                new OrderItem(p1, 2),
                new OrderItem(p2, 1)
        );

        User user = new User(new Member(3));
        Order order = new Order(10001L, user, items);

        OrderService service = new OrderService();
        service.placeOrder(order);
    }
}
```

#### 存在的核心问题
穿透多层对象：OrderService 需要感知 Order → OrderItem → Product → Inventory、Order → User → Member → Level 等多条链。
<br/>
业务规则泄露到 Service：
<br/>
“库存是否充足”的规则，写在 Service 里。
<br/>
“总价怎么算”的规则，写在 Service 里。
<br/>
“等级 ≥ 3 打 95 折”的规则，写在 Service 里。
<br/>
对内部集合的穿透：OrderService 直接遍历 order.getItems()，直接操作 item.getProduct().getInventory()，把 Product 和 Inventory 的内部状态改了。
<br/>
一处变更连锁修改：
<br/>
会员折扣规则改成“等级 ≥ 2 打 9 折”，改 Service。
<br/>
库存扣减改成“先预占、后确认”，改 Service。
<br/>
商品价格加一个“促销价”，改 Service。
<br/>
完全违反“告诉，别问”原则：Service 不断从对象里问数据，然后在外面算，再塞回去。
<br/>
违反 LoD：OrderService 的直接朋友只有 Order，OrderItem、Product、Inventory、Member 全是朋友的朋友。


### 改进后

把业务规则下沉到各领域对象。
<br/>
调用方只通过直接朋友 Order 触发下单。
<br/>
每层只和自己的直接朋友交互，隐藏内部结构。

```java
/**
 * 库存
 */
public class Inventory {
    private int stock;

    public Inventory(int stock) {
        this.stock = stock;
    }

    /**
     * 对外：是否足够
     */
    public boolean isEnough(int quantity) {
        return stock >= quantity;
    }

    /**
     * 对外：扣减库存
     */
    public void reduce(int quantity) {
        if (!isEnough(quantity)) {
            throw new RuntimeException("库存不足");
        }
        this.stock -= quantity;
    }
}
```

```java
/**
 * 商品
 *
 * 对外只暴露业务语义方法，不暴露 Inventory 内部结构
 */
public class Product {
    private final String name;
    private final BigDecimal price;
    private final Inventory inventory;

    public Product(String name, BigDecimal price, Inventory inventory) {
        this.name = name;
        this.price = price;
        this.inventory = inventory;
    }

    public String getName() {
        return name;
    }

    /**
     * 对外：检查库存是否充足
     */
    public boolean hasEnoughStock(int quantity) {
        return inventory.isEnough(quantity);
    }

    /**
     * 对外：计算某数量的金额
     */
    public BigDecimal calcAmount(int quantity) {
        return price.multiply(BigDecimal.valueOf(quantity));
    }

    /**
     * 对外：扣减库存
     */
    public void reduceStock(int quantity) {
        inventory.reduce(quantity);
    }
}
```

```java
/**
 * 订单项
 *
 * 对外只暴露业务语义方法
 */
public class OrderItem {
    private final Product product;
    private final int quantity;

    public OrderItem(Product product, int quantity) {
        this.product = product;
        this.quantity = quantity;
    }

    /**
     * 对外：校验库存
     */
    public void checkStock() {
        if (!product.hasEnoughStock(quantity)) {
            throw new RuntimeException("库存不足：" + product.getName());
        }
    }

    /**
     * 对外：计算小计
     */
    public BigDecimal calcAmount() {
        return product.calcAmount(quantity);
    }

    /**
     * 对外：扣减库存
     */
    public void reduceStock() {
        product.reduceStock(quantity);
    }
}
```

```java
/**
 * 会员
 */
public class Member {
    private final int level;

    public Member(int level) {
        this.level = level;
    }

    /**
     * 对外：折扣率
     * 规则内聚在 Member 内部，外部不再感知 level 具体值
     */
    public BigDecimal discountRate() {
        if (level >= 3) {
            return new BigDecimal("0.95");
        }
        return BigDecimal.ONE;
    }
}
```

```java
/**
 * 用户
 */
public class User {
    private final Member member;

    public User(Member member) {
        this.member = member;
    }

    /**
     * 对外：折扣率
     */
    public BigDecimal discountRate() {
        return member.discountRate();
    }
}
```

```java
/**
 * 订单
 *
 * 对外只暴露业务语义方法，不暴露 User / OrderItem / Product / Inventory 内部结构
 */
public class Order {
    private final Long orderId;
    private final User user;
    private final List<OrderItem> items;

    public Order(Long orderId, User user, List<OrderItem> items) {
        this.orderId = orderId;
        this.user = user;
        this.items = items;
    }

    public Long getOrderId() {
        return orderId;
    }

    /**
     * 对外：下单
     * 内部只和自己的直接朋友 OrderItem、User 交互
     */
    public void place() {
        // 1. 校验库存
        for (OrderItem item : items) {
            item.checkStock();
        }

        // 2. 计算总价
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : items) {
            total = total.add(item.calcAmount());
        }

        // 3. 应用会员折扣
        total = total.multiply(user.discountRate());

        // 4. 扣减库存
        for (OrderItem item : items) {
            item.reduceStock();
        }

        System.out.println("订单[" + orderId + "]下单成功，实付：" + total);
    }
}
```

```java
/**
 * 下单服务
 *
 * 只依赖直接朋友 Order，不感知 OrderItem / Product / Inventory / Member
 */
public class OrderService {

    public void placeOrder(Order order) {
        order.place();
    }
}
```

```java
public class OrderServiceTest {

    @Test
    public void testPlaceOrder() {
        Product p1 = new Product("键盘", new BigDecimal("200"), new Inventory(10));
        Product p2 = new Product("鼠标", new BigDecimal("100"), new Inventory(5));

        List<OrderItem> items = Arrays.asList(
                new OrderItem(p1, 2),
                new OrderItem(p2, 1)
        );

        User user = new User(new Member(3));
        Order order = new Order(10001L, user, items);

        OrderService service = new OrderService();
        service.placeOrder(order);
    }
}
```

#### 改进核心亮点（符合 LoD）
- OrderService仅和直接朋友Order交互，完全不感知OrderItem、Product、Inventory、Member。
- 业务规则内聚到对应领域对象，不再散落在Service层，遵循“告诉别问”。
- 多层对象链被封装隐藏，外部无法穿透访问内部协作对象。
- 修改业务规则（会员折扣、库存逻辑、商品计价），仅修改对应领域类，上层调用代码无需改动。
- 降低耦合，把变更影响范围收窄。


## 工程落地与误区

1. 业务领域对象警惕链式调用 `obj.getA().getB().getC()`，这是 LoD 最典型坏味道。
2. **不要死板教条**：纯数据载体 DTO、VO，只是存数据，穿透 getter 是合理的，不必强行增加包装方法。
3. 遵循 LoD 会产出很多委托包装方法，防止过度封装，避免类膨胀。
4. LoD 是封装的延伸，目的：隔离变化，内部实现修改尽量不波及外部。


## 结语

迪米特法则核心不是减少类的依赖数量，而是**控制对象之间信息曝光范围**。只和直接朋友通信，隐藏对象内部细节，减少外部对内部结构的感知，实现低耦合。
LoD 经常和封装、SRP 配合使用，让代码变更影响范围收窄，提升系统稳定性。
