import cli from 'cli-ux'
import * as inquirer from 'inquirer'
// @ts-ignore
import * as path from 'path'
import * as copy from 'recursive-copy'
// @ts-ignore
import * as writePkgJson from 'write-pkg'

import Base from '../base'
import conf from '../services/conf'
import {logger} from '../services/logger'
import npm from '../services/npm'
import render from '../services/render'
import _ from '../util'

export default class Create extends Base {
  static description = 'create a rde project'

  static examples = [
    '$ rde create <appname>',
  ]

  static args = [{
    name: 'appName',
    required: false,
    description: 'app name',
  }]

  public appName = ''

  public rdtName = ''

  public async preInit() {
    const {args} = this.parse(Create)
    this.appName = args.appName
    return args
  }

  public async initialize() {
    await this.ask()
  }

  public async preRun() {
    await _.asyncExec(`mkdir ${this.appName}`)
    process.chdir(this.appName)

    await writePkgJson({name: this.appName})
    await npm.install(`${this.rdtName}`)

    const appConfName = conf.getAppConfName()
    await render.renderTo(appConfName.slice(0, -3), {
      templateName: this.rdtName,
    }, appConfName)

    const {template} = conf.getRdtConf()
    const {app} = conf.getAppConf()
    app.readme.template = template.docs.homepage
    await render.renderTo('module', {
      obj: app
    }, appConfName, {overwrite: true})
  }

  public async run() {
    const srcDir = conf.getRdtAppDir()
    const destDir = path.resolve(this.cwd, 'app')

    await copy(srcDir, destDir)
  }

  public async postRun() {
    logger.complete(`Created project: ${this.appName}`)
    logger.star('Start with command:')
    logger.star('$ rde run serve')
  }

  public async ask() {
    const {framework} = await inquirer.prompt([{
      name: 'framework',
      message: 'select a framework',
      type: 'list',
      choices: Object.keys(this.frameworks).map(name => ({name}))
    }])

    const defaultRdt = this.frameworks[framework].rdtStarter
    this.rdtName = await cli.prompt(`template package name: (${defaultRdt})`, {
      required: false,
      default: defaultRdt,
    })

    if (!(await npm.getInfo(this.rdtName))) {
      throw Error(`Cannot find ${this.rdtName}, please check`)
    }
  }
}
