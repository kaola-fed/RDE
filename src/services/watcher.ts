import * as chokidar from 'chokidar'
import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import * as copy from 'recursive-copy'

import _ from '../util'

import conf from './conf'

export default class Watcher {
  private readonly mapping: Mapping[] = []

  public get cwd() {
    return process.cwd()
  }

  public get tmpDir() {
    return path.resolve(this.cwd, '.tmp')
  }

  public get rdtConf() {
    return _.ensureRequire(path.resolve(this.tmpDir, conf.getRdtConfName()))
  }

  constructor(mapping?: Mapping[]) {
    if (mapping) {
      this.mapping = mapping
    } else {
      this.mapping = this.rdtConf.mapping
    }
  }

  public start() {
    const cwd = this.cwd
    const watchFiles = this.mapping.map((item: any) => path.resolve(cwd, 'app', item.from))
    const watcher = chokidar.watch(watchFiles, {
      ignored: /(\.git)|(node_modules)/,
      ignoreInitial: true,
      interval: 300,
      binaryInterval: 300
    })
    watcher.on('add', path => this.handler('add', path))
      .on('change', path => this.handler('change', path))
      .on('unlink', path => this.handler('unlink', path))
      .on('addDir', path => this.handler('addDir', path))
      .on('unlinkDir', path => this.handler('unlinkDir', path))
  }

  public async handler(type: string, filePath: string) {
    const cwd = this.cwd
    const mapping = this.mapping
    const relativePath = path.relative(path.resolve(cwd, 'app'), filePath)
    const mappingItem = mapping.find((item: any) => relativePath.includes(item.from))
    const tmpPath = path.relative(path.resolve(cwd, 'app', mappingItem.from), filePath)
    const destPath = path.resolve(cwd, `.${conf.getCliName()}`, mappingItem.to, tmpPath)
    if (['add', 'change', 'addDir'].includes(type)) {
      await copy(filePath, destPath, {
        overwrite: true,
        dot: true
      })
    }
    if (type === 'unlink') {
      fs.unlinkSync(destPath)
    }
    if (type === 'unlinkDir') {
      fs.rmdirSync(destPath)
    }
  }
}
