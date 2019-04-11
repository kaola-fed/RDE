import axios from 'axios'
import {exec} from 'child_process'
import * as fs from 'fs'
import * as util from 'util'

import {logger} from './logger'

const asyncExec = util.promisify(exec)

export default {
  isEmptyDir(dir: string) {
    const files = fs.readdirSync(dir)
    return files.length === 0
  },
  async installPkg(pkgName?: string, isDevDep = true) {
    let result: any = null
    if (pkgName) {
      result = await asyncExec(`npm i ${isDevDep ? '-D' : ''} ${pkgName}`)
    } else {
      result = await asyncExec('npm i')
    }

    if (result.stderr) {
      logger.error(`install pkg ${pkgName} failed`)
    } else {
      logger.complete(`install pkg ${pkgName} successfully`)
    }
  },
  async getNpmPkgInfo(pkg: string) {
    const registry = 'https://registry.npm.taobao.org'
    const {data} = await axios.get(`${registry}/${pkg}`)

    if (data.error) {
      throw Error(data.error)
    } else {
      return data
    }
  }
}
