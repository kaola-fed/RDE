const defaultOpt = {
  lineBreak: '', // \n
  indent: 2,
}

export default (mdIt, opt) => {
  opt = {...defaultOpt, ...opt}
  let renderType = null // 0: th，1: 换行td(|- ), 2: 普通td(| )

  mdIt.renderer.rules.table_open = function () {
    return '<table class="rde-table">\n'
  }
  mdIt.renderer.rules.table_close = function () {
    return '</table>\n'
  }

  mdIt.renderer.rules.line_break = () => {
    return opt.lineBreak
  }

  mdIt.renderer.rules.indent_space = () => {
    return Array(opt.indent + 1).join(' ')
  }

  mdIt.block.ruler.at('table', function (state, startLine, _endLine, _silent) {
    function getLine(state, line) {
      const pos = state.bMarks[line] + state.blkIndent
      const max = state.eMarks[line]
      return state.src.substr(pos, max - pos)
    }

    function pushToken(token, state, tag) {
      token = state.push('indent_space')
      token = state.push(tag + '_open', tag, 1)
      token = state.push('inline', '', 0)
      token.content = content
      // token.map = [startLine, startLine + 1]
      token.children = []
    }

    let token
    let nextLine
    let lineText
    let content

    // if (startLine + 2 > endLine) {
    //   return false
    // }

    const startLineEndPos = state.eMarks[startLine]
    // match string after ```
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const marker = state.src.slice(pos + 3, startLineEndPos)

    if (marker !== 'table') {
      return false
    }

    let ruleEndLine = startLine
    do {
      ++ruleEndLine
    } while (getLine(state, ruleEndLine).trim() !== '```')

    // nextLine = startLine + 1

    token = state.push('line_break')
    // token.map = [startLine, 0]

    for (nextLine = startLine + 1; nextLine <= ruleEndLine; nextLine++) {
      lineText = getLine(state, nextLine).trim()
      // renderType: 0: th，1: 换行td(|- ), 2: 普通td(| )
      if (renderType === null) { // 开始渲染表格
        token = state.push('table_open', 'table', 1)
        token = state.push('tr_open', 'tr', 1)
      }

      if (lineText === '```') { // 结束渲染表格
        if (renderType === 2) {
          token = state.push('td_close', 'td', -1)
        }
        token = state.push('tr_close', 'tr', -1)
        token = state.push('table_close', 'table', -1)
        renderType = null
        return false
      }

      if (/^\|-|\|-$/g.test(lineText)) {
        if (renderType === 0) { // 结束渲染th
          token = state.push('th_close', 'th', -1)
          token = state.push('tr_close', 'tr', -1)
        }
        if (renderType === 1) { // 结束渲染换行td
          token = state.push('td_close', 'td', -1)
          token = state.push('tr_close', 'tr', -1)
        }
        if (renderType === 2) { // 结束渲染普通td
          token = state.push('td_close', 'td', -1)
        }
        renderType = 1 // 渲染换行td
      } else if (/^\||\|$/g.test(lineText)) {
        if (renderType === 0) {
          throw new Error('th后不能写普通td')
        }
        token = state.push('td_close', 'td', -1) // renderType为1或2
        renderType = 2 // 渲染普通td
      } else {
        if ([1, 2].includes(renderType)) {
          throw new Error('th应写在td前面')
        }
        token = state.push('th_close', 'th', -1) // renderType为0
        renderType = 0 // 渲染th
      }

      // token.map = [startLine + 2, 0]

      if (renderType === 0) {
        content = lineText
        pushToken(token, state, 'th')
      } else if (renderType === 1) {
        content = lineText.replace(/^\|-\s|\|-$/g, '')
        token = state.push('tr_open', 'tr', 1)
        pushToken(token, state, 'td')
      } else if (renderType === 2) {
        content = lineText.replace(/^\|\s|\|$/g, '')
        pushToken(token, state, 'td')
      }

    }

    // state.line = nextLine
    // return true

    state.line = ruleEndLine + 2
    return true

  })

}
