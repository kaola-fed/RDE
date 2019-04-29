import RunBase from '../base/run'
import conf from '../services/conf'
import docker from '../services/docker'
import {validateRda, validateRdc} from '../services/validate'
import _ from '../util'

const {RdTypes} = conf
export default class Run extends RunBase {
  public static description = 'run scripts provided by container'

  public static examples = [
    '$ rde run <cmd>',
  ]

  public static flags = {
    ...RunBase.flags,
  }

  public static args = [{
    name: 'cmd',
    required: true,
    description: 'scripts provided by container',
  }]

  public get from() {
    if (this.type === RdTypes.Application) {
      const {app} = conf.getAppConf()
      return app.container.name
    }

    if (this.type === RdTypes.Container) {
      const rdcConf = require(`${conf.cwd}/${conf.rdcConfName}`)

      return rdcConf.extends || rdcConf.nodeVersion || 'node:latest'
    }
  }

  public get tag() {
    if (this.type === RdTypes.Container) {
      const rdcConf = require(`${conf.cwd}/${conf.rdcConfName}`)

      return rdcConf.docker.tag || null
    }
  }

  public get ports() {
    if (this.type === RdTypes.Application) {
      const {app} = conf.getAppConf()
      return app.docker.ports || []
    }

    if (this.type === RdTypes.Container) {
      const rdcConf = require(`${conf.cwd}/${conf.rdcConfName}`)

      return rdcConf.docker.ports || []
    }
  }

  public async preInit() {
    if (this.type === RdTypes.Container) {
      await validateRdc()
    }

    if (this.type === RdTypes.Application) {
      await validateRda()
    }
  }

  public async preRun() {
    await docker.genDockerFile(this.type, this.from, conf.tmpDir)

    await docker.genDockerCompose(
      this.type,
      this.from,
      this.cmd,
      this.ports,
      this.watch,
      this.tag,
      conf.tmpDir,
    )
  }

  public async run() {
    process.chdir(conf.tmpDir)
    await _.asyncExec('docker-compose build')

    if (this.watch) {
      await _.asyncExec(`docker-compose run --rm rde rde docker:run ${this.cmd} --watch`)
    } else {
      await _.asyncExec(`docker-compose run --rm rde rde docker:run ${this.cmd}`)
    }
  }
}
