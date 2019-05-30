import * as chokidar from 'chokidar'
import * as Events from 'events'
import * as fs from 'fs'
import * as path from 'path'

import _ from '../util'

import conf from './conf'
import {logger} from './logger'

export default class Watcher extends Events {
  private readonly mappings: Mapping[] = []
  private readonly copy

  constructor(mappings: Mapping[] = [], copy?) {
    super()
    this.mappings = mappings
    this.copy = copy || _.copy
  }

  public start() {
    const watchFiles = this.mappings.map(item => path.resolve(conf.cwd, item.from))

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

  protected async handler(type: string, filePath: string) {
    const {cwd} = conf
    const {resolve, relative} = path

    const relativeToAppPath = relative(cwd, filePath)

    const mapping = this.mappings.find(item => relativeToAppPath.includes(item.from))

    // 截取从from 到 变动文件的 路径
    const relativeToFromPath = relative(resolve(cwd, mapping.from), filePath)

    // 将相对路径 加在 to 后面，拼成 完整的目标路径
    const destPath = resolve(conf.integrateDir, mapping.to, relativeToFromPath)

    if (['add', 'change', 'addDir'].includes(type)) {
      await this.copy(filePath, destPath, mapping)
    }

    if (type === 'unlink') {
      fs.unlinkSync(destPath)
    }

    if (type === 'unlinkDir') {
      try {
        fs.rmdirSync(destPath)
      } catch (e) {
        if (e) {
          logger.warn(`Directory ${destPath} is not empty, delete filed!`)
        }
      }
    }

    logger.info(`Updated: ${filePath}`)
    this.emit('update')
  }
}
