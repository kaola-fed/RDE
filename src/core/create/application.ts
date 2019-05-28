import * as path from 'path'

import cache from '../../services/cache'
import conf from '../../services/conf'
import docker from '../../services/docker'
import ide from '../../services/ide'
import render from '../../services/render'
import sync from '../../services/sync'
import _ from '../../util'

import CreateCore from './index'

const {join, resolve} = path
export default class ApplicationCreate extends CreateCore {
  public rdcConf: RdcConf = null

  public async prepare() {
    await docker.pull(this.rdc)
    await _.asyncExec(`mkdir ${conf.localCacheDir}`)
    cache.set('container', this.rdc)

    const {
      cwd,
      rdcConfName,
      dockerWorkDirRoot,
    } = conf
    const rdcConfPath = resolve(conf.localCacheDir, rdcConfName)
    await docker.copy(
      this.rdc,
      [{
        from: resolve(dockerWorkDirRoot, 'app'),
        to: resolve(cwd, 'app'),
      }],
    )

    await sync.genAppStagedFiles(this.rdc)
    await sync.install()

    this.rdcConf = require(rdcConfPath)
  }

  public async genConfFile() {
    const {appConfName} = conf
    const {docs, docker = {ports: []}} = this.rdcConf
    await render.renderTo(join('rda', appConfName.slice(0, -3)), {
      container: this.rdc,
      docs: docs ? docs.url : '',
      ports: docker.ports,
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
