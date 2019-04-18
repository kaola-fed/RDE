import * as mustache from 'mustache'
import * as path from 'path'
// @ts-ignore
import * as copy from 'recursive-copy'
import * as through from 'through2'

import {spinner} from './logger'

let defaultTags = ['{{', '}}']

const mustachesDir = path.resolve(__dirname, '../mustaches')

export default {
  render(tpl: string, dataView: any, tags = defaultTags) {
    return mustache.render(tpl, dataView, tags)
  },

  async renderTo(tpl: string, dataView: any, dest: string, options = {}, tags = defaultTags) {
    await copy(path.resolve(mustachesDir, `${tpl}.mustache`), dest, {
      ...options,
      transform: () => {
        return through((chunk, _enc, done) => {
          const output = this.render(chunk.toString(), dataView, tags)
          done(null, output)
        })
      }
    })
  },

  async renderDir(src: string, dataView: any, includes: string[], dest: string, options = {}, tags = defaultTags) {
    spinner.start(`Rendering ${src}. This might take a while...`)

    await copy(src, dest, {
      ...options,
      transform: (src: string) => {
        return through((chunk, _enc, done) => {
          if (includes.includes(path.extname(src))) {
            const output = this.render(chunk.toString(), dataView, tags)
            done(null, output)
          } else {
            done(null, chunk.toString())
          }
        })
      }
    })

    spinner.stop()
  }
}
