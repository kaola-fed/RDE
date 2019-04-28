import {flags} from '@oclif/command'
import cli from 'cli-ux'
import * as inquirer from 'inquirer'

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

  public type = ''

  public framework = 'vue'

  public rdc = ''

  public from = ''

  public async preInit() {
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
      type: this.type,
      framework: this.framework,
      rdc: this.rdc,
      extendRdc: !!this.from
    }

    let core = null
    switch (this.type) {
    case 'application':
      core = new ApplicationCreate(opts)
      break
    case 'container':
      core = new ContainerCreate(opts)
      break
    case 'suite':
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
    const {rdTypes, frameworks} = conf

    this.name = await cli.prompt('name of project', {
      required: true,
    })

    if (this.from) {
      this.type = 'container'
      this.rdc = this.from
      return
    }

    const {type, framework} = await inquirer.prompt([
      {
        name: 'type',
        message: 'what kind of project do you want to create?',
        type: 'list',
        choices: Object.keys(rdTypes).map(name => ({name})),
        default: 'application',
      },
      {
        name: 'framework',
        message: 'what kind of framework do you prefer?',
        type: 'list',
        choices: Object.keys(frameworks).map(name => ({name})),
        default: 'vue',
      },
    ])

    if (type === 'application') {
      const name = await cli.prompt('name of container', {
        required: true,
      })

      const version = await cli.prompt('version of container(latest)', {
        required: false,
        default: 'latest',
      })

      this.rdc = `${name}:${version}`
    }

    if (type === 'container') {
      const name = conf.frameworks[this.framework].rdcStarter
      this.rdc = `${name}:latest`
    }

    this.type = type
    this.framework = framework
  }
}
