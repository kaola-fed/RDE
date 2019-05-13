```bash
$ npm run dev
```


```component_vue
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
```



```api
drop(array, [n=1])
this is a desc paragraph

@param {array} [array=list] - this is an array
@param {array} [array=list] - this is an array
@returns {number} - the dot's width

examples:

drop(1144) // 123
drop(234) // 234
```
