import * as enquirer from 'enquirer'

import Base from '../base'
import ApplicationCreate from '../core/create/application'
import ContainerCreate from '../core/create/container'
import conf from '../services/conf'
import {logger} from '../services/logger'
import {uploadHubble} from '../services/track'
import _ from '../util'

export default class Create extends Base {
  public static description = 'open RDE world'

  public static examples = [
    '$ rde create',
  ]

  public static flags = {
    ...Base.flags,
  }

  public static args = [{
    name: 'name',
    required: false,
    description: 'project name to create',
  }]

  public name = ''

  public framework = 'vue'

  public rdc = ''

  public rdcRepo = ''

  public async preInit() {
    const {flags, args} = this.parse(Create)
    const {name} = args

    this.name = name
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
    uploadHubble({cmd: 'create'})

    const opts = {
      name: this.name,
      type: conf.rdType,
      framework: this.framework,
      rdc: this.rdc,
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
    }

    await core.start()
  }

  public async postRun() {
    logger.log('Run successfully')
    logger.log('Hello from RDE, explore with:')

    logger.log('==============================')
    logger.log(`$ cd ${this.name}`)
    logger.log('$ git remote add origin <https://repo.git>')
    logger.log('$ rde serve')
    logger.log('==============================')
  }

  public async ask() {
    const {RdTypes, frameworks} = conf

    if (!this.name) {
      const {name} = await enquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of project?',
        required: true,
      })
      this.name = name
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

    const isApp = type === RdTypes.Application
    if (isApp) {
      const frameworkConf = conf.frameworks[framework]
      const {rdcStarter} = frameworkConf

      const {rdcName} = await enquirer.prompt({
        type: 'input',
        name: 'rdcName',
        message: 'What is the name of container on docker hub?',
        required: true,
        initial: rdcStarter,
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
