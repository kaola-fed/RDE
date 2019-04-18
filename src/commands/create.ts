import {exec} from 'child_process'
import cli from 'cli-ux'
// @ts-ignore
import * as path from 'path'
import * as copy from 'recursive-copy'
import * as util from 'util'
// @ts-ignore
import * as writePkgJson from 'write-pkg'

import Base from '../base'
import conf from '../services/conf'
import {logger, spinner} from '../services/logger'
import npm from '../services/npm'
import render from '../services/render'

const asyncExec = util.promisify(exec)

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

  private appName = ''

  private rdtName = ''

  public async preInit() {
    const {args} = this.parse(Create)
    return args
  }

  public async initialize(args: any) {
    this.appName = args.appName

    await this.prompt()

    await asyncExec(`mkdir ${this.appName}`)

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

  async run() {
    const srcDir = conf.getRdtAppDir()
    const destDir = path.resolve(this.cwd, 'app')

    await copy(srcDir, destDir)
  }

  public async postRun() {
    logger.complete(`Created project: ${this.appName}`)
    logger.star('Start with command:')
    logger.star('$ rde run serve')
  }

  private async prompt() {
    const defaultRdt = 'vuecli-basic'

    this.rdtName = await cli.prompt(`template name: (${defaultRdt})`, {
      required: false,
      default: defaultRdt,
    })

    if (!this.rdtName.includes('rdt-')) {
      this.rdtName = `rdt-${this.rdtName}`
    }

    try {
      await npm.getInfo(this.rdtName)
    } catch ({response, message}) {
      if (response.status === 404) {
        logger.error(`Cannot find ${this.rdtName}, please check`)
      } else {
        logger.error(message)
      }
      this.exit(1)
    }
  }
}
