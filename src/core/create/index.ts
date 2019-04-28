import conf from '../../services/conf'
import docker from '../../services/docker'
import _ from '../../util'

export default class CreateCore {
  public name = ''

  public framework = 'vue'

  // format: name:version
  public rdc = ''

  public extendRdc = false

  public rdcConf: RdcConf = null

  public type: RdType = 'application'

  constructor({name, type, framework, rdc, extendRdc}) {
    this.name = name
    this.type = type
    this.framework = framework
    this.rdc = rdc
    this.extendRdc = extendRdc
  }

  public async start() {
    _.asyncExec('mkdir .tmp')

    // pull resources
    await this.prepare()

    await this.genConfFile()

    await this.genExtraFiles()

    _.asyncExec('rm -rf .tmp')
  }

  public async getRdcConf() {
    const name = this.rdc.split(':')[0]
    const confPath = `${conf.cwd}/.tmp/${conf.rdcConfName}`

    await docker.copy(
      this.rdc,
      `${conf.workDirRoot}/${name}/${conf.rdcConfName}`,
      confPath,
    )

    this.rdcConf = require(confPath)
  }

  protected async prepare() {}

  protected async genConfFile() {}

  protected async genExtraFiles() {}
}
