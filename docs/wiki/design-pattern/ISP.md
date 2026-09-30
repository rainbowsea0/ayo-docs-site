---
title: 接口隔离原则（ISP）
date: 2026-09-24
tags: [设计原则]
summary: 接口隔离原则：客户端不应被迫依赖它不使用的方法，接口按角色拆小，实现类只实现所需能力，调用方只依赖所需接口，降低耦合、提升扩展性与可维护性。
order: 104
group: 设计原则
layout: wiki
---

:::warning 注意
接口隔离不等于无限拆分接口。拆得过碎会导致类实现一大堆接口，可读性下降，要以**客户端角色 / 能力边界**作为拆分标尺，而不是盲目拆到每个方法一个接口。
:::

接口隔离原则（Interface Segregation Principle，ISP）：客户端不应被迫依赖它不使用的方法。一个类对另一个类的依赖应该建立在最小的接口上，接口的粒度要小，按角色、按能力拆分。
<br/>
简单理解：接口不是越大越全越好，而是越贴合客户端需求越好。实现类只实现自己真正具备的能力，调用方只依赖自己真正用到的方法。
<br/>
ISP 是 SRP 在接口层面的延伸，也是 OCP 的重要保障。违背 ISP 会导致接口污染、空实现、UnsupportedOperationException、调用方耦合无关能力，最终让系统难以扩展和维护。

## 案例一 【门禁控制】

### 改进前

门禁接口定义了所有门都可能需要的方法，但普通门锁并不具备告警能力，却被强制实现 alarm()。
```java [Door.java]
/**
 * 门禁接口
 * 问题：接口过大，把开关门、上锁解锁、告警能力全部揉在一起
 */
public interface Door {

    // 开门
    void open();

    // 关门
    void close();

    // 上锁
    void lock();

    // 解锁
    void unlock();

    // 告警
    void alarm();

}
```

```java [NormalDoor.java]
/**
 * 普通门锁
 * 普通门锁没有告警能力，但被迫实现 alarm()
 */
public class NormalDoor implements Door{

    @Override
    public void open() {
        System.out.println("开门");
    }

    @Override
    public void close() {
        System.out.println("关门");
    }

    @Override
    public void lock() {
        System.out.println("上锁");
    }

    @Override
    public void unlock() {
        System.out.println("解锁");
    }

    @Override
    public void alarm() {
        throw new UnsupportedOperationException("普通门锁没有告警功能");
    }
}
```

```java [SmartDoor.java]
/**
 * 智能门锁
 */
public class SmartDoor implements Door{

    @Override
    public void open() {
        System.out.println("开门");
    }

    @Override
    public void close() {
        System.out.println("关门");
    }

    @Override
    public void lock() {
        System.out.println("上锁");
    }

    @Override
    public void unlock() {
        System.out.println("解锁");
    }

    @Override
    public void alarm() {
        System.out.println("门禁告警已上报");
    }
}
```

```java [LockService.java]
public class LockService {
    private final Door door;

    public LockService(Door door) {
        this.door = door;
    }

    public void lock() {
        door.lock();
    }
}
```

```java [AlarmService.java]
public class AlarmService {
    private final Door door;

    public AlarmService(Door door) {
        this.door = door;
    }

    public void alarm() {
        door.alarm();
    }
}
```

```java [DoorTest.java]
public class DoorTest {

    @Test
    public void test() {
        // 上锁服务：普通门锁能用
        LockService lockService = new LockService(new NormalDoor());
        lockService.lock();

        // 告警服务：普通门锁没有告警能力
        // 但编译通过，因为 NormalDoor 实现了 Door
        AlarmService alarmService = new AlarmService(new NormalDoor());
        alarmService.alarm(); // 运行时抛 UnsupportedOperationException
    }
}
```

#### 存在的核心问题
- 接口职责不单一：Door 同时包含开关门、上锁解锁、告警等多类能力。
- AlarmService 只使用 alarm()，却依赖整个 Door。
- NormalDoor 没有告警能力，却能传入 AlarmService。 错误被推迟到运行时才暴露。
- NormalDoor 被迫实现 alarm()，只能抛 UnsupportedOperationException，接口污染严重。
- 后续接口新增能力（比如 record() 录像）时，所有门锁实现类都要被迫修改。
- 违反 ISP 会进一步诱发违反 LSP（***NormalDoor 抛出不支持操作异常，无法完整履行接口契约，破坏了里氏替换原则***）：NormalDoor 对 Door.alarm() 的“实现”直接破坏契约。

### 改进后

核心优化思路：按能力拆分接口，让实现类只实现自己真正具备的能力，让调用方只依赖自己真正需要的方法。
```java [Alarmable.java]
/**
 * 告警接口
 */
public interface Alarmable {

    void alarm();

}
```

```java [Lockable.java]
/**
 * 上锁接口
 */
public interface Lockable {

    void lock();

    void unlock();

}
```

```java [Openable.java]
/**
 * 开关接口，所有门禁都应该实现这个接口
 */
public interface Openable {

    void open();

    void close();

}
```

```java [MachineDoor.java]
/**
 * 机械门锁 - 只能开关门
 */
public class MachineDoor implements Openable {

    @Override
    public void open() {
        System.out.println("开门");
    }

    @Override
    public void close() {
        System.out.println("关门");
    }
}
```

```java [NormalDoor.java]
/**
 * 普通门锁
 *
 * @author zhangh0803
 */
public class NormalDoor implements Openable, Lockable{

    @Override
    public void lock() {
        System.out.println("上锁");
    }

    @Override
    public void unlock() {
        System.out.println("解锁");
    }

    @Override
    public void open() {
        System.out.println("开门");
    }

    @Override
    public void close() {
        System.out.println("关门");
    }
}
```

```java [SmartDoor.java]
/**
 * 智能门锁
 *
 * @author zhangh0803
 */
public class SmartDoor implements Openable, Lockable, Alarmable {

    @Override
    public void alarm() {
        System.out.println("告警上报");
    }

    @Override
    public void lock() {
        System.out.println("上锁");
    }

    @Override
    public void unlock() {
        System.out.println("解锁");
    }

    @Override
    public void open() {
        System.out.println("开门");
    }

    @Override
    public void close() {
        System.out.println("关门");
    }
}
```

服务只依赖最小接口：
```java [OpenService.java]
public class OpenService {
    private final Openable openable;

    public OpenService(Openable openable) {
        this.openable = openable;
    }

    public void open() {
        openable.open();
    }
}
```

```java [LockService.java]
public class LockService {
    private final Lockable lockable;

    public LockService(Lockable lockable) {
        this.lockable = lockable;
    }

    public void lock() {
        lockable.lock();
    }
}
```

```java [AlarmService.java]
public class AlarmService {
    private final Alarmable alarmable;

    public AlarmService(Alarmable alarmable) {
        this.alarmable = alarmable;
    }

    public void alarm() {
        alarmable.alarm();
    }
}
```

```java [DoorTest.java]
public class DoorTest {

    @Test
    public void test() {
        // 上锁服务：普通门锁和智能门锁都能用
        LockService normalLockService = new LockService(new NormalDoor());
        normalLockService.lock();

        LockService smartLockService = new LockService(new SmartDoor());
        smartLockService.lock();

        // 告警服务：只有智能门锁能传入
        AlarmService smartAlarmService = new AlarmService(new SmartDoor());
        smartAlarmService.alarm();

        // 编译期直接报错：NormalDoor 不是 Alarmable
        // AlarmService normalAlarmService = new AlarmService(new NormalDoor());
    }
}
```

#### 改进核心亮点（符合 ISP）
接口按能力拆分：Openable、Lockable、Alarmable 各自职责单一。
<br/>
实现类按需组合：MachineDoor 只实现 Openable，NormalDoor 实现 Openable + Lockable，SmartDoor 实现 Openable + Lockable + Alarmable。
<br/>
调用方只依赖所需接口：OpenService 只依赖 Openable，LockService 只依赖 Lockable，AlarmService 只依赖 Alarmable。
<br/>
消除空实现和异常实现：普通门锁不再被迫实现 alarm()。
<br/>
扩展更安全：新增能力只需新增小接口或组合接口，不影响已有客户端。
<br/>
符合 ISP + SRP + OCP：接口职责清晰，实现类能力明确，系统更容易扩展和维护。


## 案例二 【智能打印设备】

### 改进前
```java [MultiFunctionDevice.java]
/**
 * 多功能设备接口
 *
 * 问题：把打印、扫描、传真、复印全部揉在一起
 */
public interface MultiFunctionDevice {

    void print(String content);

    void scan();

    void fax(String number);

    void copy();

}
```

普通打印机只支持打印，但被迫实现扫描、传真、复印：
```java [SimplePrinter.java]
/**
 * 普通打印机：只支持打印
 */
public class SimplePrinter implements MultiFunctionDevice {

    @Override
    public void print(String content) {
        System.out.println("普通打印机打印：" + content);
    }

    @Override
    public void scan() {
        throw new UnsupportedOperationException("普通打印机不支持扫描");
    }

    @Override
    public void fax(String number) {
        throw new UnsupportedOperationException("普通打印机不支持传真");
    }

    @Override
    public void copy() {
        throw new UnsupportedOperationException("普通打印机不支持复印");
    }
}
```

高级一体机支持全部功能：
```java [AdvancedPrinter.java]
/**
 * 高级一体机：支持全部功能
 */
public class AdvancedPrinter implements MultiFunctionDevice {

    @Override
    public void print(String content) {
        System.out.println("高级一体机打印：" + content);
    }

    @Override
    public void scan() {
        System.out.println("高级一体机扫描");
    }

    @Override
    public void fax(String number) {
        System.out.println("高级一体机传真到：" + number);
    }

    @Override
    public void copy() {
        System.out.println("高级一体机复印");
    }
}
```

客户端只依赖自己需要的方法，但当前被迫依赖整个 MultiFunctionDevice：
```java [PrintService.java]
/**
 * 打印服务：只需要 print()
 */
public class PrintService {

    private final MultiFunctionDevice device;

    public PrintService(MultiFunctionDevice device) {
        this.device = device;
    }

    public void print(String content) {
        device.print(content);
    }
}
```

```java [FaxService.java]
/**
 * 传真服务：只需要 fax()
 */
public class FaxService {

    private final MultiFunctionDevice device;

    public FaxService(MultiFunctionDevice device) {
        this.device = device;
    }

    public void sendFax(String number) {
        device.fax(number);
    }
}
```

测试：
```java [DeviceTest.java]
public class DeviceTest {

    @Test
    public void test() {
        MultiFunctionDevice simplePrinter = new SimplePrinter();

        PrintService printService = new PrintService(simplePrinter);
        printService.print("合同"); // 正常

        // 编译器允许，因为 SimplePrinter 实现了 MultiFunctionDevice
        // 但运行时会抛 UnsupportedOperationException
        FaxService faxService = new FaxService(simplePrinter);
        faxService.sendFax("123456");
    }
}
```

#### 存在的问题
- MultiFunctionDevice 是典型的“胖接口”，职责过多。
- SimplePrinter 只支持打印，却被迫实现 scan()、fax()、copy()。
- 不支持的方法只能空实现或抛 UnsupportedOperationException，接口污染严重。
- PrintService 只使用 print()，却依赖整个 MultiFunctionDevice。
- FaxService 只使用 fax()，同样依赖整个 MultiFunctionDevice。
- 更严重的是：SimplePrinter 能被传入 FaxService，编译器无法阻止，错误被推迟到运行时。
- 后续接口新增能力时，所有实现类都可能被迫修改，扩展成本高。


### 改进后

核心优化思路：按能力拆分接口，让实现类只实现自己真正具备的能力，让客户端只依赖自己真正需要的方法。
```java [Printable.java]
/**
 * 打印能力
 */
public interface Printable {

    void print(String content);

}
```

```java [Scannable.java]
/**
 * 扫描能力
 */
public interface Scannable {

    void scan();

}
```

```java [Faxable.java]
/**
 * 传真能力
 */
public interface Faxable {

    void fax(String number);

}
```

```java [Copyable.java]
/**
 * 复印能力
 */
public interface Copyable {

    void copy();

}
```

普通打印机只实现 Printable：
```java [SimplePrinter.java]
/**
 * 普通打印机：只支持打印
 */
public class SimplePrinter implements Printable {

    @Override
    public void print(String content) {
        System.out.println("普通打印机打印：" + content);
    }
}
```

高级一体机按能力组合实现：
```java [AdvancedPrinter.java]
/**
 * 高级一体机：支持打印、扫描、传真、复印
 */
public class AdvancedPrinter implements Printable, Scannable, Faxable, Copyable {

    @Override
    public void print(String content) {
        System.out.println("高级一体机打印：" + content);
    }

    @Override
    public void scan() {
        System.out.println("高级一体机扫描");
    }

    @Override
    public void fax(String number) {
        System.out.println("高级一体机传真到：" + number);
    }

    @Override
    public void copy() {
        System.out.println("高级一体机复印");
    }
}
```

客户端只依赖最小接口：
```java [PrintService.java]
/**
 * 打印服务：只依赖 Printable
 */
public class PrintService {

    private final Printable printable;

    public PrintService(Printable printable) {
        this.printable = printable;
    }

    public void print(String content) {
        printable.print(content);
    }
}
```

```java [FaxService.java]
/**
 * 传真服务：只依赖 Faxable
 */
public class FaxService {

    private final Faxable faxable;

    public FaxService(Faxable faxable) {
        this.faxable = faxable;
    }

    public void sendFax(String number) {
        faxable.fax(number);
    }
}
```

测试：
```java [DeviceTest.java]
public class DeviceTest {

    @Test
    public void test() {
        // PrintService 只依赖 Printable，普通打印机和高级一体机都能用
        PrintService simplePrintService = new PrintService(new SimplePrinter());
        simplePrintService.print("合同");

        PrintService advancedPrintService = new PrintService(new AdvancedPrinter());
        advancedPrintService.print("标书");

        // FaxService 只依赖 Faxable，只有高级一体机能被传入
        FaxService faxService = new FaxService(new AdvancedPrinter());
        faxService.sendFax("123456");

        // 编译期直接报错：SimplePrinter 不是 Faxable
        // FaxService simpleFaxService = new FaxService(new SimplePrinter());
    }
}
```

#### 改进核心亮点（符合 ISP）
- 接口按能力拆分：Printable、Scannable、Faxable、Copyable 各自职责单一。
- 实现类按需组合：SimplePrinter 只实现 Printable，AdvancedPrinter 实现多个能力接口。
- 客户端只依赖所需接口：PrintService 只依赖 Printable，FaxService 只依赖 Faxable。
- 消除空实现和异常实现：普通打印机不再被迫实现传真、扫描、复印。
- 错误从运行时提前到编译期：SimplePrinter 根本无法传入 FaxService。
- 接口变更影响范围小：后续新增 Stapleable 装订接口，只有需要装订的设备实现，旧客户端不受影响。
- 同时符合 ISP、SRP、OCP、LSP：接口精准，职责清晰，扩展安全，多态稳定。

## 结语
接口隔离原则的本质不是“接口越小越好”，而是“客户端只依赖它真正需要的能力”。接口是契约，契约越精准，耦合越低，扩展越安全。

- 不要为了 ISP 过度设计：如果接口只会被一个客户端使用，暂时胖一点没关系，当出现多个客户端、部分实现类出现空实现 / 抛异常时，再拆分；
- RPC/HTTP 接口注意区分：ISP 主要针对**程序内部抽象接口**；对外 http/rpc API 不要盲目拆成大量小接口，二者设计目标不一样；
- Java8 + 接口可以有 default 方法，很多人会用 default 填实现来规避异常；这属于掩耳盗铃，依然违背 ISP，只是把运行时异常藏起来。

当接口按角色拆小、实现类按能力组合、调用方按需依赖时，系统会自然形成高内聚、低耦合的结构。严格遵循 ISP，再配合 SRP、LSP、OCP，可以从根源减少接口污染和隐性 BUG，让代码扩展更安全、更规范、更易维护。