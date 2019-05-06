import conf from './conf'

export default {
  getMappings() {
    const rdcConf: RdcConf = conf.getRdcConf('.')
    return rdcConf.mappings
  },

  from2Dest(filePath) {
    const mappings = this.getMappings()
    mappings.sort(({from: a}, {from: b}) => (b.length - a.length))

    filePath = filePath.replace(/^\//g, '')
    mappings.forEach(({from, to}) => {
      from = from.replace(/^\/|\/$/g, '')
      to = to.replace(/^\/|\/$/g, '')
      if (filePath.includes(from)) {
        const regexp = new RegExp(from.replace(/\//gim, '\/'))

        filePath = filePath.replace(regexp, to)
      }
    })
    return filePath
  },

  dest2From(filePath) {
    const mappings = this.getMappings()
    mappings.sort(({to: a}, {to: b}) => (b.length - a.length))

    filePath = filePath.replace(/^\//g, '')
    mappings.forEach(({from, to}) => {
      from = from.replace(/^\/|\/$/g, '')
      to = to.replace(/^\/|\/$/g, '')
      if (filePath.includes(to)) {
        const regexp = new RegExp(to.replace(/\//gim, '\/'))

        filePath = filePath.replace(regexp, from)
      }
    })
    return filePath
  },
}
