import axios from 'axios'

import _ from '../util'

import {logger} from './logger'

export default {
  async install(pkg?: string, isDevDep = true, dir = process.cwd()) {
    try {
      if (pkg) {
        await _.asyncExec(`cd ${dir} && npm i ${isDevDep ? '-D' : ''} ${pkg}`)
      } else {
        await _.asyncExec(`cd ${dir} && npm i`)
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
