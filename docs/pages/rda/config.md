#### 配置说明
##### container
```table
字段 [@th width:80px]
必填项 [@th width:60px]
说明
备注
|- name
| ●
| 底层容器名称（docker-hub）与版本
| 应用请一定固定版本，请勿使用latest或者不写
|- docs
| -
| 底层容器的文档地址
| 可以记录在这里，方便查看
|- render
| -
| 底层容器依赖的渲染属性，容器会校验是否填写，否则会报错，具体属性请参照对应容器文档
| 容器在渲染模板时会根据传入的属性渲染
|- variables
| -
| 底层容器依赖的JS变量配置，具体配置请参照对应容器文档
| 这些变量配置后， 会提供给RDC内部使用, variables是对render的扩展，有一些场景render无法实现
```

##### 【可选属性】docker
```table
字段 [@th width:80px]
必填项 [@th width:60px]
说明
备注
|- ports
| -
| 如果想修改容器映射到本地的端口号，可以通过这里配置
| 与Dockerfile中的ports格式一致
```

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
| 文档地址
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
  container: {
    name: 'rdebase/rdc-vue-starter:0.0.1-alpha.1',
    docs: 'https://github.com/RdePro/rdc-vue-starter',
    render: {
      title: 'RDE应用',
      appKey: 'BC-73249C84DEFE23',
    },
    vairables: {
      fn: () => {
        return 'some config';
      }
    }
  },
  docker: {
    ports: ['8080:9000']
  },
  docs: {
    title: 'App',
  },
}
```

####  Typescript描述
```typescript
interface RdaConf {
  container: Container,
  docker: Docker,
  docs: Docs,
}

interface Container {
  name: string,
  docs?: string,
  render?: { [key: string]: any },
  variables?: { [key: string]: any }
}

interface Docker {
  ports?: string[]
}

interface Docs {
  title?: string
  keywords?: string[]
  url?: string
  userStyles?: string[]
  userScripts?: string[]
}
```
