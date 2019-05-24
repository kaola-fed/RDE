import * as path from 'path'

import conf from '../../services/conf'
import docker from '../../services/docker'
import render from '../../services/render'
import _ from '../../util'

import CreateCore from './index'

const {join} = path
export default class ContainerCreate extends CreateCore {
  public async prepare() {
    await docker.pull(this.rdc)

    await docker.copy(
      this.rdc,
      [{
        // does not need to join, cuz it's docker path
        from: `${conf.dockerRdcDir}/.`,
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

    await _.asyncSpawn('npm', ['i', '--package-lock', 'false'], {
      cwd: conf.cwd,
    })
  }
}
