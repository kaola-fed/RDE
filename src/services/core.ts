import * as extend from 'deep-extend'
import * as fs from 'fs'
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

  constructor(rdtNameOrPath: string) {
    this.rdtName = rdtNameOrPath
  }

  public async prepare() {
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

  public getRdtPkgDir(rdtName: string) {
    return path.resolve(conf.cwd, 'node_modules', rdtName)
  }

  public collectRdtDeps(rdtName: string) {
    this.rdtDeps.push(rdtName)
    const rdtConfPath = path.resolve(this.getRdtPkgDir(rdtName), conf.rdtConfName)

    const extendRdtName = _.ensureRequire(rdtConfPath).extend
    if (!extendRdtName) {
      return
    }
    this.collectRdtDeps(extendRdtName)
  }

  public mergeJsonFile(rdtName: string, filename: string) {
    const tmpFilePath = path.resolve(conf.tmpDir, filename)
    let currentFile = {}
    if (fs.existsSync(tmpFilePath)) {
      currentFile = _.ensureRequire(tmpFilePath)
    }

    const pkgFilePath = path.resolve(this.getRdtPkgDir(rdtName), filename)
    const pkgFile = _.ensureRequire(pkgFilePath)

    extend(currentFile, pkgFile)
    return currentFile
  }

  // 在临时目录 组装 template
  public async composeTpl() {
    await _.asyncExec(`rm -rf ${conf.tmpDir}`)

    for (let rdtName of this.rdtDeps.reverse()) {
      // 覆盖式copy template，先忽略template中的需要合并的配置
      const srcDir = path.resolve(this.getRdtPkgDir(rdtName), 'template')
      const destDir = path.resolve(conf.tmpDir, 'template')
      await copy(srcDir, destDir, {overwrite: true})

      // 合并rde.template.js
      const rdtConfPath = path.resolve(conf.tmpDir, conf.rdtConfName)
      const mergedRdtConf = this.mergeJsonFile(rdtName, conf.rdtConfName)

      await render.renderTo('module', {
        obj: mergedRdtConf
      }, rdtConfPath, {overwrite: true})
    }
  }

  public async renderTpl() {
    const srcDir = path.resolve(conf.tmpDir, 'template')
    const destDir = conf.runtimeDir
    const rdtConfRender = conf.getTmpRdtConf().render

    await render.renderDir(srcDir, {
      ...rdtConfRender.mock
    }, rdtConfRender.includes, destDir, {
      overwrite: true
    })
  }

  public async composeRuntime() {
    // 根据配置文件中的mapping，覆盖式copy
    const mapping = conf.getTmpRdtConf().mapping
    for (let item of mapping) {
      const appDir = path.resolve(conf.cwd, 'app', item.from)
      const destDir = path.resolve(conf.runtimeDir, item.to)
      await copy(appDir, destDir, {overwrite: true})
    }

    await npm.install('', false, conf.runtimeDir)
  }
}
