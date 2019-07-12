# QuickStart

#### 安装依赖环境

* [Node](https://nodejs.org)
* [Docker](https://docs.docker.com/install/)

```shell
$ docker pull node
```

#### 安装RDE

```shell
$ npm i -g rde

$ yarn global add rde // if using yarn
```

#### 创建工程

RDA无法脱离RDC单独运行，实际在工作中，应该先确定好要使用的RDC，再创建工程，这里为了简化演示，直接使用了VueCli创建的一个最简单的RDC

```shell
$ rde create
```

1. 填写要创建的工程名
1. 选择创建类型为Application
1. 选择要创建的工程的框架
1. 为了体验，容器和容器版本选择默认即可

#### 开始探索

创建成功后，可以开始探索了，先切换到工程目录后，发现生成了：
```table
文件 [@th width:70px]
类型 [@th width:30px;]
说明 [@th width:300px;]
IDE显示
GITIGNORE
sync覆盖
RDA关注
|- app
| 目录
| 初始的业务代码目录
| ●
| -
| -
| ●
|- template
| 目录
| 从镜像中拷贝出来的，供本地开发使用的配置文件及其他文件
| -
| ●
| ●
| -
|- rda.config.js
| 文件
| RDA配置文件
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
|- .devcontainer
| 目录
| 提供给vscode-insiders体验的配置
| - 
| ●
| ●
| -
|- node_modules
| 目录
| 根据容器要求安装的node_modules
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

其中这里我们要关注的只有app目录和rda.config.js，其他文件都是为了本地开发使用，从镜像中复制出来的，已经添加在gitignore中， 不允许修改，具体解释如下：

1. IDE显示：在vscode或者webstorm中开发时，是否显示该目录
1. GITIGNORE: 默认已经加在gitignore中的规则
1. sync覆盖： 执行rde sync时会被覆盖的文件
1. RDA关注: 开发业务应用需要关注的文件

接下来执行:
```shell
$ rde clean
```

会删除除了应用需要关注的目录外的所有文件；如果要还原，可以再执行

```shell
$ rde sync
```

又还原出了所有的文件，sync可以在每次升级容器版本、误删除某些文件的情况下使用；

使用vscode或者webstorm打开工程，可以发现默认只能看到app, rda.config.js等几个文件，因为RDE已经帮你生成了初始配置，隐藏了不需要关注的文件；
另外，如果你使用的是[vscode-insiders](https://code.visualstudio.com/insiders/)或者最新版的vscode，在使用rde clean后就可以进行开发了，直接打开container即可；由于vscode-insiders不是稳定版本，所以只作为测试体验功能使用，不推荐；

