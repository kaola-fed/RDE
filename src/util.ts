import {exec} from 'child_process'
import * as fs from 'fs'
import * as util from 'util'

const asyncExec = util.promisify(exec)

export default {
  isEmptyDir(dir: string) {
    const files = fs.readdirSync(dir)
    return files.length === 0
  },

  ensureRequire(path: string) {
    // @ts-ignore
    delete require.cache[path]
    return require(path)
  },

  async asyncExec(cmd: string) {
    return asyncExec(cmd)
  }
}
