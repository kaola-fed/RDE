import * as path from 'path'

import conf from '../../services/conf'
import docker from '../../services/docker'
import ide from '../../services/ide'
import render from '../../services/render'
import sync from '../../services/sync'

import CreateCore from './index'

const {join} = path
export default class ContainerCreate extends CreateCore {
  public async prepare() {
    await docker.pull(this.rdc)

    await docker.copy(
      this.rdc,
      [{
        // does not need to join, cuz it's docker path
        from: `${conf.dockerWorkDirRoot}/.`,
        to: `${conf.cwd}`,
      }],
    )
  }

  public async genConfFile() {
    const {rdcConfName, rdcConfPath} = conf

    const rdcConf = require(rdcConfPath)
    rdcConf.docker.tag = this.rdcRepo

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
