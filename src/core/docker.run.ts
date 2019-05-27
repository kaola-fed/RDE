import * as path from 'path'

import conf from '../services/conf'
import ide from '../services/ide'
import {debug} from '../services/logger'
import render from '../services/render'
import sync from '../services/sync'
import Watcher from '../services/watcher'
import _ from '../util'

const {resolve} = path

const {
  RdTypes,
  dockerRdcDir,
  dockerRdaDir,
  dockerWorkDirRoot,
  appConfName,
  rdcConfName,
} = conf
export default class DockerRun {
  private readonly watch: boolean

  public get dataView() {
    if (conf.rdType === RdTypes.Application) {
      const appConf = require(resolve(dockerWorkDirRoot, appConfName))
      const {container = {}, suites = {}} = appConf

      if (suites && suites.length) {
        container.render = container.render || {}
        container.render.suites = suites
      }

      debug('docker:run dataView: ', container.render)
      return container.render || {}
    }

    if (conf.rdType === RdTypes.Container) {
      const rdcConf: RdcConf = require(resolve(dockerRdcDir, rdcConfName))
      rdcConf.render = rdcConf.render || {}

      debug('docker:run dataView: ', rdcConf.render.mock)
      return rdcConf.render.mock || {}
    }
  }

  public get includes() {
    const rdcConf: RdcConf = require(resolve(dockerRdcDir, rdcConfName))
    rdcConf.render = rdcConf.render || {}

    debug('docker:run includes: ', rdcConf.render.includes)
    return rdcConf.render.includes || []
  }

  public get exportFiles() {
    const rdcConf: RdcConf = require(resolve(dockerRdcDir, rdcConfName))
    rdcConf.exportFiles = rdcConf.exportFiles || []

    debug('docker:run export Files: ', rdcConf.exportFiles)
    return rdcConf.exportFiles
  }

  public get ignoredFiles() {
    if (conf.isApp) {
      return [
        ...this.exportFiles,
        ...conf.appBasicFiles,
        'node_modules',
      ]
    }

    return []
  }

  constructor({watch}) {
    this.watch = watch
  }

  public async start() {
    // render /rdc dir to /rde
    await this.renderDir()

    if (conf.isApp) {
      // add vscode settings to local .vscode/settings.json
      // filter everything except exportFiles and appBasicFiles
      await _.asyncExec('mkdir -p .vscode')
      const ignore = this.ignoredFiles.concat(['rdc', 'rda'])
      await ide.initAppExcludeSettings(ignore)

      // merge appPkgJson & rdcPkgJson to /rde
      await sync.mergePkgJson(
        resolve(dockerRdaDir, 'package.json'),
        resolve(dockerRdcDir, 'package.json'),
        resolve(dockerWorkDirRoot),
      )
    }
  }

  public async renderDir() {
    let ignore = this.ignoredFiles
    if (conf.isApp) {
      ignore = ignore.concat(['package.json'])
    }

    await render.renderDir(dockerRdcDir, {
      ...this.dataView
    }, this.includes, dockerWorkDirRoot, {
      overwrite: true,
      dot: true,
      filter(src) {
        return !ignore.some(item => {
          const escaped = item.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
          const regexp = new RegExp(`^${escaped}`)
          return regexp.test(src)
        })
      },
    })

    if (
      this.watch &&
      conf.rdType === RdTypes.Container
    ) {
      new Watcher([{
        from: dockerRdcDir,
        to: dockerWorkDirRoot,
      }]).start()
    }
  }
}
