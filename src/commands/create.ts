import {flags} from '@oclif/command'
import cli from 'cli-ux'
import * as inquirer from 'inquirer'

import Base from '../base'
import ApplicationCreate from '../core/create/application'
import ContainerCreate from '../core/create/container'
import SuiteCreate from '../core/create/suite'
import conf from '../services/conf'
import docker from '../services/docker'
import {logger} from '../services/logger'
import _ from '../util'

export default class Create extends Base {
  public static description = 'open RDE world'

  public static examples = [
    '$ rde create',
  ]

  public static flags = {
    ...Base.flags,
    from: flags.string({
      char: 'f',
      description: 'create container from another one',
      parse: input => {
        if (!input.includes(':')) {
          return `${input}:latest`
        }
        return input
      },
    }),
  }

  public name = ''

  public framework = 'vue'

  public rdc = ''

  public rdcRepo = ''

  public from = ''

  public async preInit() {
    await this.config.runHook('checkUpdate', {})

    const {flags} = this.parse(Create)
    const {from} = flags

    this.from = from

    await docker.checkEnv()
    return flags
  }

  public async initialize() {
    await this.ask()
  }

  public async preRun() {
    await _.asyncExec(`mkdir ${this.name}`)
    process.chdir(this.name)
  }

  public async run() {
    const opts = {
      name: this.name,
      type: conf.rdType,
      framework: this.framework,
      rdc: this.rdc,
      extendRdc: !!this.from,
      rdcRepo: this.rdcRepo,
    }

    let core = null
    const {RdTypes} = conf

    switch (conf.rdType) {
    case RdTypes.Application:
      core = new ApplicationCreate(opts)
      break
    case RdTypes.Container:
      core = new ContainerCreate(opts)
      break
    case RdTypes.Suite:
      core = new SuiteCreate(opts)
    }

    await core.start()
  }

  public async postRun() {
    logger.star('Run successfully')
    logger.star('Hello from RDE, explore with:')
    logger.star('$ rde serve')
  }

  public async ask() {
    const {RdTypes, frameworks} = conf

    this.name = await cli.prompt('name of project', {
      required: true,
    })

    if (this.from) {
      conf.rdType = 'container'
      this.rdc = this.from
      return
    }

    const {type, framework} = await inquirer.prompt([
      {
        name: 'type',
        message: 'what kind of project do you want to create?',
        type: 'list',
        choices: Object.keys(RdTypes).map(name => ({name})),
        default: RdTypes.Application,
      },
      {
        name: 'framework',
        message: 'what kind of framework do you prefer?',
        type: 'list',
        choices: Object.keys(frameworks).map(name => ({name})),
        default: 'vue',
      },
    ])

    if (type === RdTypes.Application) {
      const defaultStarter = conf.frameworks[framework].rdcStarter
      const name = await cli.prompt(`name of container(${defaultStarter})`, {
        required: true,
        default: defaultStarter,
      })

      const version = await cli.prompt('version of container(latest)', {
        required: false,
        default: 'latest',
      })

      this.rdc = `${name}:${version}`
    }

    if (type === RdTypes.Container) {
      this.rdcRepo = await cli.prompt('docker hub repository name', {
        required: true,
      })

      const name = conf.frameworks[this.framework].rdcStarter
      this.rdc = `${name}:latest`
    }

    conf.rdType = type
    this.framework = framework
  }
}
