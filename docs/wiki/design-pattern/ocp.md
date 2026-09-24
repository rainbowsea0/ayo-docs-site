---
title: 开闭原则（OCP）
date: 2026-09-24
tags: [设计原则]
summary: 开闭原则的意思是：对扩展开放，对修改关闭。在程序需要进行拓展的时候，不能去修改原有的代码，实现一个热插拔的效果。简言之，是为了使程序的扩展性好，易于维护和升级。想要达到这样的效果，我们需要使用接口和抽象类，后面的具体设计中我们会提到这点。
order: 102
group: 设计原则
layout: wiki
---

## 案例一【简单计算器】

### 1. 改进前

```java
/**
 * 计算操作接口
 */
public interface CalculatorOperation {
}
```

```java
/**
 * 加法
 */
@Setter
@Getter
public class Addition implements CalculatorOperation {

    private double left;
    private double right;
    private double result = 0.0;

    public Addition(double left, double right) {
        this.left = left;
        this.right = right;
    }

}
```

```java
/**
 * 减法
 */
@Setter
@Getter
public class Subtraction implements CalculatorOperation {

    private double left;
    private double right;
    private double result = 0.0;

    public Subtraction(double left, double right) {
        this.left = left;
        this.right = right;
    }

}
```

```java
public class Calculator {

    public void calculate(CalculatorOperation operation) {
        if (operation == null) {
            throw new InvalidParameterException("Can not perform operation");
        }

        if (operation instanceof Addition addition) {
            addition.setResult(addition.getLeft() + addition.getRight());
        } else if (operation instanceof Subtraction subtraction) {
            subtraction.setResult(subtraction.getLeft() - subtraction.getRight());
        }
    }

}
```

```java
public class CalculatorTest {

    @Test
    public void test_calculate() {
        Calculator  calculator = new Calculator();
        Addition addition = new Addition(1.3D, 1.5D);
        calculator.calculate(addition);
        System.out.println(addition.getResult());
    }

}
```

#### 存在的问题
- `CalculatorOperation` 是空标记接口，没有抽象出计算行为；计算逻辑被放在 Calculator 内部，运算实现类只存储数据，算法逻辑和数据分离。
- 新增运算（乘法、除法等）必须修改 `Calculator#calculate`，增加类型判断分支，改动已有稳定代码，违反**对修改关闭**。
- 使用 `instanceof` 判断具体类型，属于代码坏味道。新增类型容易遗漏分支，代码可读性差，后续维护成本高。


### 2. 改进后

核心思路：把计算行为下沉到接口，每种运算自己实现计算逻辑；Calculator 只负责调度，不关心具体运算类型。
```java
public interface CalculatorOperation {

    /**
     * 执行计算
     */
    void perform();

}
```

```java
/**
 * 加法 - 内部实现
 */
@Getter
@Setter
public class Addition implements CalculatorOperation {

    private double left;
    private double right;
    private double result;

    public Addition(double left, double right) {
        this.left = left;
        this.right = right;
    }

    @Override
    public void perform() {
        result = left + right;
    }
}
```

```java
/**
 * 减法 - 内部实现
 */
@Getter
@Setter
public class Subtraction implements CalculatorOperation {

    private double left;
    private double right;
    private double result;

    public Subtraction(double left, double right) {
        this.left = left;
        this.right = right;
    }

    @Override
    public void perform() {
        this.result = this.left - this.right;
    }
}
```

```java
public class Calculator {

    public void calculate(CalculatorOperation operation) {
        if (operation == null) {
            throw new InvalidParameterException("Cannot perform operation");
        }
        // 面向接口调用，无需关心具体实现类
        operation.perform();
    }

}
```

新增【除法】能力，只需要新增实现类，**原有所有代码完全不用修改**：
```java
/**
 * 除法 - 新增方法
 */
@Getter
@Setter
public class Division implements CalculatorOperation {

    private double left;
    private double right;
    private double result;

    public Division(double left, double right) {
        this.left = left;
        this.right = right;
    }

    @Override
    public void perform() {
        if (right != 0) {
            result = left / right;
        } else {
            throw new IllegalArgumentException("Cannot divide by zero");
        }
    }
}
```

```java
public class CalculatorTest {

    @Test
    public void test_calculate() throws InvalidParameterException {

        // 创建一个计算器
        Calculator calculator = new Calculator();

        // 创建一个加法
        Addition add = new Addition(1.5D, 1.3D);
        // 执行加法计算器
        calculator.calculate(add);
        // 输出结果
        IO.println(add.getResult());


        // 创建一个除法
        Division div = new Division(15.0D, 3.0D);
        calculator.calculate(div);
        IO.println(div.getResult());
    }

}
```

#### 改进点
- 在接口中抽象出计算行为 `perform()`，每种运算把计算逻辑封装在自身实现类；Calculator 面向接口编程，不再关心运算具体类型。
- 新增运算（乘、除、乘方、取模等）只需要新增 `CalculatorOperation` 的实现类，原有代码无需改动，满足：**对扩展开放，对修改关闭**。
- 消除大量 `instanceof` 类型判断，调用方依赖抽象接口，各个运算实现类之间互不干扰。


## 适用场景
当业务未来大概率会新增同类功能，但原有核心逻辑尽量不要改动时，适合使用开闭原则做抽象设计。如果需求基本固定，几乎不会扩展，强行抽象会带来多余成本。

### 推荐使用场景
1. 存在大量同类型扩展点：例如支付渠道、消息推送、文件解析、会员权益，后续会持续新增同类实现；新增功能只需要新增实现类，核心调度代码无需改动。
2. 底层框架、通用核心组件：核心代码上线后需要保持稳定，修改风险高；业务能力通过扩展实现类接入。
3. 多团队协作开发：基础模块由基础团队维护，业务团队通过扩展实现新增能力，不需要改动底层核心代码。
4. 需要动态切换策略：运行时根据配置选择不同业务实现。

### 不推荐使用场景
1. 业务需求基本固定，几乎不存在扩展可能，提前抽象只会增加代码复杂度（过度设计）。
2. 业务需要改动核心流程，而不是新增同类实现。开闭原则解决的是功能扩展，不是流程改造。
3. 临时原型、一次性脚本，优先快速实现，无需提前抽象。


## 结语
:::tip OCP 补充要点
开闭原则不是说永远不能修改旧代码。如果是修复 bug，依然需要修改原有代码；开闭原则针对的是**新增业务功能**场景：新增能力优先新增代码，而不是修改已经稳定、上线的核心逻辑。
<br>
OCP 通常需要和单一职责原则配合使用。如果类职责混乱，即使使用抽象，也很难做到对修改关闭。
:::