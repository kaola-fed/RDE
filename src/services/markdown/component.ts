import * as deasync from 'deasync'
import * as Vue from 'vue'
import {createRenderer} from 'vue-server-renderer'
import {parseComponent} from 'vue-template-compiler'

import conf from '../conf'

const vueRenderer = createRenderer()
let prefix = 'component'
let frameworks = Object.keys(conf.frameworks)

const codeBoxCode = `
  <template>
    <div>
      <div class="rde-component">
        <div class="rde-component__example" @click="test">
           <example></example>
        </div>
        <div class="rde-component__code" v-if="!collapse">
         __code__
        </div>
        <div class="rde-component-control">
          <a @click="collapse=false"
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
          collapse: false,
        }
      },
      methods: {
        test() {
          alert(123)
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
        const SFC = parseComponent(content)
        let example: any = {}
        if (SFC.script) {
          // tslint:disable
          example = eval(SFC.script.content.replace('export default', 'example = '))
          // tslint:enable
          example.template = `<div>${SFC.template.content}</div>`
        }

        const codeBoxSFC = parseComponent(codeBoxCode)
        let codebox: any = {}
        // tslint:disable
        codebox = eval(codeBoxSFC.script.content.replace('export default', 'codebox = '))
        // tslint:enable
        codebox.template = codeBoxSFC.template.content
        codebox.components = {
          example,
        }

        // @ts-ignore
        const component = new Vue(codebox)
        const renderToString = deasync(vueRenderer.renderToString)
        return renderToString(component)
      }
    },
  }

  mdIt.block.ruler.before('fence', `${prefix}_x`, function (state, startLine, endLine) {
    const startLineEndPos = state.eMarks[startLine]
    // match string after ```
    const marker = state.src.slice(3, startLineEndPos)

    let token = null

    if (marker === 'component_vue') {
      token = state.push(`${prefix}_vue`, 'div', 0)
      token.content = state.src.slice(state.bMarks[1], state.bMarks[endLine - 1])
    }

    if (marker === 'component_react') {}

    state.line = endLine + 1
    return true
  })

  frameworks.forEach(framework => {
    mdIt.renderer.rules[`${prefix}_${framework}`] = renderer[framework]
  })
}
