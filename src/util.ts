import {exec, spawn, SpawnOptions} from 'child_process'
import * as fs from 'fs'
import * as util from 'util'

const asyncExec = util.promisify(exec)

const asyncSpawn = util.promisify(spawn)

export default {
  isEmptyDir(dir: string) {
    const files = fs.readdirSync(dir)
    return files.length === 0
  },

  ensureRequire(path: string) {
    if (!fs.existsSync(path)) {
      throw Error(`${path} cannot be found, please check`)
    }
    // @ts-ignore
    delete require.cache[path]
    return require(path)
  },

  async asyncExec(cmd: string) {
    return asyncExec(cmd)
  },

  async asyncSpawn(cmd: string, args = [], options: SpawnOptions = {}) {
    return asyncSpawn(cmd, args, {
      ...options,
      stdio: 'inherit'
    })
  }
}
