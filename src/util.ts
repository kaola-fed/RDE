import {exec, spawn, SpawnOptions} from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as copy from 'recursive-copy'
import * as util from 'util'

const asyncExec = util.promisify(exec)

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

  async asyncSpawn(cmd: string, args: ReadonlyArray<string> = [], options: SpawnOptions = {}) {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      ...options,
    })

    return new Promise((resolve, reject) => {
      child.on('error', reject)

      child.on('exit', code => {
        if (code === 0) {
          resolve()
        } else {
          const err = new Error(`child exited with code ${code}`)
          reject(err)
        }
      })
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
      ...mapping.option,
      rename(filePath) {
        // fix rename problem if src type is file
        if (fs.lstatSync(src).isFile() && mapping.option && mapping.option.rename) {
          const name = mapping.option.rename(path.basename(src))
          return `../${name}`
        }
        return filePath
      },
    }

    await copy(src, dest, option)
  },
}
