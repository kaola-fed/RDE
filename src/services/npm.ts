import axios from 'axios'

import _ from '../util'

import {logger, spinner} from './logger'

export default {
  async install(pkg?: string, isDevDep = true, dir = process.cwd()) {
    spinner.start('Installing packages. This might take a while...')

    try {
      if (pkg) {
        await _.asyncExec(`cd ${dir} && npm i ${isDevDep ? '-D' : ''} ${pkg}`)
      } else {
        await _.asyncExec(`cd ${dir} && npm i`)
      }
      logger.info(`Installed package ${pkg}`)
    } catch (e) {
      logger.error(`Failed to install package ${pkg}: ${e}`)
    } finally {
      spinner.stop()
    }
  },

  async getInfo(pkg: string) {
    const registry = 'https://registry.npm.taobao.org'

    try {
      const {data} = await axios.get(`${registry}/${pkg}`)
      return data
    } catch ({response}) {
      if (response.status === 404) {
        return null
      }
    }
  }
}
