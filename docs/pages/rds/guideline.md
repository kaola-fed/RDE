#### 开发RDC请遵循以下约定

* RDS用于提取项目中公用组件、mixin、directive、filter以及公用方法。
* RDS开发完成后，请以npm包的形式发布
* RDS需要export install方法，用于在应用中使用的时候提供注册功能。

#### 在RDA中使用RDS步骤
1. 请先确保使用的RDC支持suites配置，如果不支持请联系对应的RDC开发加入配置
1. 在app目录下的package.json安装对应的RDS
1. 在rda.config.js的suites属性中，配置对应的属性，如：
```javascript
module.exports = {
  suites: [{
    name: 'rds-vue',
    framework: 'vue'
  }]
}
```
请注意framework必填,具体值请参考[RDA配置说明](https://kaola-fed.github.io/RDE/rda/config.html)

#### 在RDC中支持RDS配置
&emsp;&emsp;RDA配置的suites属性在渲染RDC的template目录时，会将suites属性按照framework拆分为vueSuites/regularSuites/reactSuites等，并加入到render的dataView中；RDC如果要支持RDS，请在页面入口的位置加入如下代码：
```
{{#vueSuites}}
import {{alias}} from '{{name}}'
{{alias}}.install(Vue)
{{/vueSuites}}

模板的tag标签，请以rdc配置里设置的为准； 
```

&emsp;&emsp;RDC会在引用的地方将对应的Vue/React/Regular对象传入install方法，install方法可以在在实现时，使用Vue的全局方法将一些filter等注册上去；
