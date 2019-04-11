import * as mustache from 'mustache'

let tags = ['{{', '}}']

export default {
  setTags(custom: string[]) {
    if (custom) {
      tags = custom
    }
  },

  render(template: string, dataView: any) {
    return mustache.render(template, dataView, tags)
  },
}
