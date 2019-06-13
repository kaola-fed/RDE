# QuickStart

#### 准备工作
&emsp;&emsp;如果本地没有_docs目录，在项目根目录执行:
```shell
$ rde docs:init
```

&emsp;&emsp;生成目录如下：
```table
文件/目录 [@th width:80px]
说明
|- _docs
| 文档目录
|- _docs/index.md
| 文档首页/关于页，请填写工程的基本介绍，该目录不可删除
|- _docs/faq.md
| 工程faq页，初始可以不填写信息，在之后维护过程中发现的问题可以记录在这里, 该目录不可删除
```

#### 开发文档
&emsp;&emsp;在_docs目录下新建需要的文档，在每个文档的开始，请填写meta信息，解释如下：
```markdown
---
title: 关于
subTitle: About
order: 12
category: Components
categoryOrder: 10
---
```

```table
字段 [@th width:80px]
默认值 [@th width:80px]
说明
|- title
| -
| 文档在sidebar展示的名称
|- subTitle
| -
| 文档在sidebar展示的子名称
|- order
| 0
| 文档在sidebar展示的顺序, order值越大，越靠前
|- category
| -
| 如果是有子目录，则在子目录下的文件需要填写category分类
|- categoryOrder
| -
| 如果是有子目录，在子目录下任意文件配置categoryOrder会作为父目录的order排序
```

> RDE目前仅支持一级目录，也就是说最多在_docs目录下新建一级目录作为category分类，否则会被忽略；

#### 开发预览
```shell
$ rde docs:serve
```

运行如上命令，可以边修改文档内容，边在浏览器预览

#### 发布文档到github gh-pages
```shell
$ rde docs:publish
```

&emsp;&emsp;发布前，请确保工程的github上有gh-pages分支，发布完成后，可以登陆github gh-pages的链接，查看效果

> 最后， 请不要忘记，将文档的链接填写到rdc.config.js或者rda.config.js对应的位置上，方便使用者查看
