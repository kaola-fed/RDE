import * as hljs from 'highlight.js'
import {parseComponent} from 'vue-template-compiler'

import conf from '../conf'

let prefix = 'component'
let frameworks = Object.keys(conf.frameworks)
let counter = 0

const getLine = (state, line) => {
  const pos = state.bMarks[line] + state.blkIndent
  const max = state.eMarks[line]
  return state.src.substr(pos, max - pos)
}

let boxCode = `
  <template>
    <div>
      <div class="rde-component">
        <div class="rde-component__example">
           <example></example>
        </div>
        <div class="rde-component__code" v-if="!collapse">
          <pre><code>__code__</code></pre>
        </div>
        <div class="rde-component-control">
          <a @click="collapse=!collapse"
            class="rde-component-control__collapse"
            href="javascript:;" v-html="collapse ? '显示代码' : '隐藏代码'">
          </a>
          <a class="rde-component-control__run"
               href="javascript:;">在线运行</a>
        </div>
      </div>
    </div>
  </template>

  <script>
    export default {
      data() {
        return {
          collapse: true,
        }
      }
    }
  </script>
`

export default mdIt => {
  const renderer = {
    vue(tokens, idx) {
      if (tokens[idx].nesting === 0) {
        const {content} = tokens[idx]
        let regexp = /export default \{([\s\S]*)\}/

        const SFC = parseComponent(content)
        let exampleScript = ''
        if (SFC.script) {
          const matches = SFC.script.content.match(regexp)
          exampleScript = matches.length > 1 ? matches[1] : ''
        }

        boxCode = boxCode.replace(/__code__/, hljs.highlightAuto(content, ['html', 'javascript']).value)
        const boxSFC = parseComponent(boxCode)
        const boxScript = boxSFC.script.content.match(regexp)[1]

        counter++

        return `
          <div id="example-${counter}"></div>
          <script>
            new Vue({
               template: \`${boxSFC.template.content.replace(/\`/gm, '\\`')}\`,
               components: {
                 example: {
                   template: \`<div>${SFC.template.content.replace(/\`/gm, '\\`')}</div>\`,
                   ${exampleScript}
                 }
               },
               ${boxScript}
            }).$mount('#example-${counter}')
          </script>
        `
      }
    },
  }

  mdIt.block.ruler.before('fence', `${prefix}_x`, function (state, startLine) {
    const startLineEndPos = state.eMarks[startLine]
    // match string after ```
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const marker = state.src.slice(pos + 3, startLineEndPos)

    let token = null

    if (marker === 'component_vue') {
      token = state.push(`${prefix}_vue`, 'div', 0)

      let ruleEndLine = startLine
      do {
        ruleEndLine++
      } while (getLine(state, ruleEndLine).trim() !== '```')
      token.content = state.src.slice(state.bMarks[startLine + 1], state.bMarks[ruleEndLine])

      state.line = ruleEndLine + 2
      return true
    }

    if (marker === 'component_react') {
      return true
    }

    return false
  })

  frameworks.forEach(framework => {
    mdIt.renderer.rules[`${prefix}_${framework}`] = renderer[framework]
  })
}
