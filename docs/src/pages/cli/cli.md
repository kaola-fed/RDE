#### 创建工程

> Create

```shell
$ rde create [NAME]

ARGUMENTS
  NAME  project name to create， optional
```

创建一个新的工程，可以选择创建的工程类型Application/Container；

> Sync

```shell
$ rde sync
```

使用场景：

* 第一次从git拉取别人创建的RDA/RDC工程后， 需要先执行rde sync后才可以进行开发
* 每次升级了rda.config.js中的container的tag版本后，需要先本地同步下

* 误操作删除了template、.cache或者IDE配置等后，可以执行还原

* 如果是RDA工程，本地对非app目录进行了修改，想直接还原，可以执行

#### 开发运行

> Build

```shell
$ rde build
$ rde run build

OPTIONS
  -r, --rebuild              rebuild image before run
```

如果RDC的scripts中提供了build脚本，可以运行rde build或者rde run build进行工程构建，如果需要重新构建镜像，可以后面带一个-r参数

> Serve

```shell
$ rde serve
$ rde run serve

OPTIONS
  -r, --rebuild              rebuild image before run
```

启动工程

> Lint

```shell
$ rde lint
$ rde run lint

OPTIONS
  -r, --rebuild              rebuild image before run
```

lint工程

> Run

```shell
$ rde run [CMD]

ARGUMENTS
  CMD  scripts provided by container

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -r, --rebuild        rebuild image before run
  -v, --verbose        show verbose logs
```

如果RDC开发提供了除了上面几个以外的script脚本，可以通过rde run \[CMD\]执行， 如果需要传额外的参数给script，可以配合-e使用，如

```shell
$ rde run test -e 'test.js'
```

#### 容器发布

> Publish

```shell
$ rde publish

OPTIONS
  -i, --increment=increment  Increment a version by the specified level.
                             Level can be one of: major, minor, patch, premajor, preminor,
                             prepatch, or prerelease.  Default level is 'patch'. Only one version may be
                             specified.
  -t, --tag=tag              as your image tag for pushing to docker hub, you should use increment just in case
  -v, --verbose              show verbose logs
  --preid=preid              Identifier to be used to prefix premajor, preminor, prepatch or prerelease version
                             increments.

EXAMPLES
  $ rde publish -t <semver-like version>
  $ rde publish -i prerelease --preid beta
  $ rde publish --preid beta
```

容器需要发布到docker hub，可以使用rde publish发布，它会校验工程基础配置，并自动生成发布需要的Dockerfile；参数与semver参数一致；

```
要特别注意：如果提供了一个已经发布过的tag，docker hub会覆盖原版本， 这个是危险的行为，请每次检查发布新的版本，一般情况下，请不要使用latest版本，因为每次都会被覆盖；
```

#### 其他

> Clean

```shell
$ rde clean
```

一般情况下不需要使用，保留下.devcontainer目录后，执行后可以体验下；

