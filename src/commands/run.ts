import {flags} from '@oclif/command'
import {spawn} from 'child_process'
import * as path from 'path'

import RunBase from '../base/run'
import conf from '../services/conf'
import docker from '../services/docker'
import {validateRda, validateRdc} from '../services/validate'

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
    staged: flags.boolean({
      char: 's',
      description: 'lint staged',
    }),
  }

  public static args = [{
    name: 'cmd',
    required: false,
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

    if (conf.rdType === RdTypes.Application) {
      // name app image with project dir name
      return path.basename(cwd)
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
    await this.config.runHook('checkUpdate', {})

    const {flags} = this.parse(Run)
    this.rebuild = flags.rebuild

    await docker.checkEnv(true)

    if (conf.rdType === RdTypes.Container) {
      await validateRdc()
    }

    if (conf.rdType === RdTypes.Application) {
      await validateRda()
    }
  }

  public async preRun() {
    await docker.genDockerFile(
      this.workDir, this.from,
      conf.localCacheDir,
      conf.rdType === RdTypes.Application,
    )

    await docker.genDockerCompose(
      this.workDir,
      this.cmd,
      this.ports,
      this.watch,
      `dev-${this.tag}`,
      conf.localCacheDir,
      conf.rdType === RdTypes.Application,
    )

    await docker.genPkgJson()
  }

  public async run() {
    // not using docker-compose cuz .dockerignore in sub dir is not working,
    // build with docker-compose is slow if node_modules exists
    await docker.build(`dev-${this.tag}`, cwd, this.rebuild, `${conf.localCacheDir}/Dockerfile`)

    let args = ['run', '--rm', '--service-ports', 'rde', 'rde', 'docker:run', this.cmd]

    if (this.watch) {
      args.push('--watch')
    }

    if (this.extras) {
      args = args.concat(['-e', this.extras])
    }

    let child = null
    process.on('SIGINT', () => {
      child.kill()
    })

    child = spawn('docker-compose', (args as ReadonlyArray<string>), {
      cwd: conf.localCacheDir,
      stdio: 'inherit',
    })

    child.on('close', code => {
      if (code !== 0) {
        process.exit(code)
      }
    })
  }
}
