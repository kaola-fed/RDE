import {flags} from '@oclif/command'
import {spawn} from 'child_process'
import * as path from 'path'
import * as readline from 'readline'

import RunBase from '../base/run'
import conf from '../services/conf'
import docker from '../services/docker'
import eslint from '../services/eslint'
import {debug} from '../services/logger'
import {validateRda, validateRdc} from '../services/validate'

const {resolve, join} = path
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
  }

  public static args = [{
    name: 'cmd',
    required: false,
    description: 'scripts provided by container',
  }]

  public rebuild = false

  public get from() {
    if (conf.isApp) {
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
    if (conf.isApp) {
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
      const rdcConf = require(join(conf.cwd, conf.rdcConfName))

      return rdcConf.docker.tag || null
    }

    if (conf.isApp) {
      // name app image with project dir name
      return path.basename(cwd)
    }
  }

  public get ports() {
    if (conf.isApp) {
      const {docker} = conf.getAppConf()
      return docker.ports || []
    }

    if (conf.rdType === RdTypes.Container) {
      const rdcConf = require(join(conf.cwd, conf.rdcConfName))

      return rdcConf.docker.ports || []
    }
  }

  public async preInit() {
    await super.preInit()
    await this.config.runHook('checkUpdate', {})

    const {flags} = this.parse(Run)
    this.rebuild = flags.rebuild

    if (conf.rdType === RdTypes.Container) {
      await validateRdc()
    }

    if (conf.isApp) {
      await validateRda()
    }
  }

  public async preRun() {
    await docker.genDockerFile(
      this.workDir, this.from,
      conf.localCacheDir,
      conf.isApp,
    )

    await docker.genDockerCompose(
      this.workDir,
      this.cmd,
      this.ports,
      this.watch,
      `dev-${this.tag}`,
      conf.localCacheDir,
      conf.isApp,
      this.cmd === 'build'
    )

    if (conf.isApp) {
      await eslint.prepare(this.from)
    }

    await docker.genPkgJson()
  }

  public async run() {
    // not using docker-compose cuz .dockerignore in sub dir is not working,
    // build with docker-compose is slow if node_modules exists
    await docker.build(`dev-${this.tag}`, cwd, this.rebuild, `${conf.localCacheDir}/Dockerfile`)

    let args = ['run', '--rm', '--service-ports', 'rde', 'rde', 'docker:run', this.cmd]

    debug(`docker build dev-${this.tag}`)

    if (this.watch) {
      args.push('--watch')
    }

    if (this.verbose) {
      args.push('-v')
    }

    if (this.extras) {
      args = args.concat(['-e', this.extras])
    }

    let child = null
    process.on('SIGINT', () => {
      child.kill()
    })

    if (this.watch) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.on('SIGINT', () => {
        child.kill()
        process.exit(0)
      })
    }

    debug(`docker-compose ${args.join(' ')}`)

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
