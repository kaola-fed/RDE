import * as download from 'download'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as copy from 'recursive-copy'

import _ from '../util'

import conf from './conf'
import {debug} from './logger'

const {resolve} = path
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
  },

  async pull(image: string, forceUpdate = false) {
    const imageDir = resolve(
      conf.npmPkgDir,
      image,
    )

    if (!fs.existsSync(imageDir) || forceUpdate) {
      const json = await this.getInfo(image)

      if (!(json && json.dist && json.dist.tarball)) {
        throw Error(`npm cannot find ${image}`)
      }
      // @ts-ignore
      // tslint:disable-next-line:triple-equals
      if (os.platform() == 'win32') {
        await _.asyncExec(`rm -rf ${imageDir} && mkdir ${imageDir}`)
      } else {
        await _.asyncExec(`rm -rf ${imageDir} && mkdir -p ${imageDir}`)
      }

      try {
        await download(json.dist.tarball, imageDir, {
          extract: true,
        })

        await _.asyncExec(`cd ${imageDir} && mv -f package/* . && rm -rf package`)
      } catch (err) {
        await _.asyncExec(`rm -rf ${imageDir}`)
        throw err
      }

    }
  },

  async copy(mappings: any[]) {
    for (const mapping of mappings) {
      await copy(path.resolve(mapping.from), mapping.to, {
        overwrite: true,
        dot: true,
      })
    }
  },
}
