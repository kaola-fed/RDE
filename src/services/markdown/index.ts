import * as hl from 'highlight.js'
import * as MarkdownIt from 'markdown-it'
import * as markdownMeta from 'markdown-it-meta'

import markdownComponent from './component'
import markdownTable from './table'

const mdIt = new MarkdownIt({
  highlight(str, lang) {
    if (lang && hl.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hl.highlight(lang, str, true).value +
          '</code></pre>'
      } catch (e) {
        if (e) {}
      }
    }

    return `<pre class="hljs"><code>${mdIt.utils.escapeHtml(str)}</code></pre>`
  }
})

mdIt.renderer.rules.heading_open = (tokens, idx) => {
  const token = tokens[idx]
  const {tag} = token
  return `<${tag} class="rde-${tag}">`
}

mdIt.renderer.rules.paragraph_open = (tokens, idx) => {
  const token = tokens[idx]
  const {tag} = token
  return `<${tag} class="rde-${tag}">`
}

mdIt.renderer.rules.link_open = (tokens, idx, _options, _env, slf) => {
  const token = tokens[idx]
  return `<a class="rde-a"${slf.renderAttrs(token)}>`
}

mdIt.use(markdownMeta)
mdIt.use(markdownTable)
mdIt.use(markdownComponent)

export default mdIt
