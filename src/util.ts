import {exec, spawn, SpawnOptions} from 'child_process'
import * as fs from 'fs'
import * as util from 'util'
import * as copy from 'recursive-copy'
import * as path from "path";

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
  },

  restoreFlags(flags) {
    const list = []

    Object.keys(flags).forEach(key => {
      list.push(`--${key}`)
      if (typeof flags[key] !== 'boolean') {
        list.push(`${flags[key]}`)
      }
    })

    return list
  },

  async copy(src, dest, mapping) {
    let option = {
      overwrite: true,
      dot: true,
    }

    const mappingOpt = mapping.option
    // fix rename problem if src type is file
    if (mappingOpt) {
      option = mappingOpt

      if (fs.lstatSync(src).isFile() && mappingOpt.rename) {
        const originRename = mappingOpt.rename
        mapping.option.rename = () => {
          const name = originRename(path.basename(src))
          return `../${name}`
        }
      }
    }

    await copy(src, dest, option)
  },
}
