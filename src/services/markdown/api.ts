import * as hljs from 'highlight.js'

let prefix = 'api'

const getLine = (state, line) => {
  const pos = state.bMarks[line] + state.blkIndent
  const max = state.eMarks[line]
  return state.src.substr(pos, max - pos)
}

export default mdIt => {
  const renderer = {
    api(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '<div id="rde-api">'
      } else if (tokens[idx].nesting === -1) {
        return '</div>'
      }
    },
    'api-title': (tokens, idx) => {
      const {content} = tokens[idx]
      return `<p class="rde-api__tt">${content}</p>`
    },
    'api-desc': (tokens, idx) => {
      const {content} = tokens[idx]
      return `<p class="rde-api__desc">${content}</p>`
    },
    'api-params': (tokens, idx) => {
      const {content: list = []} = tokens[idx]

      let table = `
          <p class="rde-api__subtt">Parameters</p>
          <table class="rde-table">
            <thead>
            <tr>
            <th>名称</th>
            <th>类型</th>
            <th>默认值</th>
            <th>描述</th>
            </tr>
            </thead>
            <tbody>
      `
      list.forEach(item => {
        table += `
          <tr>
            <td>${item.name || '-'}</td>
            <td>${item.type || '-'}</td>
            <td>${item.defaultValue || '-'}</td>
            <td>${item.desc || '-'}</td>
          </tr>
        `
      })
      table += '</tbody></table>'

      return table
    },
    'api-returns': (tokens, idx) => {
      const {content = {}} = tokens[idx]

      return `
          <p class="rde-api__subtt">Returns</p>
          <table class="rde-table">
            <thead>
            <tr>
            <th>类型</th>
            <th>描述</th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>${content.type || '-'}</td>
            <td>${content.desc || '-'}</td>
            </tr>
            </tbody>
          </table>
      `
    },
    'api-examples': (tokens, idx) => {
      const {content} = tokens[idx]
      return `
        <p class="rde-api__subtt">Examples</p>
        <pre><code>
        ${hljs.highlightAuto(content, ['javascript']).value}
        </code></pre>
      `
    },
  }

  mdIt.block.ruler.before('fence', `${prefix}`, function (state, startLine) {
    const startLineEndPos = state.eMarks[startLine]
    // match string after ```
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const marker = state.src.slice(pos + 3, startLineEndPos)

    let token = null
    let nextLine = startLine

    if (marker === prefix) {
      let ruleEndLine = startLine
      do {
        ++ruleEndLine
      } while (getLine(state, ruleEndLine).trim() !== '```')

      token = state.push('api', 'div', 1)
      nextLine++

      const api = getLine(state, nextLine)
      token = state.push('api-title', 'p', 0)
      token.content = api
      nextLine++

      let desc = ''
      let line = getLine(state, nextLine).trim()
      while (line.length !== 0) {
        desc += line
        nextLine++
        line = getLine(state, nextLine).trim()
      }
      token = state.push('api-desc', 'p', 0)
      token.content = desc

      line = getLine(state, nextLine).trim()
      while (line.length === 0) {
        nextLine++
        line = getLine(state, nextLine).trim()
      }

      let params = []
      line = getLine(state, nextLine).trim()
      while (/^@param/.test(line)) {
        const nameArr = /\[(.*)\]/.exec(line)[1].split('=')

        params.push({
          name: nameArr[0],
          type: /\{(\S+)\}/.exec(line)[1],
          defaultValue: nameArr[1],
          desc: /-\s*(.+)/.exec(line)[1],
        })
        nextLine++
        line = getLine(state, nextLine).trim()
      }
      token = state.push('api-params', 'div', 0)
      token.content = params

      let returns = {}
      line = getLine(state, nextLine).trim()
      if (/^@returns/.test(line)) {
        returns = {
          type: /\{(\S+)\}/.exec(line)[1],
          desc: /-\s*(.+)/.exec(line)[1],
        }
      }
      token = state.push('api-returns', 'div', 0)
      token.content = returns
      nextLine++

      line = getLine(state, nextLine).trim()
      while (line.length === 0) {
        nextLine++
        line = getLine(state, nextLine).trim()
      }

      line = getLine(state, nextLine).trim()
      if (/^examples:/.test(line)) {
        nextLine++
        const pos = state.bMarks[nextLine] + state.blkIndent
        const examples = state.src.slice(pos, state.bMarks[ruleEndLine])

        token = state.push('api-examples', 'div', 0)
        token.content = examples
      }
      token = state.push('api', 'div', -1)

      state.line = ruleEndLine + 2
      return true
    }

    return false
  })

  mdIt.renderer.rules.api = renderer.api
  mdIt.renderer.rules['api-title'] = renderer['api-title']
  mdIt.renderer.rules['api-desc'] = renderer['api-desc']
  mdIt.renderer.rules['api-params'] = renderer['api-params']
  mdIt.renderer.rules['api-returns'] = renderer['api-returns']
  mdIt.renderer.rules['api-examples'] = renderer['api-examples']
}
