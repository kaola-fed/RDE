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
    '$ rede init',
  ]

  static args = [{
    name: 'template',
    required: true,
    description: '@rede/template name, listed on website',
    parse: (input: string) => {
      if (input.includes('rdt-')) {
        return input
      } else {
        return `rdt-${input}`
      }
    },
  }]

  private template = ''

  private readonly appScaffoldDir = 'app'

  public async checkArgs() {
    const {args} = this.parse(Init)
    const {template} = args

    if (!_.isEmptyDir(process.cwd())) {
      logger.error('Not an empty directory, please check')
      this.exit(1)
    }

    try {
      await npm.getInfo(template)
    } catch ({response, message}) {
      if (response.status === 404) {
        logger.error(`Cannot find ${template}, please check`)
      } else {
        logger.error(message)
      }
      this.exit(1)
    }

    return args
  }

  public async initialize(args: any) {
    this.template = args.template

    const prompts = await this.prompt()

    logger.info(`Installing ${this.template}. This might take a while...`)
    await writePkgJson({name: prompts.packageName})

    await npm.install(this.template)
  }

  async run() {
    const cwd = process.cwd()
    const srcDir = path.resolve(cwd, 'node_modules', this.template, this.appScaffoldDir)
    const destDir = path.resolve(cwd, 'app')

    await ncp(srcDir, destDir)
  }

  public async postRun() {
    logger.complete('Created project')
    logger.star('Start with command:')
    logger.star('$ rede run dev')
  }

  private async prompt() {
    const cwdDirName = path.basename(process.cwd())
    const packageName = await cli.prompt(`package name: (${cwdDirName})`, {
      required: false,
      default: cwdDirName,
    })

    return {
      packageName,
    }
  }
}
