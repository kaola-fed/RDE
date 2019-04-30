import conf from '../../services/conf'
import docker from '../../services/docker'
import render from '../../services/render'

import CreateCore from './index'

export default class ApplicationCreate extends CreateCore {
  public async prepare() {
    await docker.pull(this.rdc)

    const name = this.rdc.split(':')[0]
    await docker.copy(
      this.rdc,
      `${conf.dockerWorkDirRoot}/${name}/app`,
      `${conf.cwd}/app`
    )

    await this.getRdcConf()
  }

  public async genConfFile() {
    const {appConfName} = conf
    const {docs, docker = {ports: []}} = this.rdcConf
    await render.renderTo(`rda/${appConfName.slice(0, -3)}`, {
      container: this.rdc,
      docs: docs ? docs.url : '',
      ports: `[${docker.ports.join(',')}]`,
    }, appConfName)
  }

  public async genExtraFiles() {
    await render.renderTo('rda/README', {
      name: this.name,
      homepage: conf.homepage,
    }, 'README.md')
  }
}
