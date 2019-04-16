import {exec} from 'child_process'
import cli from 'cli-ux'
import * as fs from 'fs'
// @ts-ignore
import {ncp} from 'ncp'
import * as path from 'path'
import * as process from 'process'
import * as util from 'util'
// @ts-ignore
import * as writePkgJson from 'write-pkg'

import Base from '../../base'
import conf from '../../services/conf'
import {logger} from '../../services/logger'
import npm from '../../services/npm'
import render from '../../services/render'

const asyncExec = util.promisify(exec)

export default class Create extends Base {
  static description = 'create a rde template project'

  static examples = [
    '$ rde template:create <rdtname>',
  ]

  static args = [{
    name: 'rdtName',
    required: false,
    description: 'package name, used by package.json',
  }]

  readonly baseRdtName = '@rede/rdt-helloworld'

  private rdtName = ''

  public async initialize() {
    await this.prompt()

    await asyncExec(`mkdir ${this.rdtName}`)

    process.chdir(path.resolve(process.cwd(), this.rdtName))

    logger.info(`Installing ${this.rdtName}. This might take a while...`)

    await writePkgJson({name: this.rdtName})

    await npm.install(this.baseRdtName)

    await asyncExec('rm package*.json')
  }

  getBaseRdtProjectDir() {
    const cwd = process.cwd()
    return path.resolve(cwd, 'node_modules', this.baseRdtName)
  }

  async render() {
    const cwd = process.cwd()
    const srcDir = path.resolve(this.getBaseRdtProjectDir(), 'template')

    const destDir = path.resolve(cwd, 'template')

    const rdtConf = require(path.resolve(this.getBaseRdtProjectDir(), conf.getRdtConfName()))
    await render.renderDir(srcDir, {
      ProjectName: this.rdtName
    }, rdtConf.render.includes, destDir, rdtConf.render.tags)
  }

  async run() {
    const cwd = process.cwd()
    const srcDir = path.resolve(cwd, 'node_modules', this.baseRdtName)
    const destDir = path.resolve(cwd)

    await ncp(srcDir, destDir)
  }

  public async postRun() {
    logger.complete('Created project')
    logger.star('Start with command:')
    logger.star('$ rde run serve')
  }

  private async prompt() {
    this.rdtName = await cli.prompt('template name: (rdt-{name})', {
      required: true
    })

    if (!this.rdtName.includes('rdt-')) {
      this.rdtName = `rdt-${this.rdtName}`
    }

    if (fs.existsSync(path.resolve(process.cwd(), this.rdtName))) {
      logger.error(`${this.rdtName} directory is already existed`)
      this.exit(1)
    }

    try {
      await npm.getInfo(this.rdtName)
      logger.error(`npm module ${this.rdtName} is existed, please rename and try again`)
      this.exit(1)
    } catch ({response, message}) {
      if (response.status !== 404) {
        logger.error(message)
        this.exit(1)
      }
    }
  }
}
