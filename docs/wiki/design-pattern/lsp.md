---
title: 里式替换原则（LSP）
date: 2026-09-24
tags: [设计原则]
summary: 里氏替换原则核心：子类可以扩展父类功能，但不能改变父类原有的业务契约、行为逻辑和预期结果，实现子类无缝替换父类，保证多态场景下程序稳定运行。
order: 103
group: 设计原则
layout: wiki
---

里氏替换原则（Liskov Substitution Principle，LSP）：所有引用父类的地方，都可以无缝使用其子类替换，替换后程序的功能、逻辑、异常预期完全不变，不会出现任何异常、BUG或业务偏差。
<br>
简单理解：子类是父类的纯粹扩展，绝对不重写、不破坏父类的原有行为契约。
<br>
LSP 是实现多态的基石，也是开闭原则的底层保障，违背 LSP 会直接导致多态失效、代码隐性 BUG 频发。

## 案例一 【支付功能】

### 1. 改进前

父类支付逻辑定义了通用能力：支持任意金额支付，无金额上限限制，无主动抛异常逻辑。
```java
public class Payment {
    /**
     * 通用支付方法，父类契约：支持任意金额支付
     */
    public void pay(double amount) {
        // 通用支付核心逻辑，无金额限制、无主动异常抛出
    }
}
```

子类信用卡支付重写父类方法，擅自新增父类不存在的业务限制，打破父类行为契约：
```java
public class CreditCardPayment extends Payment {
    /**
     * 子类重写后新增金额上限，破坏父类无限制契约
     * 严重违背里氏替换原则
     */
    @Override
    public void pay(double amount) {
        // 父类无此限制，子类私自新增限制规则
        if (amount > 1200d) {
            throw new IllegalArgumentException("信用卡支付金额不能超过1200元");
        }
    }
}
```

测试场景：父类引用指向子类对象（多态常规写法）
```java
public class PayTest {
    @Test
    public void test_pay() {
        // 父类引用接收子类对象，预期遵循父类契约：支持1300元支付
        Payment payment = new CreditCardPayment();
        payment.pay(1300);
    }
}
```

执行结果如下所示：
```shell
java.lang.IllegalArgumentException: 信用卡支付金额不能超过1200元

	at cn.manihong.demo.design.lsp.v1.CreditCardPayment.pay(CreditCardPayment.java:14)
	at cn.manihong.demo.design.lsp.v1.PayTest.test_pay(PayTest.java:17)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:104)
	at java.base/java.lang.reflect.Method.invoke(Method.java:565)
	at org.junit.runners.model.FrameworkMethod$1.runReflectiveCall(FrameworkMethod.java:59)
	at org.junit.internal.runners.model.ReflectiveCallable.run(ReflectiveCallable.java:12)
	at org.junit.runners.model.FrameworkMethod.invokeExplosively(FrameworkMethod.java:56)
	at org.junit.internal.runners.statements.InvokeMethod.evaluate(InvokeMethod.java:17)
	at org.junit.runners.ParentRunner$3.evaluate(ParentRunner.java:306)
	at org.junit.runners.BlockJUnit4ClassRunner$1.evaluate(BlockJUnit4ClassRunner.java:100)
	at org.junit.runners.ParentRunner.runLeaf(ParentRunner.java:366)
	at org.junit.runners.BlockJUnit4ClassRunner.runChild(BlockJUnit4ClassRunner.java:103)
	at org.junit.runners.BlockJUnit4ClassRunner.runChild(BlockJUnit4ClassRunner.java:63)
	at org.junit.runners.ParentRunner$4.run(ParentRunner.java:331)
	at org.junit.runners.ParentRunner$1.schedule(ParentRunner.java:79)
	at org.junit.runners.ParentRunner.runChildren(ParentRunner.java:329)
	at org.junit.runners.ParentRunner.access$100(ParentRunner.java:66)
	at org.junit.runners.ParentRunner$2.evaluate(ParentRunner.java:293)
	at org.junit.runners.ParentRunner$3.evaluate(ParentRunner.java:306)
	at org.junit.runners.ParentRunner.run(ParentRunner.java:413)
	at org.junit.runner.JUnitCore.run(JUnitCore.java:137)
	at com.intellij.junit4.JUnit4IdeaTestRunner.startRunnerWithArgs(JUnit4IdeaTestRunner.java:73)
	at com.intellij.rt.junit.IdeaTestRunner$Repeater$1.execute(IdeaTestRunner.java:38)
	at com.intellij.rt.execution.junit.TestsRepeater.repeat(TestsRepeater.java:11)
	at com.intellij.rt.junit.IdeaTestRunner$Repeater.startRunnerWithArgs(IdeaTestRunner.java:35)
	at com.intellij.rt.junit.JUnitStarter.prepareStreamsAndStart(JUnitStarter.java:226)
	at com.intellij.rt.junit.JUnitStarter.main(JUnitStarter.java:62)


Process finished with exit code -1
```

#### 存在的核心问题
- 破坏父类契约：父类承诺无支付上限，子类私自新增金额限制，修改了原有行为
- 无法无缝替换：父类可正常执行的逻辑，替换为子类后直接抛异常，程序行为突变
- 多态彻底失效：调用方依赖父类规范，却需要适配各类子类的自定义特殊规则，维护成本爆炸
- 长期迭代会形成烂代码：每个子类都自定义特殊逻辑，无统一规范，代码混乱难以维护

### 2. 改进后

核心优化思路：统一父类契约，所有子类严格遵循父类定义的行为、异常规范，差异化能力合理扩展，不破坏原有约定。
<br>
第一步：定义统一支付异常体系，规范异常契约
```java
/**
 * 支付统一异常体系，规范所有支付子类的异常行为
 */
public class PaymentException extends RuntimeException {
    public PaymentException(String message) {
        super(message);
    }

    /**
     * 支付限额专属异常
     */
    public static class LimitExceededException extends PaymentException {
        public LimitExceededException(String message) {
            super(message);
        }
    }
}
```

第二步：抽象父类，统一行为契约（声明规范，所有子类必须遵守）
```java
/**
 * 支付顶层抽象类
 * 统一契约：所有支付方式均需实现pay方法，异常统一为PaymentException
 */
abstract class Payment {
    /**
     * 支付方法（统一契约）
     * @param amount 支付金额
     * @throws PaymentException 支付失败统一异常
     */
    abstract void pay(double amount) throws PaymentException;
}
```

第三步：子类实现差异化逻辑，只扩展、不破坏契约
```java
/**
 * 信用卡支付子类
 * 严格遵循父类异常契约，差异化规则合理扩展，不破坏统一规范
 */
public class CreditCardPayment extends Payment {
    private static final double LIMIT_AMOUNT = 1000.0d;

    @Override
    void pay(double amount) throws PaymentException {
        // 子类差异化规则（合理扩展）
        if (amount > LIMIT_AMOUNT) {
            throw new PaymentException.LimitExceededException("信用卡单次支付不能超过" + LIMIT_AMOUNT + "元");
        }
        if (amount > 800) {
            throw new PaymentException("支付失败, 信用卡余额不足");
        }
        System.out.println("成功使用信用卡支付" + amount + "元");
    }
}
```

阿里支付实现
```java
/**
 * 支付宝支付子类
 * 同样遵循父类统一契约，独立实现自身业务规则
 */
public class AlipayPayment extends Payment {
    private static final double LIMIT_AMOUNT = 50000.0d;

    @Override
    void pay(double amount) throws PaymentException {
        if (amount > LIMIT_AMOUNT) {
            throw new PaymentException.LimitExceededException("Alipay单次支付不能超过" + LIMIT_AMOUNT + "元");
        }
        System.out.println("成功使用Alipay支付" + amount + "元");
    }
}
```

```java
public class PayTest {
    @Test
    public void test_pay() {
        // 子类无缝替换父类，遵循统一契约
        Payment payment = new CreditCardPayment();
        payment.pay(1000.0d);

        Payment alipay = new AlipayPayment();
        alipay.pay(5000d);
    }
}
```

预期可能会执行失败，并且返回的结果也是预期定义的异常结果。符合里氏替换原则。
<br>
执行结果如下所示：
```java
cn.manihong.demo.design.lsp.v2.PaymentException: 支付失败, 信用卡余额不足

	at cn.manihong.demo.design.lsp.v2.CreditCardPayment.pay(CreditCardPayment.java:20)
	at cn.manihong.demo.design.lsp.v2.PayTest.test_pay(PayTest.java:15)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:104)
	at java.base/java.lang.reflect.Method.invoke(Method.java:565)
	at org.junit.runners.model.FrameworkMethod$1.runReflectiveCall(FrameworkMethod.java:59)
	at org.junit.internal.runners.model.ReflectiveCallable.run(ReflectiveCallable.java:12)
	at org.junit.runners.model.FrameworkMethod.invokeExplosively(FrameworkMethod.java:56)
	at org.junit.internal.runners.statements.InvokeMethod.evaluate(InvokeMethod.java:17)
	at org.junit.runners.ParentRunner$3.evaluate(ParentRunner.java:306)
	at org.junit.runners.BlockJUnit4ClassRunner$1.evaluate(BlockJUnit4ClassRunner.java:100)
	at org.junit.runners.ParentRunner.runLeaf(ParentRunner.java:366)
	at org.junit.runners.BlockJUnit4ClassRunner.runChild(BlockJUnit4ClassRunner.java:103)
	at org.junit.runners.BlockJUnit4ClassRunner.runChild(BlockJUnit4ClassRunner.java:63)
	at org.junit.runners.ParentRunner$4.run(ParentRunner.java:331)
	at org.junit.runners.ParentRunner$1.schedule(ParentRunner.java:79)
	at org.junit.runners.ParentRunner.runChildren(ParentRunner.java:329)
	at org.junit.runners.ParentRunner.access$100(ParentRunner.java:66)
	at org.junit.runners.ParentRunner$2.evaluate(ParentRunner.java:293)
	at org.junit.runners.ParentRunner$3.evaluate(ParentRunner.java:306)
	at org.junit.runners.ParentRunner.run(ParentRunner.java:413)
	at org.junit.runner.JUnitCore.run(JUnitCore.java:137)
	at com.intellij.junit4.JUnit4IdeaTestRunner.startRunnerWithArgs(JUnit4IdeaTestRunner.java:73)
	at com.intellij.rt.junit.IdeaTestRunner$Repeater$1.execute(IdeaTestRunner.java:38)
	at com.intellij.rt.execution.junit.TestsRepeater.repeat(TestsRepeater.java:11)
	at com.intellij.rt.junit.IdeaTestRunner$Repeater.startRunnerWithArgs(IdeaTestRunner.java:35)
	at com.intellij.rt.junit.JUnitStarter.prepareStreamsAndStart(JUnitStarter.java:226)
	at com.intellij.rt.junit.JUnitStarter.main(JUnitStarter.java:62)


Process finished with exit code -1
```

#### 改进核心亮点（符合 LSP）
- 契约统一：父类明确定义方法、异常规范，所有子类严格遵守，无私自篡改行为
- 扩展不修改：子类仅实现自身差异化业务规则，不破坏父类原有行为，符合LSP+OCP
- 多态稳定：所有子类可无缝替换父类，调用方无需感知子类差异，代码通用性极强
- 代码规范：统一异常、统一行为，避免杂乱无章的自定义逻辑，杜绝烂代码滋生


## 案例二【经典矩形-正方形误区（深度理解LSP契约）】

### 1. 改进前
```java
/**
 * 矩形父类
 * 契约：setWidth 只修改宽度；setHeight 只修改高度，宽高互相独立
 */
public class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int width) {
        this.width = width;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public int getArea() {
        return width * height;
    }
}
```

```java
/**
 * 正方形子类，继承矩形
 * 业务上正方形是矩形，但代码契约冲突，违反LSP
 */
public class Square extends Rectangle {

    @Override
    public void setWidth(int width) {
        // 正方形宽高必须相等，修改宽度同时修改高度
        super.setWidth(width);
        super.setHeight(width);
    }

    @Override
    public void setHeight(int height) {
        // 修改高度同时修改宽度，破坏父类契约
        super.setHeight(height);
        super.setWidth(height);
    }
}
```

```java
public class RectangleTest {
    @Test
    public void testResizeRectangle() {
        // 父类引用指向子类对象（多态调用）
        Rectangle rectangle = new Square();

        // 调用方按照【矩形契约】预期：只修改宽度，高度保持不变
        rectangle.setWidth(5);
        rectangle.setHeight(10);

        // 调用方预期：width=5，height=10，面积=50
        // 实际结果：width=10，height=10，面积=100
        System.out.println("宽：" + rectangle.getWidth());
        System.out.println("高：" + rectangle.getHeight());
        System.out.println("面积：" + rectangle.getArea());
    }
}
```

#### 存在的问题
调用方拿到 `Rectangle` 引用，**默认遵守父类契约**：`setWidth()` 只改宽，`setHeight()` 只改高。
但实际对象是 `Square`，修改宽会同步修改高，修改高也同步修改宽。
替换子类之后，程序行为和父类契约不一致，**违反里氏替换原则**。

> 虽然现实世界正方形属于矩形，但**代码契约不满足 LSP，就不能用继承**。


### 2. 改进后

解决方案：不要让 Square 继承 Rectangle，二者共同实现一个图形接口。
```java
/**
 * 图形接口
 */
public interface Shape {
    int getArea();
}
```

```java
public class ShapeUtil {
    public static int getArea(Shape shape) {
        return shape.getArea();
    }
}
```

```java
/**
 * 矩形，实现图形接口
 */
public class Rectangle implements Shape {
    private int width;
    private int height;

    public void setWidth(int width) {
        this.width = width;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    @Override
    public int getArea() {
        return width * height;
    }
}
```

```java
/**
 * 正方形，独立实现Shape接口，不再继承Rectangle
 */
public class Square implements Shape {
    private int side;

    public void setSide(int side) {
        this.side = side;
    }

    public int getSide() {
        return side;
    }

    @Override
    public int getArea() {
        return side * side;
    }
}
```

矩形和正方形各自独立实现，不再强行继承，规避 LSP 破坏问题。
```java
public class ShapeAreaTest {

    @Test
    public void testRectangleArea() {
        // 矩形：宽高独立
        Rectangle rectangle = new Rectangle();
        rectangle.setWidth(5);
        rectangle.setHeight(10);
        System.out.println("矩形宽：" + rectangle.getWidth());
        System.out.println("矩形高：" + rectangle.getHeight());
        System.out.println("矩形面积：" + ShapeUtil.getArea(rectangle));
    }

    @Test
    public void testSquareArea() {
        // 正方形：单独设置边长，不继承矩形
        Square square = new Square();
        square.setSide(10);
        System.out.println("正方形边长：" + square.getSide());
        System.out.println("正方形面积：" + ShapeUtil.getArea(square));
    }
}

```

很多人误解LSP：以为继承就是is-a关系，业务上的is-a ≠ 代码设计上的is-a。
业务中正方形是特殊的矩形，但代码层面正方形不能继承矩形，会直接违背LSP：
- 父类矩形契约：设置宽只改变宽、设置高只改变高，宽高相互独立
- 子类正方形特性：宽高必须相等，设置宽会同步改高，设置高会同步改宽

当调用方以父类矩形的视角操作子类正方形时，会完全违背预期：原本只修改宽度，结果高度同步变化，程序逻辑彻底错乱。
<br>
LSP核心精髓：子类必须无条件遵守父类对外公布的所有行为契约，调用方只信任父类，无需感知子类。一旦子类破坏契约，就不具备继承资格。

## LSP 核心判断标准
满足以下所有条件，才符合里氏替换原则：
1. 子类可以实现父类的抽象方法，禁止重写父类已实现的通用方法
2. 子类抛出的异常不能超出父类声明的异常范围
3. 子类的入参范围、返回值范围需要兼容父类，不能缩小父类能力
4. 父类能正常执行的场景，子类替换后必须也能正常执行

## LSP 与前两大原则的联动关系
- SRP（单一职责）：保证类职责纯净，是LSP的基础
- LSP（里氏替换）：保证子类合规扩展，是OCP的实现前提
- OCP（开闭原则）：最终落地结果，依靠LSP实现安全扩展
设计原则执行顺序：先单一职责 → 再里氏替换 → 最终实现开闭扩展

## LSP 适用场景 & 避坑总结

### 适用场景
- 多态场景：父类统一调度，多子类差异化实现
- 框架扩展场景：基于父类/抽象类自定义扩展能力
- 统一规范场景：需要所有子类遵循统一行为、异常、入参出参规范

### 常见违坑场景
- 子类重写父类普通已实现方法，篡改原有逻辑
- 子类缩小父类能力范围（无限制→有限制）
- 子类抛出父类未声明的异常
- 滥用继承：业务is-a但代码契约不满足，强行继承

## 结语
里氏替换原则的本质不是“子类继承父类”，而是子类遵守父类契约。继承是语法，LSP是设计约束。
<br>
所有多态、接口扩展、框架插件化能力，全部建立在 LSP 之上。严格遵循 LSP，能从根源规避继承带来的隐性 BUG，让代码扩展更安全、更规范、更易维护
