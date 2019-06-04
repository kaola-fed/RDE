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

#### 完整示例
```javascript
module.exports = {
  container: {
    name: 'rdebase/rdc-vue-starter:0.0.1-alpha.1',
    docs: 'https://github.com/RdePro/rdc-vue-starter',
    render: {
      title: 'RDE应用',
      appKey: 'MA-73249C84DEFE23',
    }
  },
  docker: {
    ports: ['8080:9000']
  }
}
```

####  Typescript描述
```typescript
interface RdaConf {
  container: Container,
  docker: Docker,
}

interface Container {
  name: string,
  docs?: string,
  render?: { [key: string]: any }
}

interface Docker {
  ports?: string[]
}
```
