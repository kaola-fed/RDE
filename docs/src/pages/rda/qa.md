
#### 提示 Unrecognized application project, please use `$ rde create` to create one
在当前目录没有找到rda.config.js文件，请先确定执行目录是否正确


#### 如何排查问题
由于rde run执行的命令实际是在docker容器中执行的，这时候本地看不到当下执行的全部文件与环境情况；如果要排查，可以按照如下步骤执行：
* 运行rde serve启动容器
* 通过docker命令进入docker容器中排查，这里推荐使用[vscode-insiders](https://code.visualstudio.com/insiders/)
* 打开vscode-insiders后F1,找到attach to a container，选择对应的容器后
* 通过F1, open File，打开/home/rde目录，这时候你就可以看到运行时的全部文件了
* 你还可以通过vscode-insiders的terminal运行npm script，排查问题

> 常用docker命令可以参考：https://github.com/kaola-fed/RDE/wiki/docker-cheatsheet

#### windows如何安装Docker
可以参考[这个教程](https://www.runoob.com/docker/windows-docker-install.html)，另外推荐使用cmder或者更好用的终端，针对windows无法使用localhost访问访问的情况，请使用
```shell
$ docker-machine ip
```
输出的IP访问

#### RDC中已经定义了vue的d.ts文件，但是编辑器lint报错找不到.vue文件
为了保持工程清晰，我们在编辑器的配置中隐藏了template目录，编辑器可能完全忽略了这个目录，没有去读取template下的d.ts文件，所以报错，这时候可以手动打开下template下的d.ts；
