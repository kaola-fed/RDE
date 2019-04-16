import {exec} from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import * as copy from 'recursive-copy'
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
    required: true,
    description: 'rde template project name, used by package.json',
  }]

  readonly baseRdtName = '@rede/rdt-helloworld'

  private rdtName = ''

  get rdtPkgDir() {
    return path.resolve(this.cwd, 'node_modules', this.baseRdtName)
  }

  public async preInit() {
    const {args} = this.parse(Create)
    // check rdtName start with rdt-
    if (args.rdtName.includes('rdt-')) {
      this.rdtName = args.rdtName
    } else {
      this.rdtName = `rdt-${this.rdtName}`
    }

    await asyncExec(`rm -rf ${path.resolve(this.cwd, this.rdtName)}`)

    // check rdtName directory is not existed
    if (fs.existsSync(path.resolve(this.cwd, this.rdtName))) {
      logger.error(`${this.rdtName} directory is already existed`)
      this.exit(1)
    }

    // check npm rdtName module is not existed
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

  public async initialize() {
    await asyncExec(`mkdir ${this.rdtName}`)

    process.chdir(this.rdtName)

    logger.info(`Installing ${this.baseRdtName}. This might take a while...`)

    await writePkgJson({name: this.rdtName})

    await npm.install(this.baseRdtName)

    await asyncExec('rm package*.json')
  }

  async render() {
    await Promise.all([
      this.renderTemplate(),
      this.copyPkgToCwd('app', 'app'),
      this.copyPkgToCwd('rde.template.js', 'rde.template.js'),
      this.copyPkgToCwd('.npmignore', '.gitignore'),
      this.renderOther()
    ])
  }

  async renderTemplate() {
    const srcDir = path.resolve(this.rdtPkgDir, 'template')

    const destDir = path.resolve(this.cwd, 'template')

    const rdtConf = require(path.resolve(this.rdtPkgDir, conf.getRdtConfName()))
    await render.renderDir(srcDir, {
      ProjectName: this.rdtName
    }, ['.json', '.html', '.js'], destDir, rdtConf.render.tags)
  }

  async copyPkgToCwd(src: string, dest: string) {
    const srcDir = path.resolve(this.rdtPkgDir, src)
    const destDir = path.resolve(this.cwd, dest)

    await copy(srcDir, destDir)
  }

  async renderOther() {
    // package.json: 赋值name,description,keywords,除去下划线开头的配置
    const pkgConfig = require(path.resolve(this.rdtPkgDir, 'package.json'))
    pkgConfig.name = this.rdtName
    pkgConfig.description = `${this.rdtName} rede-template`
    pkgConfig.keywords = [this.rdtName, 'rede-template']
    Object.keys(pkgConfig).forEach(item => {
      if (item[0] === '_') {
        delete pkgConfig[item]
      }
    })
    writePkgJson(pkgConfig)
  }

  async run() {
    await asyncExec('rm -rf node_modules')
    await npm.install('', false, this.cwd)
  }

  public async postRun() {
    logger.complete('Created project')
    logger.star('Start with command:')
    logger.star('$ rde run serve')
  }
}
