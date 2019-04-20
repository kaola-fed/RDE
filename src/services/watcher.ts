import * as chokidar from 'chokidar'
import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import * as copy from 'recursive-copy'

import conf from './conf'

export default class Watcher {
  private readonly mappings: Mapping[] = []

  constructor(mappings: Mapping[] = []) {
    this.mappings = mappings
  }

  public start() {
    const watchFiles = this.mappings.map((item: any) => path.resolve(conf.cwd, 'app', item.from))
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
    const relativeToAppPath = relative(path.resolve(cwd, 'app'), filePath)
    // 从 mappping 中找到匹配的规则
    const mappingItem = mapping.find((item: any) => relativeToAppPath.includes(item.from))
    // 截取从from 到 变动文件的 路径
    const relativeToFromPath = relative(resolve(cwd, 'app', mappingItem.from), filePath)
    // 将相对路径 加在 to 后面，拼成 完整的目标路径
    const destPath = resolve(conf.runtimeDir, mappingItem.to, relativeToFromPath)

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
