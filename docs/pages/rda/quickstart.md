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

#### 创建工程

```
$ rde create
```

第一步填写要创建的工程名，然后选择创建类型为Application，容器和容器版本使用默认即可；

#### 开始探索

创建成功后，可以开始探索了，先切换到工程目录后，发现生成了：

* 初始的app目录
* template目录
* rda.config.js配置文件
* gitignore文件和.git目录（生成了precommit钩子和commit-msg校验）
* 编辑器配置文件
* README.md
* .devcontainer目录，使用vscode-insiders版本的开发可以直接使用
* 安装的node\_modules目录

其中这里我们要关注的只有app目录和rda.config.js，其他文件都是为了本地开发使用，从镜像中复制出来的，已经添加在gitignore中， 不允许修改的，现在执行:

```
$ rde clean
```

会删除除了应用需要关注的目录外的所有文件；如果要还原，可以再执行

```
$ rde sync
```

又还原出了所有的文件，sync可以再每次升级容器版本、误删除某些文件的情况下使用；

使用vscode或者webstorm打开工程，可以发现默认只能看到app, rda.config.js等几个文件，因为RDE已经帮你生成了初始配置，隐藏了不需要关注的文件；

另外，如果你使用的是[vscode-insiders](https://code.visualstudio.com/insiders/)，在使用rde clean后就可以进行开发了，直接打开container即可；由于vscode-insiders不是稳定版本，所以只作为测试体验功能使用，不推荐；

