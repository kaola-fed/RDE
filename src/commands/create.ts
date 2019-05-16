import {flags} from '@oclif/command'
import * as enquirer from 'enquirer'

import Base from '../base'
import ApplicationCreate from '../core/create/application'
import ContainerCreate from '../core/create/container'
import SuiteCreate from '../core/create/suite'
import conf from '../services/conf'
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

    const {name} = await enquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'What is the name of project?',
      required: true,
    })
    this.name = name

    if (this.from) {
      conf.rdType = 'container'
      this.rdc = this.from
      return
    }

    const {type, framework} = await enquirer.prompt([
      {
        name: 'type',
        message: 'What kind of project to create?',
        type: 'select',
        choices: Object.keys(RdTypes).map(name => ({name})),
        initial: RdTypes.Application,
      },
      {
        name: 'framework',
        message: 'What kind of framework to use?',
        type: 'select',
        choices: Object.keys(frameworks).map(name => ({name})),
        initial: 'vue',
      },
    ])

    if (type === RdTypes.Application) {
      const defaultStarter = conf.frameworks[framework].rdcStarter
      const {rdcName} = await enquirer.prompt({
        type: 'input',
        name: 'rdcName',
        message: 'What is the name of container on docker hub?',
        required: true,
        initial: defaultStarter,
      })

      const {version} = await enquirer.prompt({
        type: 'input',
        name: 'version',
        message: 'What is the version of container?',
        required: true,
        initial: 'latest',
      })

      this.rdc = `${rdcName}:${version}`
    }

    if (type === RdTypes.Container) {
      const {rdcRepo} = await enquirer.prompt({
        type: 'input',
        name: 'rdcRepo',
        message: 'What is the repository name on docker hub?',
        required: true,
      })
      this.rdcRepo = rdcRepo

      const name = conf.frameworks[this.framework].rdcStarter
      this.rdc = `${name}:latest`
    }

    conf.rdType = type
    this.framework = framework
  }
}
