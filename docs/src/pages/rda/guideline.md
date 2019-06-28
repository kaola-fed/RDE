
#### 开发RDA请遵循以下约定

* 请不要删减.gitignore文件中已经存在的规则，可以新增规则
* 除了app和rda.config.js配置文件，其他文件修改了会被覆盖，一般情况下不要修改，如果修改了请通过rde sync命令还原；
* RDE在创建工程时，已经生成了pre-commit和commit-msg钩子，请直接使用，msg规则参考[validate-commit-msg](https://www.npmjs.com/package/validate-commit-msg)默认值
