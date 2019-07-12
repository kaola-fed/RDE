#### RDC 模式选择

RDA应用在Docker中基于选择的RDC镜像运行。RDE工具会将RDC镜像中的template目录与RDA应用的app目录业务代码整合到一起，RDC模式选择就是整合方式的选择，我们提供了两种整合方式：`integrate` 和 `origin`，默认是 `integrate`。

#### integrate 模式

在Docker中会生成.integrate目录。app和template将会根据rdc.config.js中的mappings配置，合并到.integrate目录下，形成完整的运行时目录。npm run serve 命令实际运行在此目录下。

##### 举例说明

##### 本地RDA应用的目录结构

```
app
   |- components/
   |- App.vue
rda.config.js
```

##### RDC镜像目录结构

```
app
template
    |- public/
    |- src/
    |     |- main.js
    |- package.json
rdc.config.js
```

##### 若在rdc.config.js中配置mappings为：
```
 mappings: [{
      from: 'app/App.vue',
      to: 'src/App.vue'
 }, {
      from: 'app/components',
      to: 'src/components'
 }],
```

##### 则在Docker中会生成如下结构的.integrate目录

```
app/
template/
node_moduels/
.integrate/
    |- public/
    |- src/
    |   |- components/
    |   |- App.vue
    |   |- main.js
    |- package.json
```

下图展示了在RDA应用中执行`rde lint`命令时，内部执行的逻辑；
1. 首先，会将本地的app目录和rda.config.js文件，mount到Docker容器中
2. 在Docker容器中，会先渲染template目录到.integrate目录
3. 然后，按照rdc.config.js中配置的mappings属性，将app目录中对应的文件拷贝到.integrate目录的对应位置
4. 最后， 在.integrate目录下执行`npm run lint`

![image](https://haitao.nos.netease.com/34469a3b-e541-4d5e-b1b2-87b967c7b502_860_589.png)

#### orgin 模式

与integrate模式的不同在于， Docker中运行时，不会合并app和template目录，只是渲染template目录为runtime目录，后直接在runtime目录下执行`npm run script, 如果你评估后认为配置webpack支持这样的目录结构成本较低的情况下，可以使用这种模式；

##### 举例说明

假设RDA应用目录结构、RDC工程目录结构以及rdc.config.js中mapping的配置和之前一致；

##### 则实际ocker中目录结构如下：
```
app/
template/
node_moduels/
runtime/
   |- public/
   |- src/
   |   |- main.js
   |- package.json
```

下图展示了在RDA应用中执行`rde lint`命令时，内部执行的逻辑；
1. 首先，会将本地的app目录和rda.config.js文件，mount到Docker容器中
1. 在Docker容器中，会先渲染template目录到runtime目录
1. 最后， 在runtime目录下执行`npm run lint`

![image](https://haitao.nos.netease.com/87cb27d8-e239-42ae-94b5-b179bf61f715_860_589.png)

在`origin`模式下，`npm run lint`命令运行在runtime目录下，runtime下直接引用外层app目录下代码，需要RDC开发者合理的配置webapck、eslint-loader、ts-loader等。

