
#### 开发RDA请遵循以下约定

1. 请不要删减.gitignore文件中已经存在的规则，可以新增规则
1. 除了app和rda.config.js配置文件，其他文件修改了会被覆盖，一般情况下不要修改，如果修改了请通过rde sync命令还原；
1. RDE在创建工程时，已经生成了pre-commit和commit-msg钩子，请直接使用，msg规则参考[validate-commit-msg](https://www.npmjs.com/package/validate-commit-msg)默认值
1. 请按照对应的RDC定义的规范和文档进行开发，避免自行修改RDC已经提供的功能；如果有需求，可以让RDC完善后直接使用；
1. 在升级RDC版本时，请先确保充分了解RDC升级带来的变化，并对相应的改动点进行充分测试；
