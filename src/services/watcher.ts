import * as chokidar from 'chokidar'
import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import * as copy from 'recursive-copy'
import * as through from 'through2'

import conf from './conf'
import {logger} from './logger'

export default class Watcher {
  private readonly mappings: Mapping[] = []

  constructor(mappings: Mapping[] = []) {
    this.mappings = mappings
  }

  public start() {
    const watchFiles = this.mappings.map((item: any) => path.resolve(conf.cwd, item.from))
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
    const cwd = conf.cwd
    const mapping = this.mappings
    const {resolve, relative} = path
    // 获取相对于 app 目录的路径
    const relativeToAppPath = relative(cwd, filePath)
    // 从 mappping 中找到匹配的规则
    const mappingItem = mapping.find((item: any) => relativeToAppPath.includes(item.from))
    // 截取从from 到 变动文件的 路径
    const relativeToFromPath = relative(resolve(cwd, mappingItem.from), filePath)
    // 将相对路径 加在 to 后面，拼成 完整的目标路径
    const destPath = resolve(conf.runtimeDir, mappingItem.to, relativeToFromPath)

    if (['add', 'change', 'addDir'].includes(type)) {
      await copy(filePath, destPath, {
        overwrite: true,
        dot: true,
        transform: () => {
          return through((chunk, _enc, done) => {
            const output = mappingItem.transform ? mappingItem.transform(filePath, destPath) : chunk.toString()
            done(null, output)
          })
        }
      })
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
  }
}
