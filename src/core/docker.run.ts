import * as extend from 'deep-extend'
import * as fs from 'fs'
import * as path from 'path'

import conf from '../services/conf'
import {debug} from '../services/logger'
import render from '../services/render'
import sync from '../services/sync'
import Watcher from '../services/watcher'
import _ from '../util'

type Config = (RdcConf & AppConf) | (RdcConf)
const {resolve} = path
const {
  templateDir,
  integrateDir,
  runtimeDir,
  dockerWorkDirRoot,
  RdTypes,
} = conf

export default class DockerRun {
  private readonly watch: boolean
  private config

  constructor({watch}) {
    this.watch = watch
  }

  public async start() {
    // merge rda.config rdc config
    this.config = await this.mergeRdcConf()

    if (conf.isIntegrate) {
      // template render to .integrated
      await this.renderDir(templateDir, integrateDir)
      // compose rde and watch app
      await this.composeRde()

    } else {
      // template render to runtime
      await this.renderDir(templateDir, runtimeDir)
    }

    if (conf.rdType === RdTypes.Application) {
      await sync.mergePkgJson(
        resolve(dockerWorkDirRoot, 'app', 'package.json'),
        resolve(dockerWorkDirRoot, templateDir, 'package.json'),
        resolve(dockerWorkDirRoot, conf.rdeDir)
      )
    }

    if (this.watch && conf.rdType === RdTypes.Container) {
      await this.watchTemplate(conf.rdeDir)
    }
  }

  public async mergeRdcConf(): Promise<Config> {
    const {
      cwd,
      appConfName,
      rdcConfName,
    } = conf

    let config = require(resolve(cwd, rdcConfName))

    const rdaConfPath = resolve(cwd, appConfName)
    if (fs.existsSync(rdaConfPath)) {
      config = extend(config, require(rdaConfPath))
    }

    conf.rdMode = config.mode || conf.RdModes.Integrate

    return config
  }

  public async renderDir(from, to) {
    // @ts-ignore
    const {render: rdtRender = {} as any, container, suites} = this.config

    const {includes = []} = rdtRender

    if (suites && suites.length) {
      container.render.suites = suites.map(item => {
        const arr = item.split('/')
        let alias = item
        if (arr.length > 1) {
          alias = arr[1]
        }
        alias = alias.replace(/[-_]/gim, '').toUpperCase()

        return {
          name: item,
          alias,
        }
      })
    }

    const dataView = container ? container.render : rdtRender.mock || {}

    const options: any = {
      overwrite: true,
      dot: true,
    }

    if (conf.isIntegrate) {
      options.filter = /.*(?<!\.d\.ts)$/
    }

    await render.renderDir(from, {
      ...dataView
    }, includes, to, options)
  }

  public async composeRde() {
    debug(`merged mappings: ${JSON.stringify(this.config.mappings)}`)

    for (let {from, to, options} of this.config.mappings) {
      const appDir = resolve(conf.cwd, from)
      const destDir = resolve(integrateDir, to)

      if (!options || options.filter) {
        options = options || {}
        options.filter = /.*(?<!\.d\.ts)$/
      }

      await _.copy(appDir, destDir, {options})
    }

    if (this.watch) {
      let {mappings} = this.config

      new Watcher(mappings).start()
    }
  }

  public async watchTemplate(dest) {
    const mappings = [{
      from: templateDir,
      to: dest
    }]

    new Watcher(mappings, this.renderDir.bind(this)).start()
  }
}
