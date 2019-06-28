
import * as Card from '@zeit-ui/vue/lib/card.common'
import '@zeit-ui/vue/lib/card.css'
import * as Files from '@zeit-ui/vue/lib/files.common'
import '@zeit-ui/vue/lib/files.css'
import * as Link from '@zeit-ui/vue/lib/link.common'
import '@zeit-ui/vue/lib/link.css'
import * as Note from '@zeit-ui/vue/lib/note.common'
import '@zeit-ui/vue/lib/note.css'
import Vue from 'vue'

export default ({api}) => {
  Files.install(Vue)
  Link.install(Vue)
  Card.install(Vue)
  Note.install(Vue)

  api.page('pages/index').set('layout', 'none')
  api.page('pages/container').set('layout', 'none')
}
