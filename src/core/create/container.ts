import * as path from 'path'

import conf from '../../services/conf'
import ide from '../../services/ide'
import npm from '../../services/npm'
import render from '../../services/render'
import sync from '../../services/sync'

import CreateCore from './index'

const {join, resolve} = path
export default class ContainerCreate extends CreateCore {
  public async prepare() {
    await npm.pull(this.rdc, true)

    await npm.copy(
      [{
        from: resolve(conf.npmPkgDir, this.rdc, './'),
        to: `${conf.cwd}`,
      }],
    )
  }

  public async genConfFile() {
    const {rdcConfName, rdcConfPath} = conf

    const rdcConf = require(rdcConfPath)
    rdcConf.npm.name = this.rdcRepo
    rdcConf.npm.version = '0.0.1'

    await render.renderTo('module', {
      obj: rdcConf,
    }, rdcConfName, {
      overwrite: true,
    })
  }

  public async genExtraFiles() {
    await render.renderTo(join('rdc', 'README'), {
      name: this.name,
      homepage: conf.homepage,
    }, 'README.md', {
      overwrite: true,
    })

    await render.renderTo('.gitignore', {
      isApp: conf.isApp
    }, '.gitignore', {
      overwrite: true,
    })

    await ide.initSettings(false)
    await sync.install()
  }
}
