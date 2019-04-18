import {exec} from 'child_process'
import * as fs from 'fs'
import * as util from 'util'

import {logger} from './services/logger'

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
    try {
      const {stdout, stderr} = await asyncExec(cmd)
      stdout && logger.info(stdout)
      stderr && logger.warn(stderr)
    } catch (e) {
      logger.error(e)
      process.exit(2)
    }
  }
}
