import * as path from 'path'

import RunBase from '../base/run'
import conf from '../services/conf'
import docker from '../services/docker'
import {spinner} from '../services/logger'
import {validateRda, validateRdc} from '../services/validate'
import _ from '../util'

const {resolve} = path
const {RdTypes, cwd, rdcConfName} = conf
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
    if (conf.rdType === RdTypes.Application) {
      const {container} = conf.getAppConf()
      return container.name
    }

    if (conf.rdType === RdTypes.Container) {
      const rdcConfPath = resolve(cwd, rdcConfName)
      const rdcConf = require(rdcConfPath)

      return rdcConf.extends || rdcConf.nodeVersion || 'node:latest'
    }
  }

  public get workDir() {
    const {dockerWorkDirRoot} = conf
    let name
    if (conf.rdType === RdTypes.Application) {
      const {container} = conf.getAppConf()
      name = container.name.split(':')[0]
    }

    if (conf.rdType === RdTypes.Container) {
      const rdcConfPath = resolve(cwd, rdcConfName)
      const rdcConf = require(rdcConfPath)
      const {tag} = rdcConf.docker
      name = tag.split(':')[0]
    }
    return `${dockerWorkDirRoot}/${name}`
  }

  public get tag() {
    if (conf.rdType === RdTypes.Container) {
      const rdcConf = require(`${conf.cwd}/${conf.rdcConfName}`)

      return rdcConf.docker.tag || null
    }
  }

  public get ports() {
    if (conf.rdType === RdTypes.Application) {
      const {docker} = conf.getAppConf()
      return docker.ports || []
    }

    if (conf.rdType === RdTypes.Container) {
      const rdcConf = require(`${conf.cwd}/${conf.rdcConfName}`)

      return rdcConf.docker.ports || []
    }
  }

  public async preInit() {
    await super.preInit()

    await docker.checkEnv()

    if (conf.rdType === RdTypes.Container) {
      await validateRdc()
    }

    if (conf.rdType === RdTypes.Application) {
      await validateRda()
    }
  }

  public async preRun() {
    await docker.genDockerFile(this.workDir, this.from, conf.dockerTmpDir)

    await docker.genDockerCompose(
      this.workDir,
      this.cmd,
      this.ports,
      this.watch,
      this.tag,
      conf.dockerTmpDir,
    )
  }

  public async run() {
    if (!await docker.imageExist(this.tag)) {
      spinner.start('Building image start')
      await _.asyncExec(`cd ${conf.dockerTmpDir} && docker-compose build`)
      spinner.stop()
    }

    if (this.watch) {
      await _.asyncSpawn('docker-compose', ['run', '--rm', 'rde', 'rde', 'docker:run', this.cmd, '--watch'], {
        cwd: conf.dockerTmpDir,
      })
    } else {
      await _.asyncSpawn('docker-compose', ['run', '--rm', 'rde', 'rde', 'docker:run', this.cmd], {
        cwd: conf.dockerTmpDir,
      })
    }
  }
}
