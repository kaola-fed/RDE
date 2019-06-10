import _ from '../util'

import {debug} from './logger'

export default {
  async install({
    pkgs = [],
    isGlobal = false,
    isDevDep = true,
    dir = process.cwd(),
  }) {
    if (pkgs && pkgs.length) {
      const args = ['i', ...pkgs]
      if (isGlobal) {
        args.push('-g')
      }

      if (isDevDep) {
        args.push('-D')
      }

      debug(`cwd: ${dir}`)
      debug(
        `npm ${args.join(' ')}`
      )

      await _.asyncSpawn('npm', args, {
        cwd: dir
      })
    } else {
      await _.asyncSpawn('npm', ['i'], {
        cwd: dir
      })
    }
  },

  async getInfo(pkg: string) {
    try {
      const {stdout} = await _.asyncExec(`npm view ${pkg} -json`)
      return JSON.parse(stdout)
    } catch (e) {
      if (e) {}
      return null
    }
  }
}
