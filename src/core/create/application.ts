import * as path from 'path'

import cache from '../../services/cache'
import conf from '../../services/conf'
import ide from '../../services/ide'
import npm from '../../services/npm'
import render from '../../services/render'
import sync from '../../services/sync'
import _ from '../../util'

import CreateCore from './index'

const {join, resolve} = path
export default class ApplicationCreate extends CreateCore {
  public rdcConf: RdcConf = null

  public async prepare() {
    await npm.pull(this.rdc)
    await _.asyncExec(`mkdir ${conf.localCacheDir}`)
    cache.set('container', this.rdc)

    const {
      cwd,
      rdcConfName,
      npmPkgDir,
    } = conf
    const rdcConfPath = resolve(conf.localCacheDir, rdcConfName)
    await npm.copy(
      [{
        from: resolve(npmPkgDir, this.rdc, 'app'),
        to: resolve(cwd, 'app'),
      }],
    )

    await sync.genAppStagedFiles(this.rdc)
    await sync.install()
    await ide.initSettings(true)

    this.rdcConf = require(rdcConfPath)
  }

  public async genConfFile() {
    const {appConfName} = conf
    const {docs} = this.rdcConf
    await render.renderTo(join('rda', appConfName.slice(0, -3)), {
      container: this.rdc,
      docs: docs ? docs.url : '',
    }, appConfName)
  }

  public async genExtraFiles() {
    await render.renderTo(join('rda', 'README'), {
      name: this.name,
      homepage: conf.homepage,
    }, 'README.md')

    await render.renderTo('.gitignore', {
      isApp: conf.isApp
    }, '.gitignore', {
      overwrite: true,
    })

    await ide.initSettings(true)
  }
}
