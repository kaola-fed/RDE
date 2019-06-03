#### RDC 配置说明
##### framework

> 创建工程时，指定工程的框架，根据不同的类型会提示不同rdc。可选值有：

- 可选值：vue、regular、react、angular

##### mode

> 根据选择mode的不同，工程运行时会在docker中生成不同的目录结构。

- 可选值：integrate、origin
- integrate模式： 在docker中会生成.integrate目录。app和template将会根据 rdc.config.js中的mappings配置，集成到一起。npm run serve 命令实际运行在此目录下。
- origin模式：app和template直接挂载到docker中，template将会被渲染到同级目录结构的runtime下（渲染template模板中的mustache变量），npm run serve 命令运行在runtime目录下。
- 具体可参考[模式选择](/RDE/rdc/modes.html)

##### docs

```table
字段 [@th width:80px]
必填项 [@th width: 80px]
说明
备注
|- logo
| - 
| rdc文档的logo url地址
| -
|- keywords
| -
| rdc 文档的关键字
| -
|- url
| -
| rdc 文档地址
| -
|- userStyles
| -
| rdc 文档要引入的css文件
| 文件url数组
|- userScripts
| -
| rdc 文档 要引入的script文件
| 文件url 数组
```

##### render

```table
字段 [@th width:80px]
必填项 [@th width:80px]
说明
备注
|- includes 
| - 
| template模板中需要渲染的文件后缀数组 
| -
|- tags 
| - 
| template 模板使用mustache渲染的符号 
| 默认是{{ }}
|- validate 
| - 
| 验证函数，用于验证rda传入的render参数是否符合要求 
| 
|- mock 
| - 
| rdc 开发过程中 mock rda的render参数 
| 
```

##### mappings

> integrate 模式下，需要将app下的目录文件copy到对应的运行时目录下，这里填写的是映射关系

```table
字段 [@th width:80px]
必填项 [@th width:80px]
说明
备注
|- from 
| - 
| copy的源地址，基于rdc项目根目录 
| 例如： from: 'app/main.js'。可以是文件或目录地址
|- to 
| - 
| copy的目的地址，基于运行时目录 
| 例如：'src/main.js'，可以是文件或目录地址
|- options 
| - 
| copy过程的处理，
| 可参考[recursive-copy](https://www.npmjs.com/package/recursive-copy)的options
|- merge 
|
|
|
```

##### docker

```table
字段 [@th width:80px]
必填项 [@th width:80px]
说明
备注
|- tag 
| - 
| rdc docker镜像 tag 
| 例：rdebase/rdc-vue-start:0.0.1
|- ports 
| - 
| 容器映射到本地的端口号 
| 与Dockerfile中ports格式保持一致
```

##### nodeVesion

> 支持的node版本号

##### extensions

> 用于vscode-insiders的 默认开启插件列表，现可忽略

##### lint

```table
字段 [@th width:80px]
必填项 [@th width:80px]
说明
备注
|- ext 
| - 
| 需要lint的文件后缀数组 
| 例如：['.js', '.vue']
```

#### 完整示例

```javascript
module.exports = {
  framework: 'vue',
  docs: {
    url: 'https://rdepro.github.io/rdc-vue-starter/'
  },
  render: {
    includes: [
      '.html',
      '.js'
    ],
    mock: {
      title: 'title'
    }
  },
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
  docker: {
    tag: 'soonw/demo.rdc',
    ports: [
      '8080:8080'
    ]
  },
  lint: {
      ext: ['.js', '.vue']
  }
}
```

#### Typescript描述

```typescript
type Framework = 'vue' | 'regular' | 'react' | 'angular'
type Mode = 'integrate' | 'origin'

interface Docs {
  logo: string
  keywords: string[]
  url: string
  userStyles?: string[]
  userScripts?: string[]
}

interface Render {
  includes: string[],
  tags: string[],
  validate: ((dataView: any) => any)[],
  mock: {[key: string]: any}
}

interface Mapping {
  from: string
  to: string
  options?: any
  merge?: string
}

interface Docker {
  tag?: string
  ports?: string[]
}

interface RdcConf {
  extends: string
  mode: Mode
  framework: Framework
  docs: Docs
  render: Render
  mappings: Mapping[]
  docker: Docker,
  nodeVersion: string,
  extensions: string[],
  lint: {
    ext: string[]
  }
}

```
