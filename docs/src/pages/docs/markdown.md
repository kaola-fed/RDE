# Markdown扩展语法

#### Component展示
![](https://haitao.nos.netease.com/2c2ebe3c-acf9-4c7a-8f6a-7586c888c07f_1099_632.png)

&emsp;&emsp;使用component_vue/component_react/component_regular包裹代码即可实现如上图常见的组件展示; 目前只实现了Vue，示例如下：

```markdown
\`\`\`component_vue
<template>
    <el-radio v-model="radio" label="1">备选项</el-radio>
    <el-radio v-model="radio" label="2">备选项</el-radio>
</template>

<script>
  export default {
    data () {
      return {
        radio: 1,
        test: `this is a test`
      };
    }
  }
</script>
\`\`\`

请去除前面的\
```

#### API展示
![](https://haitao.nos.netease.com/cbacb476-78c5-4e60-bbdf-c2a9d33f458a_1215_639.png)

&emsp;&emsp;示例代码如下：
```markdown
\`\`\`api
drop(array, [n=1])
this is a desc paragraph

@param {array} [array=list] - this is an array
@param {array} [array=list] - this is an array
@returns {number} - the dot's width

examples:

drop(1144) // 123
drop(234) // 234
\`\`\`

请去除前面的\
```

#### Table展示
![](https://haitao.nos.netease.com/777152d6-0e3d-432e-8120-dcab3ec63698_1013_554.png)

&emsp;&emsp;示例代码如下：
```markdown
\`\`\`table
字段 [@th width:80px]
必填项 [@th width:80px]
说明
备注
|- tag 
| - 
| rdc docker镜像 tag 
| 例：rdebase/rdc-vue-start:0.0.1
|- ports 
| - 
| 容器映射到本地的端口号 
| 与Dockerfile中ports格式保持一致
\`\`\`

请去除前面的\
```

* 开始是th头，每个th头支持设置style，style格式与html的style格式一致，多个用分号间隔；
* 每行以|-开始，之后每一行对应这行的每一列数据, 请注意每行前需要有|字符
* 请注意不支持换行，以及空行
