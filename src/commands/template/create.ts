import {exec} from 'child_process'
// @ts-ignore
import * as extend from 'deep-extend'
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
  private rdtDependencies: Array<string> = []

  public getRdtPkgDir(rdtName: string) {
    return path.resolve(this.cwd, 'node_modules', rdtName)
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

    await npm.install(this.baseRdtName, false)

    await asyncExec('rm package*.json')

    this.setRdtDependencies(this.baseRdtName)
  }
  // 收集rdt依赖
  setRdtDependencies(rdtName: string) {
    this.rdtDependencies.push(rdtName)
    const rdtConfPath = path.resolve(this.getRdtPkgDir(rdtName), conf.getRdtConfName())
    if (!fs.existsSync(rdtConfPath)) {
      logger.error(`${rdtConfPath} cannot be found`)
      this.exit(1)
    }
    const extendRdtName = require(rdtConfPath).extend
    if (!extendRdtName) {
      return
    }
    this.setRdtDependencies(extendRdtName)
  }

  async render() {
    for (let rdtName of this.rdtDependencies.reverse()) {
      await this.renderRdt(rdtName)
    }
  }

  async renderRdt(rdtName: string) {
    await this.copyPkgToCwd(rdtName, '', '')
    await Promise.all([
      this.renderTemplate(rdtName),
      this.copyPkgToCwd(rdtName, 'app', 'app'),
      this.copyPkgToCwd(rdtName, '.npmignore', '.gitignore'),
      this.renderRdtConf(rdtName),
      this.renderPkgJson(rdtName)
    ])
  }

  async renderTemplate(rdtName: string) {
    const srcDir = path.resolve(this.getRdtPkgDir(rdtName), 'template')

    const destDir = path.resolve(this.cwd, 'template')

    const rdtConf = require(path.resolve(this.getRdtPkgDir(rdtName), conf.getRdtConfName()))
    await render.renderDir(srcDir, {
      ProjectName: this.rdtName
    }, rdtConf.render.includes, destDir, {overwrite: true}, rdtConf.render.tags)
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

  mergeJsonFile(rdtName: string, filename: string) {
    const currentFilePath = path.resolve(this.cwd, filename)
    let currentFile = {}
    if (fs.existsSync(currentFilePath)) {
      currentFile = require(currentFilePath)
    }
    const pkgFilePath = path.resolve(this.getRdtPkgDir(rdtName), filename)
    if (!fs.existsSync(pkgFilePath)) {
      logger.info(`${pkgFilePath} cannot be found`)
      this.exit(1)
    }
    const pkgFile = require(pkgFilePath)
    extend(currentFile, pkgFile)
    return currentFile
  }

  // deep-extend 模式 合并rdtConf
  async renderRdtConf(rdtName: string) {
    const rdtConfPath = path.resolve(this.getRdtPkgDir(rdtName), conf.getAppConfName())
    const mergedRdtConf = this.mergeJsonFile(rdtName, conf.getRdtConfName())
    fs.writeFileSync(rdtConfPath, mergedRdtConf, {encoding: 'UTF-8'})
  }

  async renderPkgJson(rdtName: string) {
    const mergedPkgJson: any = this.mergeJsonFile(rdtName, 'package.json')
    // package.json: 赋值name,description,keywords,除去下划线开头的配置
    mergedPkgJson.name = this.rdtName
    mergedPkgJson.description = `${this.rdtName} rede-template`
    mergedPkgJson.keywords = [this.rdtName, 'rede-template']
    Object.keys(mergedPkgJson).forEach(item => {
      if (item[0] === '_') {
        delete mergedPkgJson[item]
      }
    })
    writePkgJson(mergedPkgJson)
  }

  async run() {
    await asyncExec('rm -rf node_modules')
    await npm.install('', false, this.cwd)
  }

  public async postRun() {
    logger.complete('Created project')
    logger.star('Start with command:')
    logger.star('$ rde template serve')
  }
}
