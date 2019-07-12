#### RDC 配置说明
##### framework

创建工程时，指定工程的框架，根据不同的类型会提示不同的初始RDC。可选值有：

- 可选值：`vue` | `regular` | `react`

##### mode

> 根据选择mode的不同，工程运行时会在Docker中生成不同的目录结构。

- 可选值：`integrate` | `origin`， 默认`integrate`
- 具体说明可参考[模式选择](/RDE/rdc/modes.html)

##### render

```table
字段 [@th width:80px]
必填项 [@th width:80px]
说明
备注
|- includes 
| ●
| template模板中需要渲染的文件后缀数组 
| 例如: ['.js', '.css']
|- tags 
| ●
| template 模板使用mustache渲染的符号 
| 默认是{{ }}
|- validate 
| - 
| 验证函数，用于验证RDA传入的render参数是否符合要求 
| 
|- mock 
| - 
| RDC开发过程中mock RDA的render参数 
| 
```

##### variables

与render中的mock一样，mock用于测试RDA传入的render参数 variables可用于测试RDA传入的variables参数；需要注意的是如果包含函数，则只支持以下两种写法：
```javascript
{
  fn1: () => {},  // 支持
  fn2: function {}, // 支持
  fn() {}, // 不支持
}
```

##### docker

```table
字段 [@th width:80px]
必填项 [@th width:80px]
说明
备注
|- tag 
| ● 
| rdc docker镜像 tag 
| 例如：rdebase/rdc-vue-start:0.0.1
|- ports 
| ● 
| 容器映射到本地的端口号 
| 与Dockerfile中ports格式保持一致
```

##### lint

```table
字段 [@th width:80px]
必填项 [@th width:80px]
说明
备注
|- ext 
| ● 
| 需要lint的文件后缀数组 
| 例如：['.js', '.vue']
```

##### 【可选属性】mappings

> integrate 模式下，需要将app下的目录文件copy到对应的运行时目录下，这里填写的是映射关系

```table
字段 [@th width:80px]
必填项 [@th width:80px]
说明
备注
|- from 
| ● 
| copy的源地址，基于RDA中项目根目录 
| 例如： from: 'app/main.js'。可以是文件或目录地址
|- to 
| ● 
| copy的目的地址，基于运行时目录，可对照template填写 
| 例如：'src/main.js'，可以是文件或目录地址
|- options 
| - 
| copy选项
| 可参考 [recursive-copy](https://www.npmjs.com/package/recursive-copy) 的options
|- merge 
|
|
|
```

##### 【可选属性】nodeVesion

支持的node版本号

##### 【可选属性】docs

```table
字段 [@th width:80px]
必填项 [@th width: 80px]
说明
备注
|- title
| - 
| 文档的title名称
| -
|- keywords
| -
| 文档的关键字
| -
|- url
| -
| 文档地址, 发布到github pages后会作为整个站点的baseUrl使用，所有nav路径都会将这个url作为prefix
| -
|- userStyles
| -
| 文档要引入的css文件
| 文件url数组
|- userScripts
| -
| 文档 要引入的script文件
| 文件url 数组
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
  variables: {
    fn: () => {
      return 'some config';
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
    tag: 'rdebase/rdc-nut:0.0.1-alpha.7',
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
type Framework = 'vue' | 'regular' | 'react'
type Mode = 'integrate' | 'origin'

interface Docs {
  title?: string
  keywords?: string[]
  url?: string
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
  render: Render
  variables: {[key: string]: any}
  docker: Docker,
  lint: {
      ext: string[]
  }
  mappings?: Mapping[]
  nodeVersion?: string,
  docs?: Docs
}

```
