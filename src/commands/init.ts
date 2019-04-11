import cli from 'cli-ux'
// @ts-ignore
import {getNpmInfo} from 'ice-npm-utils'
// @ts-ignore
import {ncp} from 'ncp'
import * as path from 'path'
// @ts-ignore
import * as writePkgJson from 'write-pkg'

import Base from '../base'
import {logger} from '../logger'
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
      if (input.includes('@rede/template')) {
        return input
      } else {
        return `@rede/template-${input}`
      }
    },
  }]

  private template = ''

  private templateConf: any = {}

  public async checkArgs() {
    const {args} = this.parse(Init)
    const {template} = args

    if (!_.isEmptyDir(process.cwd())) {
      logger.error('not an empty directory, please check')
      this.exit(1)
    }

    try {
      await getNpmInfo(template)
    } catch ({response, message}) {
      if (response.status === 404) {
        logger.error(`cannot find ${template}, please check`)
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

    await writePkgJson({name: prompts.packageName})

    await _.installPkg(this.template)

    const confPath = path.resolve(process.cwd(), 'node_modules', this.template, Base.templateConf)
    this.templateConf = require(confPath)
  }

  async run() {
    const {appScaffold} = this.templateConf
    const cwd = process.cwd()
    const srcDir = path.resolve(cwd, 'node_modules', this.template, appScaffold)

    await ncp(srcDir, cwd)
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
