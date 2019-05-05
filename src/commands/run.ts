import {flags} from '@oclif/command'
import {spawn} from 'child_process'
import * as path from 'path'

import RunBase from '../base/run'
import conf from '../services/conf'
import docker from '../services/docker'
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
    rebuild: flags.boolean({
      char: 'r',
      description: 'rebuild image before run',
    }),
    format: flags.string({
      description: 'format linter output',
    }),
  }

  public static args = [{
    name: 'cmd',
    required: true,
    description: 'scripts provided by container',
  }]

  public rebuild = false

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

    const {flags} = this.parse(Run)
    this.rebuild = flags.rebuild

    await docker.checkEnv()

    if (conf.rdType === RdTypes.Container) {
      await validateRdc()
    }

    if (conf.rdType === RdTypes.Application) {
      await validateRda()
    }
  }

  public async preRun() {
    await docker.genDockerFile(this.workDir, this.from, conf.localCacheDir)

    await docker.genDockerCompose(
      this.workDir,
      this.cmd,
      this.ports,
      this.watch,
      this.tag,
      conf.localCacheDir,
    )

    await docker.genPkgJson()
  }

  public async run() {
    // not using docker-compose cuz .dockerignore in sub dir is not working,
    // build with docker-compose is slow if node_modules exists
    let args = ['build', '-t', this.tag, '.']
    if (this.rebuild) {
      args.splice(1, 0, '--no-cache')
    }
    await _.asyncSpawn('docker', args, {
      cwd: conf.localCacheDir,
    })

    args = ['run', '--rm', '--service-ports', 'rde', 'rde', 'docker:run', this.cmd]
    if (this.watch) {
      args.push('--watch')
    }

    // @TODO: ctrl+C not working when using stdio: inherit
    spawn('docker-compose', (args as ReadonlyArray<string>), {
      cwd: conf.localCacheDir,
      stdio: 'inherit',
    })
  }
}
