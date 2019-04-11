import axios from 'axios'
import {exec} from 'child_process'
import * as util from 'util'

import {logger} from './logger'

const asyncExec = util.promisify(exec)

export default {
  async install(pkg?: string, isDevDep = true, dir = process.cwd()) {
    try {
      if (pkg) {
        await asyncExec(`cd ${dir} && npm i ${isDevDep ? '-D' : ''} ${pkg}`)
      } else {
        await asyncExec(`cd ${dir} && npm i`)
      }
      logger.info(`Installed package ${pkg}`)
    } catch (e) {
      logger.error(`Failed to install package ${pkg}: ${e}`)
    }
  },

  async getInfo(pkg: string) {
    const registry = 'https://registry.npm.taobao.org'
    const {data} = await axios.get(`${registry}/${pkg}`)

    if (data.error) {
      throw Error(data.error)
    } else {
      return data
    }
  }
}
