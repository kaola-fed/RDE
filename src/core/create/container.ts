import * as path from 'path'

import conf from '../../services/conf'
import docker from '../../services/docker'
import ide from '../../services/ide'
import install from '../../services/install'
import render from '../../services/render'

import CreateCore from './index'

const {join} = path
export default class ContainerCreate extends CreateCore {
  public async prepare() {
    await docker.pull(this.rdc)

    const name = this.rdc.split(':')[0]
    await docker.copy(
      this.rdc,
      [{
        // does not need to join, cuz it's docker path
        from: `${conf.dockerWorkDirRoot}/${name}/.`,
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

    await install.pkg(conf.RdTypes.Container)
  }
}
