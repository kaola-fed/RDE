#### Error: No ESLint configuration found.

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
