import cli from 'cli-ux'
// @ts-ignore
import {ncp} from 'ncp'
import * as path from 'path'
// @ts-ignore
import * as writePkgJson from 'write-pkg'

import Base from '../base'
import {logger} from '../services/logger'
import npm from '../services/npm'
import _ from '../util'

export default class Init extends Base {
  static description = 'create a rede project'

  static examples = [
    '$ rede create <appname>',
  ]

  static args = [{
    name: 'appName',
    required: true,
    description: 'package name, used by package.json',
  }]

  private appName = ''

  private rdtName = ''

  private readonly appScaffoldDir = 'app'

  public async checkArgs() {
    const {args} = this.parse(Init)

    if (!_.isEmptyDir(process.cwd())) {
      logger.error('Not an empty directory, please check')
      this.exit(1)
    }

    return args
  }

  public async initialize(args: any) {
    this.appName = args.appName

    await this.prompt()

    logger.info(`Installing ${this.rdtName}. This might take a while...`)
    await writePkgJson({name: this.appName})

    await npm.install(this.rdtName)
  }

  async run() {
    const cwd = process.cwd()
    const srcDir = path.resolve(cwd, 'node_modules', this.rdtName, this.appScaffoldDir)
    const destDir = path.resolve(cwd, 'app')

    await ncp(srcDir, destDir)
  }

  public async postRun() {
    logger.complete('Created project')
    logger.star('Start with command:')
    logger.star('$ rede run dev')
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
