import * as extend from 'deep-extend'
import * as fs from 'fs'
import {js as beautify} from 'js-beautify'
import * as path from 'path'

import conf from '../services/conf'
import {debug, logger} from '../services/logger'
import rdehook from '../services/rdehook'
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

    // write variable to rdc.variable.js
    await this.writeVariable(this.config)

    if (conf.isIntegrate) {
      // template render to .integrated
      await this.renderDir(templateDir, integrateDir)

      await rdehook.trigger('preIntegrate')
      // compose rde and watch app
      await this.composeRde()
      await rdehook.trigger('postIntegrate')

    } else {
      // template render to runtime
      await this.renderDir(templateDir, runtimeDir)
    }

    if (conf.rdType === RdTypes.Application) {
      const dirRoot = conf.useLocal ? conf.cwd : dockerWorkDirRoot

      await sync.mergePkgJson(
        resolve(dirRoot, 'app', 'package.json'),
        resolve(dirRoot, conf.rdeDir, 'package.json'),
        resolve(dirRoot, conf.rdeDir)
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

  public async writeVariable(config) {
    let variables = {}
    if (conf.rdType === RdTypes.Application) {
      variables = config.container.variables || {}
    } else {
      variables = config.variables || {}
    }

    const dirRoot = conf.useLocal ? conf.cwd : dockerWorkDirRoot
    const variablePath = resolve(dirRoot, 'rdc.variables.js')
    await render.renderTo('module', {
      obj: variables
    }, variablePath, {
      overwrite: true,
    })

    fs.readFile(variablePath, 'utf-8', (err, data) => {
      if (err) {
        throw err
      }

      fs.writeFile(variablePath, beautify(data, {}), err => {
        if (err) {
          throw err
        }
      })
    })
  }

  public async renderDir(from, to) {
    // @ts-ignore
    const {render: rdtRender = {} as any, container, suites} = this.config

    const {includes = []} = rdtRender

    if (container && rdtRender.validate) {
      const result = rdtRender.validate(container.render)
      if (result !== true) {
        throw Error(result)
      }
    }

    if (suites && suites.length) {
      container.render = container.render || {}

      Object.keys(conf.frameworks).forEach(framework => {
        container.render[`${framework}Suites`] = suites.filter(item => {
          if (item.framework === framework) {
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
          }
          return false
        })
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
    }, includes, to, options, rdtRender.tags)
  }

  // app files should not overwrite template file with same path & name
  public async copyApp(filePath, destPath, {to, options}) {
    options = options || {}
    debug(`【File Changed】${filePath} ${options}`)

    /**
     * 1. mapping.options.overwrite is not true
     * 2. file or dir exist in template dir
     */
    const appPath = resolve(conf.cwd, 'app')
    const fileAppPath = path.relative(appPath, filePath)
    const fileTemplatePath = resolve(conf.templateDir, to, fileAppPath)

    if (!options.overwrite && fs.existsSync(fileTemplatePath)) {
      logger.error(`${filePath}: RDA should not overwrite RDC file with same name`)
      return
    }

    await _.copy(filePath, destPath, {options})
  }

  public async composeRde() {
    debug(`merged mappings: ${JSON.stringify(this.config.mappings)}`)

    for (let {from, to, options} of this.config.mappings) {
      const appDir = resolve(conf.cwd, from)
      const destDir = resolve(integrateDir, to)

      if (!options || options.filter) {
        options = options || {}
        options.overwrite = options.overwrite || false
        options.filter = /.*(?<!\.d\.ts)$/
      }

      await _.copy(appDir, destDir, {options})
    }

    if (this.watch) {
      let {mappings} = this.config

      new Watcher(mappings, this.copyApp.bind(this)).start()
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
