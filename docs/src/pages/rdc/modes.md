#### RDC 模式选择

> rda应用在docker中运行时，基于选择的rdc容器。我们使用rde工具将 rdc容器中的template与 rda应用业务代码整合到一起，RDC 模式选择 就是整合方式的选择，我们提供了两种整合方式：integrate 和 origin，默认是 integrate。

#### integrate 模式

> 在docker中会生成.integrate目录。app和template将会根据 rdc.config.js中的mappings配置，合并到.integrate目录下，形成完整的运行时目录。npm run serve 命令实际运行在此目录下。

##### 举例说明

##### 本地 rda 应用 目录结构

```
|-- app/
|   |-- components/
|   |-- App.vue
|-- rda.config.js
```

##### rdc 容器 目录结构

```
|-- app/
|-- template/
|   |-- public/
|   |-- src/
|   |   |--main.js
|   |-- package.json
|-- rdc.config.js
```

##### rdc.config.js 中mappings配置
```
 mappings: [
    {
      from: 'app/App.vue',
      to: 'src/App.vue'
    },
    {
      from: 'app/components',
      to: 'src/components'
    }
  ],
```

##### docker中目录结构

```
|-- app/
|-- template/
|-- node_moduels/
|-- .integrate/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- App.vue
|   |   |-- main.js
|   |-- package.json
```
![image](https://haitao.nos.netease.com/34469a3b-e541-4d5e-b1b2-87b967c7b502_860_589.png)

#### orgin 模式

> app和template直接挂载到docker中，template将会被渲染到同级目录结构的runtime下（渲染template模板中的mustache变量），npm run serve 命令运行在runtime目录下。

##### 举例说明

rda 应用目录结构、rdc 工程目录接口已经rdc.config.js 中mapping的配置和之前一致，则实际docker中目录结构如下：

##### docker 中目录结构
```
|-- app/
|-- template/
|-- node_moduels/
|-- runtime/
|   |-- public/
|   |-- src/
|   |   |-- main.js
|   |-- package.json
```

![image](https://haitao.nos.netease.com/87cb27d8-e239-42ae-94b5-b179bf61f715_860_589.png)
- 在origin模式下，npm run serve 命令运行在runtime目录下，runtime下直接引用外层app目录下代码，需要rdc 开发者需要合理配置webapck、eslint-loader、ts-loader等。

#### 开发流程

![image](https://haitao.nos.netease.com/a9894af3-2b6b-407f-be2c-8116611b1c20_849_180.png)

