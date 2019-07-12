#### RDC扩展说明

由于 RDC 是服务于上层多个 RDA 应用，必然存在一些动态配置，RDE提供3种方式供 RDC 开发者使用，方便实现不同的需求，分别是：

##### Render
使用 rda.config.js 中的 render 配置，获取不同应用的不同变量，在对应的RDC文件中使用 mustache 语法渲染变量

下面以RDC应用为例，说明如何使用：
* 首先配置 `rdc.config.js`
```javascript
{
  render: {
    includes: ['.html'],
    mock: {
      myTitle: 'hello world',
    }
  }
}

```

* 然后，在 template 目录下的任意一个 html 文件中插入 `{{myTitle}}`
* 运行，可以查看到 `{{myTitle}}` 的位置显示为 `hello world` 


##### Variables
使用 rda.config.js 中的 variables 配置，在需要的位置，引用 varaibles 文件，获取对应的配置

variables 是对 render 的扩展，因为 render 使用的是 mustache 模板， 对于 js 方法以及 mustache 无法通过 eslint的校验等问题，render 无法解决；这时候可以使用 variables 配置；
RDE在运行时，会读取 variables 的配置，并写入 Docker 容器项目根目录下的 `rdc.variables.js` 文件中，你可以在 js 文件使用

```javascript
const variables = require('${relativeToProjectRoot}/rdc.varaibles')
```
获取到 RDA 配置的变量， rdc.varaibles.js 与 rdc.config.js 在Docker中是同级文件，同时请注意，由于 rdc.variables.js 是通过模板自动写入的文件，该文件不会符合工程的 eslint 规则，所以请将这个文件，加入到 eslintignore 文件中

##### 运行周期Hook
使用 RDE 在运行周期内的不同阶段提供的 hook ，执行一些逻辑脚本:

1. 首先在本地启动rde时，会触发`preMount`
1. 然后在Docker中，如果是integrate模式，在合并app和template目录前，会触发`preIntegrate`
1. 在合并后，会触发`postIntegrate`
1. 合并好后， 在运行npm命令前会触发`preRun`
1. 在运行后，会触发`postRun`



![](https://haitao.nos.netease.com/b9426d67-bfb8-4334-aed5-c959dd023a86_686_614.png)

请注意，在本地环境的hook只有preMount，其他hook都是在Docker环境中执行；具体使用哪个hook请根据需求评估；
