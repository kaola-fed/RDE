import * as fs from 'fs'
import * as path from 'path'

import conf from './conf'

export default {
  get cachePath() {
    return path.resolve(conf.localCacheDir, '.cache')
  },

  get exist() {
    return fs.existsSync(this.cachePath)
  },

  getAll() {
    if (!fs.existsSync(this.cachePath)) {
      return {}
    }
    const file = fs.readFileSync(this.cachePath, {encoding: 'UTF-8'})
    return JSON.parse(file || '{}')
  },

  setAll(json) {
    fs.writeFileSync(this.cachePath, JSON.stringify(json), {encoding: 'UTF-8'})
  },

  get(key: string) {
    return this.getAll()[key]
  },

  set(key: string, value: string | any) {
    const cacheObj = this.getAll()
    cacheObj[key] = value
    this.setAll(cacheObj)
  },

  delete(key: string) {
    const cacheObj = this.getAll()
    delete cacheObj[key]
    this.setAll(cacheObj)
  }
}
