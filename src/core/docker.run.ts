import * as extend from 'deep-extend'
import * as fs from 'fs'
import * as path from 'path'
import * as copy from 'recursive-copy'

import conf from '../services/conf'
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
    if (conf.rdType === conf.RdTypes.Container ||
      (conf.rdType === conf.RdTypes.Application && !fs.existsSync(conf.runtimeDir))) {
      // generate rdt template from rdt chain
      config = await this.composeRdcChain()

      // template render to .rde
      await this.renderDir(conf.tmpDir, config)
    } else {
      config = require(resolve(conf.runtimeDir, conf.rdcConfName))
    }

    // start watcher
    await this.createRuntime(config)
  }

  public async composeRdcChain(): Promise<Config> {
    await _.asyncExec(`rm -rf ${conf.tmpDir} && mkdir ${conf.tmpDir}`)

    const {
      getRdcChain,
      getRdcConfFromChain,
    } = conf

    const chain = getRdcChain('.')
    const rdcConf = getRdcConfFromChain(chain)
    let config = rdcConf

    const rdaConfPath = resolve(conf.cwd, conf.appConfName)
    if (fs.existsSync(rdaConfPath)) {
      config = extend(rdcConf, require(rdaConfPath))
    }

    for (let node of chain) {
      let srcDir = resolve(node, 'template')

      // @TODO: copy chain with merge , not overriding
      await copy(srcDir, resolve(conf.tmpDir, 'template'), {
        overwrite: true,
        dot: true,
        filter(filePath) {
          return !filePath.includes('node_modules')
        },
      })
    }

    await render.renderTo('module', {
      obj: config
    }, resolve(conf.runtimeDir, conf.rdcConfName), {
      overwrite: true
    })

    return config
  }

  public async renderDir(dir: string, config: Config) {
    const srcDir = resolve(dir, 'template')
    // @ts-ignore
    const {render: rdtRender, container, suites} = config

    const {includes} = rdtRender

    if (suites && suites.length) {
      container.render.suites = suites
    }

    const dataView = container ? container.render : rdtRender.dev ? rdtRender.dev.render : {}

    await render.renderDir(srcDir, {
      ...dataView
    }, includes, conf.runtimeDir, {
      overwrite: true,
      dot: true
    })

    await _.asyncExec(`rm -rf ${dir}`)
  }

  public async createRuntime(config: Config) {
    const {cwd, runtimeDir, rdType, RdTypes} = conf

    for (let {from, to, option} of config.mappings) {
      const appDir = resolve(cwd, from)
      const destDir = resolve(runtimeDir, to)

      await _.copy(appDir, destDir, {option})
    }

    if (this.watch) {
      let {mappings} = config
      if (rdType === RdTypes.Container) {
        mappings = mappings.concat([{
          from: 'template',
          to: '.'
        }])
      }

      new Watcher(mappings).start()
    }
  }
}
