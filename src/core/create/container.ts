import conf from '../../services/conf'
import docker from '../../services/docker'
import render from '../../services/render'
import _ from '../../util'

import CreateCore from './index'

export default class ContainerCreate extends CreateCore {
  public async prepare() {
    await docker.pull(this.rdc)

    const name = this.rdc.split(':')[0]
    if (this.extendRdc) {
      await docker.copy(
        this.rdc,
        `${conf.workDirRoot}/${name}/app`,
        `${conf.cwd}/app`
      )

      await _.asyncExec('mkdir template')
    } else {
      await docker.copy(
        this.rdc,
        `${conf.workDirRoot}/${name}/.`,
        `${conf.cwd}`
      )
    }

    await this.getRdcConf()
  }

  public async genConfFile() {
    if (this.extendRdc) {
      const {rdcConfName} = conf
      const {docs, framework}: RdcConf = this.rdcConf
      await render.renderTo(`rda/${rdcConfName.slice(0, -3)}`, {
        extends: this.rdc,
        framework,
        docs: docs ? docs.url : '',
      }, rdcConfName, {
        overwrite: true,
      })
    }
  }

  public async genExtraFiles() {
    await render.renderTo('rdc/README', {
      name: this.name,
      homepage: conf.homepage,
    }, 'README.md', {
      overwrite: true,
    })

    await render.renderTo('.gitignore', {}, '.gitignore', {
      overwrite: true,
    })
  }
}
