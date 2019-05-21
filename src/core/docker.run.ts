import * as extend from 'deep-extend'
import * as fs from 'fs'
import * as path from 'path'
import * as copy from 'recursive-copy'

import conf from '../services/conf'
import {debug} from '../services/logger'
import render from '../services/render'
import Watcher from '../services/watcher'
import _ from '../util'

type Config = (RdcConf & AppConf) | (RdcConf)
const {resolve} = path

export default class DockerRun {
  private readonly watch: boolean

  constructor({watch}) {
    this.watch = watch
  }

  public async start() {
    let config
    // generate rdt template from rdt chain
    config = await this.copyToTmp()

    // template render to .rde
    await this.renderDir(conf.tmpDir, config)

    // start watcher
    await this.composeRde(config)
  }

  public async copyToTmp(): Promise<Config> {
    const {
      cwd,
      tmpDir,
      appConfName,
      rdcConfName,
      runtimeDir,
      rdeDir,
    } = conf

    await _.asyncExec(`rm -rf ${tmpDir} && mkdir ${tmpDir}`)

    let config = require(resolve(cwd, rdcConfName))

    const rdaConfPath = resolve(cwd, appConfName)
    if (fs.existsSync(rdaConfPath)) {
      config = extend(config, require(rdaConfPath))
    }

    let srcDir = resolve(cwd, runtimeDir)

    debug(`copying files from ${srcDir} to ${resolve(tmpDir, runtimeDir)}`)

    await copy(srcDir, resolve(tmpDir, runtimeDir), {
      overwrite: true,
      dot: true,
      filter(filePath) {
        return !filePath.includes('node_modules')
      },
    })

    await render.renderTo('module', {
      obj: config
    }, resolve(rdeDir, rdcConfName), {
      overwrite: true
    })

    return config
  }

  public async renderDir(dir: string, config: Config) {
    const srcDir = resolve(dir, conf.runtimeDir)
    // @ts-ignore
    const {render: rdtRender = {} as any, container, suites} = config

    const {includes = []} = rdtRender

    if (suites && suites.length) {
      container.render.suites = suites
    }

    const dataView = container ? container.render : rdtRender.dev ? rdtRender.dev.render : {}

    await render.renderDir(srcDir, {
      ...dataView
    }, includes, conf.rdeDir, {
      overwrite: true,
      dot: true
    })

    await _.asyncExec(`rm -rf ${dir}`)
  }

  public async composeRde(config: Config) {
    const {cwd, rdeDir, rdType, RdTypes} = conf

    debug(`merged mappings: ${JSON.stringify(config.mappings)}`)

    for (let {from, to, options} of config.mappings) {
      const appDir = resolve(cwd, from)
      const destDir = resolve(rdeDir, to)

      await _.copy(appDir, destDir, {options})
    }

    if (this.watch) {
      let {mappings} = config
      if (rdType === RdTypes.Container) {
        mappings = mappings.concat([{
          from: conf.runtimeDir,
          to: '.'
        }])
      }

      new Watcher(mappings).start()
    }
  }
}
