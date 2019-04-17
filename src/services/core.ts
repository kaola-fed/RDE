// @ts-ignore
import * as extend from 'deep-extend'
import * as fs from 'fs'
// @ts-ignore
import * as beautify from 'js-beautify'
import * as path from 'path'
// @ts-ignore
import * as copy from 'recursive-copy'

import conf from './conf'
import {logger} from './logger'
import npm from './npm'
import render from './render'

export default class Core {
  private rdtDeps: Array<string> = []
  get cwd() {
    return process.cwd()
  }
  get tmpDir() {
    return path.resolve(this.cwd, '.tmp')
  }
  get runtimeDir() {
    return path.resolve(this.cwd, `.${conf.getCliName()}`)
  }
  constructor() {}
  async prepare(rdtName: string) {
    // dependencies
    logger.info('collect rdtDeps...')
    this.collectRdtDeps(rdtName)

    // generate rdt template
    logger.info('compose rdt template...')
    await this.composeTpl()

    // template render
    logger.info('render template...')
    this.renderTpl()

    // 生成最终运行时目录
    logger.info('compose runtime...')
    this.composeRuntime()
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
    const extendRdtName = require(rdtConfPath).extend
    if (!extendRdtName) {
      return
    }
    this.collectRdtDeps(extendRdtName)
  }
  mergeJsonFile(rdtName: string, filename: string) {
    const tmpFilePath = path.resolve(this.tmpDir, filename)
    let currentFile = {}
    if (fs.existsSync(tmpFilePath)) {
      currentFile = require(tmpFilePath)
    }
    const pkgFilePath = path.resolve(this.getRdtPkgDir(rdtName), filename)
    if (!fs.existsSync(pkgFilePath)) {
      logger.info(`${pkgFilePath} cannot be found`)
      process.exit(2)
    }
    const pkgFile = require(pkgFilePath)
    extend(currentFile, pkgFile)
    return currentFile
  }
  // 在临时目录 组装 template
  async composeTpl() {
    for (let rdtName of this.rdtDeps.reverse()) {
      // 覆盖式copy template，先忽略template中的需要合并的配置
      const srcDir = path.resolve(this.getRdtPkgDir(rdtName), 'template')
      const destDir = path.resolve(this.tmpDir, 'template')
      await copy(srcDir, destDir, {overwrite: true})
      // 合并rde.template.js
      const rdtConfPath = path.resolve(this.tmpDir, conf.getRdtConfName())
      const mergedRdtConf = this.mergeJsonFile(rdtName, conf.getRdtConfName())
      render.renderTo('module', {
        obj: beautify.js(JSON.stringify(mergedRdtConf))
      }, rdtConfPath, true)
    }
  }

  renderTpl() {
    const srcDir = path.resolve(this.tmpDir, 'template')
    const destDir = this.runtimeDir
    const rdtConf = require(path.resolve(this.tmpDir, conf.getRdtConfName()))
    render.renderDir(srcDir, {
      ...rdtConf.render.mock
    }, rdtConf.render.includes, destDir)
  }

  async composeRuntime() {
    const appDir = path.resolve(this.cwd, 'app')
    const destDir = path.resolve(this.runtimeDir, 'src')
    await copy(appDir, destDir, {overwrite: true})
    await npm.install('', false, this.runtimeDir)
  }
}
