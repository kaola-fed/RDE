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
    try {
      const {stdout} = await _.asyncExec(`npm view ${pkg} -json`)
      return JSON.parse(stdout)
    } catch (e) {
      if (e) {
        logger.error(e)
      }
      return null
    }
  }
}
