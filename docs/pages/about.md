# About

> 易于维护的前端研发架构


&emsp;&emsp;RDE诞生的背景是，我们发现前端工程目前存在以下问题：

* 工程的开发与维护都是以工程为单位进行管理，每个工程都在重复开发基础设施

* 脚手架都只负责初始化工程，只能保持在创建时一致，后续维护靠业务开发者自己重复维护

&emsp;&emsp;如果业务中有大量工程，就会造成人力浪费与推进改造效率低下等问题；RDE通过重构前端工程结构，给出一套可维护的脚手架方案，实现业务与工程基础设施的分离、基础设施可持续升级维护、进一步提升业务开发者的开发体验

### 解决的问题

* 开发业务时，先要从一堆与业务无关的（配置）文件中定位到页面文件，整体工程的感觉比较混乱
* 每个工程重复建设基础设施，重复配置，如webpack基础配置，打点、sentry、mock搭建等
* 每次升级依赖，如webpack、vue等、优化打包等，都需要推进每一个工程升级，效率低下
* 很难同步多个工程的依赖规范，如统一使用echart，统一表单验证库等
* 很难同步多个工程的开发规范，如一些norm术语，lint、serve等，再比如目录结构规范；可以降低跨工程开发成本
* 工程文档维护比较困难，每个工程虽然可以放一个README，但是新人上手体验不好，并且README很容易由于没有及时维护而失效

### 实现方案

&emsp;&emsp;对原工程结构，按照功能进行拆分为3部分：

* 工程基础设施：打包、开发、mock、lint、precommit校验、commit-msg校验、lint规则制定、基础依赖包等
* 开发套件：多个工程复用的component、util、directive、mixin、decorator、filter、style、request方法等；

* 业务应用：业务生产的工程

&emsp;&emsp;RDE充当着连接各部分的角色，提供方案，让这3部分的开发变得更简单；实现细节可以关注[wiki](https://github.com/kaola-fed/RDE/wiki)，整体思路很简单，将工程拆分为一个app目录、一个template目录，app目录放业务，template目录放基础设施，app目录放在业务的git工程中，template目录发布在docker hub容器里，本地运行时，将二者在docker中进行聚合，然后运行；

![](https://haitao.nos.netease.com/bf0c98ac-6416-4d29-8bd4-bf94172a4354_835_619.png)

### 核心功能CASE

RDC容器：用户自己封装维护，并发布在dockerhub上的的工程基础设施镜像，C代表Container

RDA应用：业务工程应用，A代表Application

RDS套件：在业务开发工作中，通用的不仅是组件，因此提出套件的概念，包括通用组件、方法、directive、mixin、decorators等

RDE工具： 整套方案的连接器，提供创建工程、开发运行、发布、生成IDE配置等功能

回顾前端发展进程，RDE可以作为集成汇总、组合所有服务的一个更通用的标准方案，让开发维护工程的粒度不再是工程，而可以根据自己实际需要，进行组合复用；如下图：

![](https://haitao.nos.netease.com/aad8723b-98c7-4774-bfbb-072ddb3ac7b4_1552_1166.jpg)

