# QuickStart

#### 

#### 安装依赖环境

* [Node](https://nodejs.org)
* [Docker](https://docs.docker.com/install/)

```
$ docker pull node
```

#### 安装RDE

```
$ npm i -g rde
$ yarn global add rde // if using yarn
```

#### 登陆Docker Hub，并创建Public仓库

> [https://hub.docker.com/](https://hub.docker.com/) 创建并记录创建的仓库名称

#### 

#### 创建工程

```
$ rde create
```
* 填写要创建的工程名
* 选择创建类型为Container
* 选择要创建的工程的框架
* 容器填写上一步docker hub上创建的仓库名称（scope/name），如rdebase/rdc-vue-starter

#### 开始探索

&emsp;&emsp;创建成功后，可以开始探索了，先切换到工程目录后，发现生成了：

```table
文件 [@th width:70px]
类型 [@th width:30px;]
说明 [@th width:300px;]
IDE显示
GITIGNORE
sync覆盖
RDC关注
|- app
| 目录
| app目录会作为创建业务应用的初始目录拷贝出去，请将你定义的目录规范体现到app目录的结构中；
| ●
| -
| -
| ●
|- template
| 目录
| 从starter工程拷贝出来的一些文件，供体验使用，正式开发前请全部删除
| ●
| -
| -
| ●
|- rdc.config.js
| 文件
| RDC配置文件
| ●
| -
| -
| ●
|- .git
| 目录
| 生成了precommit钩子和commit-msg校验
| -
| ●
| only hooks
| -
|- gitignore
| 文件
| 包括初始规则的文件
| ●
| -
| -
| ●
|- .vscode/.idea
| 目录
| 编辑器初始配置文件
| -
| ●
| ●
| -
|- node_modules
| 目录
| starter工程依赖的node_modules，供体验使用，正式开发请删除
| ● 
| ●
| -
| -
|- README.md
| 文件
| 自动生成的readme
| ● 
| -
| -
| ●
```

&emsp;&emsp;其中app和template目录是根据你在创建时选择的framework生成的starter工程，你可以删除里面的全部文件，在里面根据规范重新填写需要的内容；

&emsp;&emsp;下面举一个例子，使用vue-cli搭建一个RDC，步骤如下：

* 【重置目录】清空app目录、template目录、删除node\_modules目录

* 【创建脚手架】在template目录下执行如下命令

```shell
$ vue create app

选择default preset
创建好后将创建工程的文件全部移动到template目录下面，node_modules移动到项目最外层，与template同级
```

* 【评估架构】考虑好哪些部分是要提供给业务应用开发的，哪些是RDC需要维护的
```
将要给业务应用开发使用的目录拖动到app目录下，例如如果你选择的是vue-cli的default preset，
那么可以将components目录和App.vue拖到app去，注意：具体拖动哪些目录需要开发RDC的开发维护者根据实际情况考虑；
```

* 这样初始目录就完成了

* 【选择模式】RDC支持两种开发模式：origin模式和integrate模式，请参考文档，这里为了简化演示，使用integrate模式

```
打开rdc.config.js， 新增mode属性为‘integrate’
```

* 【修改配置】打开rdc.config.js, 修改mappings为

```javascript
module.exports = {
  mappings: [{
      from: 'app/App.vue',
      to: 'src/App.vue',
  }, {
      from: 'app/components',
      to: 'src/components',
  }]
} 
```
* 【测试运行】切换到项目根目录，运行，第一次会在镜像中安装node_modules比较慢，之后都会有缓存；

```shell
$ rde serve

浏览器打开localhost:8080即可看到效果
```

* 【发布】假设已经开发完成，这时候可以将RDC发布到docker hub上，使用如下命令
```shell
$ rde publish -t 0.0.1-alpha.1

执行该命令前，请先登陆docker hub
```

> 可以发现，开发RDC是主要麻烦在跑通app和template这种分离结构的配置上，但经过收敛，只需要最熟悉的人修改配置一次，就可以让所有使用的人快速、轻易的使用到新的功能；目前支持的两种模式都不是最完美的，后续如果发现了更好的模式，也会引入进来，提升开发RDC的体验；开发RDC前建议先评估下实现app和template这种目录结构，是否通过简单的配置即可，如果是建议直接使用origin模式，否则使用integrate模式；
