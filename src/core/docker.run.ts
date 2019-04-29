import * as extend from 'deep-extend'
import * as fs from 'fs'
import * as path from 'path'
import * as copy from 'recursive-copy'

import conf from '../services/conf'
import {spinner} from '../services/logger'
import npm from '../services/npm'
import render from '../services/render'
import Watcher from '../services/watcher'
import _ from '../util'

const {resolve} = path

type Config = (RdcConf & AppConf) | (RdcConf)
export default class DockerRun {
  private readonly watch: boolean

  constructor({watch}) {
    this.watch = watch
  }

  public async start() {
    spinner.start('Preparing Rde Runtime...')

    // generate rdt template from rdt chain
    const config = await this.composeRdcChain()

    // template render to .rde
    await this.renderDir(conf.tmpDir, config)

    // start watcher
    await this.createRuntime(config)

    spinner.stop()
  }

  public async composeRdcChain(): Promise<Config> {
    await _.asyncExec(`rm -rf ${conf.tmpDir} && mkdir ${conf.tmpDir}`)

    const {
      getRdcChain,
      getRdcConfFromChain,
    } = conf

    const chain = getRdcChain(conf.cwd)
    const rdcConf = getRdcConfFromChain(chain)
    let config = rdcConf

    const rdaConfPath = resolve(conf.cwd, conf.appConfName)
    if (fs.existsSync(rdaConfPath)) {
      config = extend(rdcConf, require(rdaConfPath))
    }

    for (let node of chain) {
      let srcDir = resolve(node, 'template')

      await copy(srcDir, resolve(conf.tmpDir, 'template'), {
        overwrite: true
      })
    }

    await render.renderTo('module', {
      obj: config
    }, resolve(conf.tmpDir, conf.rdcConfName), {
      overwrite: true
    })

    return config
  }

  public async renderDir(dir: string, config: Config) {
    const srcDir = resolve(dir, 'template')
    // @ts-ignore
    const {render: rdtRender, dev = {render: {}}, container} = config

    const {includes} = rdtRender
    const dataView = container.render || dev.render

    await render.renderDir(srcDir, {
      ...dataView
    }, includes, conf.runtimeDir, {
      overwrite: true
    })

    await _.asyncExec(`rm -rf ${dir}`)
  }

  public async createRuntime(config: Config) {
    const {cwd, runtimeDir} = conf

    for (let {from, to, option} of config.mappings) {
      const appDir = resolve(cwd, from)
      const destDir = resolve(runtimeDir, to)

      await _.copy(appDir, destDir, {option})
    }

    await npm.install('', false, runtimeDir)

    if (this.watch) {
      new Watcher(config.mappings).start()
    }
  }
}
