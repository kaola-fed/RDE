import * as fs from 'fs'

export default {
  isEmptyDir(dir: string) {
    const files = fs.readdirSync(dir)
    return files.length === 0
  },
  ensureRequire(path: string) {
    // @ts-ignore
    delete require.cache[path]
    return require(path)
  }
}
