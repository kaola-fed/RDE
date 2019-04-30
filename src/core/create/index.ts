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

  public rdcRepo = ''

  constructor({name, framework, rdc, extendRdc, rdcRepo}) {
    this.name = name
    this.framework = framework
    this.rdc = rdc
    this.extendRdc = extendRdc
    this.rdcRepo = rdcRepo
  }

  public async start() {
    await _.asyncExec(`rm -rf ${conf.tmpDir} && mkdir ${conf.tmpDir}`)

    // pull resources
    await this.prepare()

    await this.genConfFile()

    await this.genExtraFiles()
  }

  public async getRdcConf() {
    const name = this.rdc.split(':')[0]
    const confPath = `${conf.tmpDir}/${conf.rdcConfName}`

    await docker.copy(
      this.rdc,
      `${conf.dockerWorkDirRoot}/${name}/${conf.rdcConfName}`,
      confPath,
    )

    this.rdcConf = require(confPath)
  }

  protected async prepare() {}

  protected async genConfFile() {}

  protected async genExtraFiles() {}
}
