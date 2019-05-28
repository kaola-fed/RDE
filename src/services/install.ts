import * as fs from 'fs'
import * as path from 'path'
import * as writePkg from 'write-pkg'

import conf from '../services/conf'
import docker from '../services/docker'
import _ from '../util'

import {MRDA} from './message'

const {resolve} = path

class Install {
  public get appConf(): AppConf {
    return require(resolve(conf.cwd, conf.appConfName))
  }

  public async app({
    rdc = null,
    skipInstall = false,
  }) {
    /**
     * copy:
     * 1. runtime dir to local
     * 1. rdc.config.js
     * then:
     * 1. install pkg.json if container
     * 1. add suite to pkg.json then install if app
     */
    const {
      cwd,
      templateDir,
      rdcConfName,
      dockerWorkDirRoot,
      localCacheDir,
    } = conf

    // only create application will pass rdc param
    if (!rdc) {
      rdc = this.appConf.container.name
    }
    await docker.copy(rdc, [{
      from: resolve(dockerWorkDirRoot, templateDir),
      to: cwd,
    }, {
      from: resolve(dockerWorkDirRoot, rdcConfName),
      to: localCacheDir,
    }])

    const runtimePkgJson = require(resolve(cwd, templateDir, 'package.json'))
    const cachePkgJsonPath = resolve(localCacheDir, 'package.json')
    const symPkgJsonPath = resolve(cwd, 'package.json')

    if (!rdc) {
      this.appConf.suites.map(item => {
        runtimePkgJson.dependencies = runtimePkgJson.dependencies || {}
        runtimePkgJson.dependencies[item.name] = item.version
      })
    }

    await writePkg(resolve(localCacheDir), runtimePkgJson)

    if (!skipInstall) {
      fs.symlinkSync(cachePkgJsonPath, symPkgJsonPath)

      await _.asyncSpawn('npm', ['i', '--package-lock', 'false'], {
        cwd,
      })

      fs.unlinkSync(symPkgJsonPath)
    }
  }

  public async pkg(type) {
    const {
      cwd,
      RdTypes,
      templateDir,
      localCacheDir,
    } = conf

    if (type === RdTypes.Application) {
      const cachePkgJsonPath = resolve(localCacheDir, 'package.json')
      if (!fs.existsSync(cachePkgJsonPath)) {
        throw Error(MRDA.NO_PKG_IN_CACHE_DIR)
      }

      const symPkgJsonPath = resolve(cwd, 'package.json')
      fs.symlinkSync(cachePkgJsonPath, symPkgJsonPath)
      await _.asyncSpawn('npm', ['i', '--package-lock', 'false'], {
        cwd,
      })
      fs.unlinkSync(symPkgJsonPath)
    }

    if (type === RdTypes.Container) {
      const runtimePkgJsonPath = resolve(templateDir, 'package.json')
      const symPkgJsonPath = resolve(cwd, 'package.json')
      fs.symlinkSync(runtimePkgJsonPath, symPkgJsonPath)
      await _.asyncSpawn('npm', ['i', '--package-lock', 'false'], {
        cwd,
      })
      fs.unlinkSync(symPkgJsonPath)
    }
  }
}
export default new Install()
