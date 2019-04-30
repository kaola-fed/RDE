import * as extend from 'deep-extend'
import * as fs from 'fs'
import * as globby from 'globby'
import * as path from 'path'
import * as copy from 'recursive-copy'

import cache from '../services/cache'
import conf from '../services/conf'
import {spinner} from '../services/logger'
import npm from '../services/npm'
import render from '../services/render'
import Watcher from '../services/watcher'
import _ from '../util'

type Config = (RdcConf & AppConf) | (RdcConf)
const {resolve} = path
const {RdTypes} = conf

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

    const chain = getRdcChain('.')
    const rdcConf = getRdcConfFromChain(chain)
    let config = rdcConf

    const rdaConfPath = resolve(conf.cwd, conf.appConfName)
    if (fs.existsSync(rdaConfPath)) {
      config = extend(rdcConf, require(rdaConfPath))
    }

    for (let node of chain) {
      let srcDir = resolve(node, 'template')

      await copy(srcDir, resolve(conf.tmpDir, 'template'), {
        overwrite: true,
        filter: ['**/node_modules'],
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
    const dataView = container ? container.render : dev ? dev.render : {}

    await render.renderDir(srcDir, {
      ...dataView
    }, includes, conf.runtimeDir, {
      overwrite: true,
      filter: ['**/node_modules'],
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

    await this.install()

    if (this.watch) {
      new Watcher(config.mappings).start()
    }
  }

  public async install() {
    /**
     * rde will trigger npm install under such condition:
     * 1. no cache info found
     * 2. no node_modules found
     * 3. rdc version changed if rdType is application
     * 4. any package.json under template dir has changed if rdType is container
     * 5. extends attr in rdc.config.js has changed if rdType is container
     */
    const {rdType, runtimeDir, cwd} = conf
    const nodeModulesDir = resolve(runtimeDir, 'node_modules')

    const isApplication = rdType === RdTypes.Application
    let rdcName
    if (isApplication) {
      const rdaConf = conf.getAppConf()
      rdcName = rdaConf.container.name || ''
    }

    const isContainer = rdType === RdTypes.Container
    let pkgJsonLMTs
    let extendsName
    if (isContainer) {
      const pkgJsonPaths = await globby(['**/package.json'], {
        cwd: resolve(cwd, 'template'),
        ignore: ['node_modules'],
      })

      // last-modified-time
      let lmt = ''
      pkgJsonPaths.forEach(pkg => {
        const pkgPath = resolve(cwd, 'template', pkg)
        lmt += fs.statSync(pkgPath).mtimeMs
      })
      pkgJsonLMTs = lmt

      const rdcConfPath = resolve(cwd, conf.rdcConfName)
      const rdcConf = require(rdcConfPath)
      extendsName = rdcConf.extends
    }

    if (
      !cache.exist ||
      !fs.existsSync(nodeModulesDir) ||
      (isApplication && rdcName !== cache.get('rda.container')) ||
      (isContainer && pkgJsonLMTs !== cache.get('rdc.pkg.lmts')) ||
      (isContainer && extendsName && extendsName !== cache.get('rdc.extends'))
    ) {
      await npm.install('', false, conf.runtimeDir)

      cache.set('rda.container', rdcName)
      cache.set('rdc.pkg.lmts', pkgJsonLMTs)
      cache.set('rdc.extends', extendsName)
    }
  }
}
