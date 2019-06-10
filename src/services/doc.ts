import * as fs from 'fs'
import * as path from 'path'
import * as readPkgJson from 'read-package-json'

import mdIt from './markdown'

const {resolve} = path
export default {
  async getPkgDeps() {
    return new Promise((resolve, reject) => {
      readPkgJson(
        path.resolve('template/package.json'),
        () => {},
        false,
        (err, json) => {
          if (err) {
            return reject(err)
          }

          const {dependencies = {}} = json
          const arr = []
          Object.keys(dependencies).forEach(name => {
            arr.push({
              name,
              link: this.getNpmPkgLink(name),
              version: dependencies[name],
            })
          })
          resolve(arr)
        })
    })
  },

  getLintModule() {
    try {
      const content = fs.readFileSync(resolve('template', '.eslintrc.js'))

      return mdIt.render(`\`\`\`javascript\n${content}\n\`\`\``)
    } catch (e) {
      if (e) {}
    }
  },

  getNpmPkgLink(name) {
    const prefix = 'https://www.npmjs.com/package'
    if (/^plugin:(.*)\/recommended$/.test(name)) {
      return `${prefix}/eslint-plugin-${name.match(/^plugin:(.*)\/recommended$/)[1]}`
    }
    return `${prefix}/${name.split('/')[0]}`
  },
}
