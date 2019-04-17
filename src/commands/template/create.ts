import {exec} from 'child_process'
// @ts-ignore
import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import * as copy from 'recursive-copy'
import * as util from 'util'
// @ts-ignore
import * as writePkgJson from 'write-pkg'

import Base from '../../base'
import {logger} from '../../services/logger'
import npm from '../../services/npm'

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
  private rdtDependencies: string[] = []

  public getRdtPkgDir(rdtName: string) {
    return path.resolve(this.cwd, 'node_modules', rdtName)
  }

  public async preInit() {
    const {args} = this.parse(Create)
    // check rdtName start with rdt-   sda
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

    await npm.install(this.baseRdtName, false)

    await asyncExec('rm package*.json')
  }

  public async preRun() {
    // 从node_modules 中copy到当前目录
    await this.copyPkgToCwd(this.baseRdtName, '', '')
     // 处理 .gitignore
    await this.copyPkgToCwd(this.baseRdtName, '.npmignore', '.gitignore')
    // 处理package.json，赋值name、description、keywords，去掉_开头的属性
    this.renderPkgJson()
  }
  // 覆盖式copy
  async copyPkgToCwd(rdtName: string, src: string, dest: string) {
    const srcDir = path.resolve(this.getRdtPkgDir(rdtName), src)
    if (!fs.existsSync(srcDir)) {
      return
    }
    const destDir = path.resolve(this.cwd, dest)

    await copy(srcDir, destDir, {overwrite: true})
  }
  renderPkgJson() {
    const pkgJson = require(path.resolve(this.cwd, 'package.json'))
    pkgJson.name = this.rdtName
    pkgJson.description = `${this.rdtName} rde-template`
    pkgJson.keywords = [this.rdtName, 'rde-template']
    Object.keys(pkgJson).forEach(item => {
      if (item[0] === '_') {
        delete pkgJson[item]
        delete pkgJson[item]
      }
    })
    writePkgJson(pkgJson)
  }

  async run() {
    await asyncExec('rm -rf node_modules')
    await npm.install('', false, this.cwd)
  }

  public async postRun() {
    logger.complete('Created project')
    logger.star('Start with command:')
    logger.star('$ rde template:serve')
  }
}
