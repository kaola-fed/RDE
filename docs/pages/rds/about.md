# About

> RDS只是提出的一个概念，与RDE本身并没有关系

&emsp;&emsp;在RDE之前，大家封装都是基于组件进行抽象提取，公用的方法、directive、mixins等都没有公用的方案，但是他们确实又是经常用到的，基于这个背景，提出了RDS套件的概念；RDE工具本身不包含RDS的集成和实现；在原有组件库中加入通用的filter、mixins等功能，并且暴露install方法，就可以作为一个开发套件RDS；


### 示例
&emsp;&emsp;下面以nek-ui为例，展示提取出来的RDS如何在RDE的环境下使用；

#### 准备工作：
1. 扩充原来只有components的目录结构，新增filters、directives、mixins等通用功能
![](https://haitao.nos.netease.com/401c6609-75f8-4deb-bc5d-df75543332d6_615_420.png) 

2. 修改原来的组件库入口文件，export新增一个install方法，将通用的组件、filters、directives等都注册到全局Regular/Vue/React上；
```javascript
exports.install =  (Regular) => {
    Regular.component('<name>', $component);
    Regular.filter($filters)
    Regular.directive($directives)
}
```

> 以上目录结构、方法名称都只是示例，请根据自己的实际情况制定规范

#### RDC改造
&emsp;&emsp;RDC如果封装了业务工程的入口文件，那么在入口文件开始的位置，可以新增如下代码：
```javascript
try {
  import {install} from 'suitesInstall.js';
  install();
} catch(e) {}

以上是伪代码, 实际使用请替换
suitesInstall的路径与名称可以自己定义
```

&emsp;&emsp;suitesInstall的路径，需要由RDC开发自己规范，如可以根据选择的RDC的开发模式，要求业务开发人员将suitesInstall.js放在app目录首级，也可以定义对应的mappings，将对应的文件映射到对应的位置；注意，如果确定了方案，请在文档上注明RDA开发者如何使用；

#### RDA改造
&emsp;&emsp;RDA需要根据RDC提供的文档说明，在指定的位置提供suitesInstall文件，在该文件中，填写如下代码：
```javascript
import Regular from 'regularjs';
import {install: installSuiteA} from 'suite-a.js';
import {install: installSuiteB} from 'suite-b.js';

exports.install = () => {
  installSuiteA(Regular);
  installSuiteB(Regular);
}
```

#### 总结
&emsp;&emsp;从上面可以看出，套件的使用方案其实是RDC开发者自己定的，以上只是给了一个实现方案的例子，可以根据自己的实际情况，制定自己的方案；其中很重要的一点是，请将指定的方案体现到文档上，方便RDA开发者使用；
