import * as fs from 'fs'
import * as mustache from 'mustache'
import * as path from 'path'
// @ts-ignore
import * as copy from 'recursive-copy'
import * as through from 'through2'

let defaultTags = ['{{', '}}']

const templateDir = path.resolve(__dirname, '../templates')

export default {
  render(tpl: string, dataView: any, tags = defaultTags) {
    return mustache.render(tpl, dataView, tags)
  },

  renderTo(tpl: string, dataView: any, dest: string, tags = defaultTags) {
    copy(path.resolve(templateDir, `${tpl}.mustache`), dest, {
      rename(filePath: string) {
        return filePath
      },
      transform() {
        return through((chunk, _enc, done) => {
          const output = this.render(chunk.toString(), dataView, tags)
          done(null, output)
        })
      }
    })
  },

  writeJsObj(obj: any, dest: string, tags = defaultTags) {
    const file = fs.readFileSync(
      path.resolve(templateDir, 'module.js.mustache'),
      {
        encoding: 'utf-8'
      })

    const result = this.render(file, obj, tags)
    fs.writeFileSync(dest, result, {encoding: 'utf-8'})
  },

  // renderDir(src: string, dest: string, includes: string[], tags = defaultTags) {
  //
  // }
}
