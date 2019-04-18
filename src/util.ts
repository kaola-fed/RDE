import {exec, spawn, SpawnOptions} from 'child_process'
import * as fs from 'fs'
import * as util from 'util'

import {logger} from './services/logger'
import {option} from "@oclif/command/lib/flags";

const asyncExec = util.promisify(exec)

const asyncSpawn = util.promisify(spawn)

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
    return await asyncExec(cmd)
  },

  async asyncSpawn(cmd: string, args = [], options: SpawnOptions = {}) {
    return await asyncSpawn(cmd, args, {
      ...options,
      stdio: 'inherit'
    })
  }
}
