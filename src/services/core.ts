import * as extend from 'deep-extend'
import * as fs from 'fs'
// @ts-ignore
import * as beautify from 'js-beautify'
import * as path from 'path'
// @ts-ignore
import * as copy from 'recursive-copy'

import _ from '../util'

import conf from './conf'
import {logger} from './logger'
import npm from './npm'
import render from './render'

export default class Core {
  private readonly rdtDeps: string[] = []

  private readonly rdtName: string

  get cwd() {
    return process.cwd()
  }

  get tmpDir() {
    return path.resolve(this.cwd, '.tmp')
  }

  get runtimeDir() {
    return path.resolve(this.cwd, `.${conf.getCliName()}`)
  }

  get rdtConf() {
    return _.ensureRequire(path.resolve(this.tmpDir, conf.getRdtConfName()))
  }

  constructor(rdtNameOrPath: string) {
    this.rdtName = rdtNameOrPath
  }

  async prepare() {
    // dependencies
    logger.info('Start collecting rdtDeps...')
    this.collectRdtDeps(this.rdtName)

    // generate rdt template
    logger.info('Start composing rdt template...')
    await this.composeTpl()

    // template render
    logger.info('Start rendering template...')
    await this.renderTpl()

    // 生成最终运行时目录
    logger.info('Start composing runtime directory...')
    await this.composeRuntime()
  }

  getRdtPkgDir(rdtName: string) {
    return path.resolve(this.cwd, 'node_modules', rdtName)
  }

  collectRdtDeps(rdtName: string) {
    this.rdtDeps.push(rdtName)
    const rdtConfPath = path.resolve(this.getRdtPkgDir(rdtName), conf.getRdtConfName())
    if (!fs.existsSync(rdtConfPath)) {
      logger.error(`${rdtConfPath} cannot be found`)
      process.exit(2)
    }
    const extendRdtName = _.ensureRequire(rdtConfPath).extend
    if (!extendRdtName) {
      return
    }
    this.collectRdtDeps(extendRdtName)
  }

  mergeJsonFile(rdtName: string, filename: string) {
    const tmpFilePath = path.resolve(this.tmpDir, filename)
    let currentFile = {}
    if (fs.existsSync(tmpFilePath)) {
      currentFile = _.ensureRequire(tmpFilePath)
    }
    const pkgFilePath = path.resolve(this.getRdtPkgDir(rdtName), filename)
    if (!fs.existsSync(pkgFilePath)) {
      logger.info(`${pkgFilePath} cannot be found`)
      process.exit(2)
    }
    const pkgFile = _.ensureRequire(pkgFilePath)
    extend(currentFile, pkgFile)
    return currentFile
  }

  // 在临时目录 组装 template
  async composeTpl() {
    // await _.asyncExec(`rm -rf ${this.tmpDir}`)
    for (let rdtName of this.rdtDeps.reverse()) {
      // 覆盖式copy template，先忽略template中的需要合并的配置
      const srcDir = path.resolve(this.getRdtPkgDir(rdtName), 'template')
      const destDir = path.resolve(this.tmpDir, 'template')
      await copy(srcDir, destDir, {overwrite: true})
      // 合并rde.template.js
      const rdtConfPath = path.resolve(this.tmpDir, conf.getRdtConfName())
      const mergedRdtConf = this.mergeJsonFile(rdtName, conf.getRdtConfName())
      await render.renderTo('module', {
        obj: beautify.js(JSON.stringify(mergedRdtConf))
      }, rdtConfPath, true)
    }
  }

  async renderTpl() {
    const srcDir = path.resolve(this.tmpDir, 'template')
    const destDir = this.runtimeDir
    const rdtConfRender = this.rdtConf.render
    await render.renderDir(srcDir, {
      ...rdtConfRender.mock,
      ProjectName: 'MyProject'
    }, rdtConfRender.includes, destDir, {
      overwrite: true
    })
  }

  async composeRuntime() {
    // 根据配置文件中的mapping，覆盖式copy
    for (let item of this.rdtConf.mapping) {
      const appDir = path.resolve(this.cwd, 'app', item.from)
      const destDir = path.resolve(this.runtimeDir, item.to)
      await copy(appDir, destDir, {overwrite: true})
    }
    logger.info('Installing runtime dependencies...')
    await npm.install('', false, this.runtimeDir)
  }
}
