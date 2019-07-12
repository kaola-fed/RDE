##### Error: No ESLint configuration found.

因为eslint是从lint的文件开始向上找配置，如过lint的是app目录下的文件，lint配置是在template目录下， 向上找是找不到的；这时候需要指定eslint的配置文件路径；可以通过类似下方的配置解决这种问题，找不到配置的问题解决方法都类似；如果配置很多，建议改用integrate模式；

```
const path = require('path');

const {resolve} = path;
module.exports = {
    chainWebpack(config) {
        config.module.rule('eslint').use('eslint-loader').tap((options = {}) => {
            options.configFile = resolve(__dirname, '.eslintrc.js');
            return options;
        });
    }
};
```


##### 如何在rdc.config.js中判断环境？根据不同环境配置不同的render值

请在执行rde命令前将对应的NODE_ENV设置好， rdc.config.js中可以直接使用process.env.NODE_ENV进行判断

##### 在js/ts等文件中使用mustache模板， eslint在parse时会报错，解析不通过

在这些文件中请不要使用mustache渲染，可以使用variables的方式获取配置
