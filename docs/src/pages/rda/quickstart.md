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

```shell
$ rde create
```

* 填写要创建的工程名
* 选择创建类型为Application
* 选择要创建的工程的框架
* 为了体验，容器和容器版本选择默认即可

#### 开始探索

&emsp;&emsp;创建成功后，可以开始探索了，先切换到工程目录后，发现生成了：
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

&emsp;&emsp;其中这里我们要关注的只有app目录和rda.config.js，其他文件都是为了本地开发使用，从镜像中复制出来的，已经添加在gitignore中， 不允许修改的，具体解释如下：

* IDE显示：在vscode或者webstorm中开发时，是否显示该目录
* GITIGNORE: 默认已经加在gitignore中的规则
* sync覆盖： 执行rde sync时会被覆盖的文件
* RDA关注: 开发业务应用需要关注的文件

&emsp;&emsp;接下来执行:
```shell
$ rde clean
```

&emsp;&emsp;会删除除了应用需要关注的目录外的所有文件；如果要还原，可以再执行

```shell
$ rde sync
```

&emsp;&emsp;又还原出了所有的文件，sync可以再每次升级容器版本、误删除某些文件的情况下使用；

&emsp;&emsp;使用vscode或者webstorm打开工程，可以发现默认只能看到app, rda.config.js等几个文件，因为RDE已经帮你生成了初始配置，隐藏了不需要关注的文件；
另外，如果你使用的是[vscode-insiders](https://code.visualstudio.com/insiders/)，在使用rde clean后就可以进行开发了，直接打开container即可；由于vscode-insiders不是稳定版本，所以只作为测试体验功能使用，不推荐；

