import RunBase from '../base/run'
import conf from '../services/conf'
import render from '../services/render'
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

  public async preRun() {
    // gen dockerfile
    await render.renderTo('docker/.dockerignore', {}, `${conf.tmpDir}/.dockerignore`)

    const workDir = conf.getWorkDir(this.type, this.from)
    await render.renderTo('docker/Dockerfile', {
      from: this.from,
      workDir,
    }, `${conf.tmpDir}/Dockerfile`)

    await render.renderTo('docker/docker-compose', {
      cmd: this.cmd,
      ports: this.ports,
      watch: this.watch,
    }, `${conf.tmpDir}/docker-compose.yml`)
  }

  public async run() {
    if (this.watch) {
      await _.asyncExec(`docker-compose run --rm rde rde docker:run ${this.cmd} --watch`)
    } else {
      await _.asyncExec(`docker-compose run --rm rde rde docker:run ${this.cmd}`)
    }
  }
}
