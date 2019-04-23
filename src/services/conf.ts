import * as extend from 'deep-extend'
import * as path from 'path'

import _ from '../util'

const {resolve} = path

const appConfName = 'rde.app.js'

const rdtConfName = 'rde.template.js'

const rdsConfName = 'rde.suite.js'

const tmpDirName = '.tmp'

const conf = {
  get cwd() {
    return process.cwd()
  },

  get appConfPath() {
    return resolve(conf.cwd, appConfName)
  },

  get tmpDir() {
    return resolve(conf.cwd, tmpDirName)
  },

  get runtimeDir() {
    return resolve(conf.cwd, `.${conf.cliName}`)
  },

  get cliName() { return 'rde' },

  get homepage() { return 'https://github.com/kaola-fed/RDE' },

  get appConfName() { return appConfName },

  get rdtConfName() { return rdtConfName },

  get rdsConfName() { return rdsConfName },

  get rdtAppDir() {
    const {app} = conf.getAppConf()
    return resolve(conf.cwd, 'node_modules', app.template.name, 'app')
  },

  getRdtTemplateDir(rdtName) {
    return resolve(conf.cwd, 'node_modules', rdtName, 'template')
  },

  getTmpRdtConf(): RdtConf {
    return _.ensureRequire(resolve(conf.tmpDir, conf.rdtConfName))
  },

  getAppConf(): {app: AppConf} {
    return {
      app: _.ensureRequire(conf.appConfPath)
    }
  },

  getRdtDir(srcDir: string, node: string): string {
    return resolve(srcDir, 'node_modules', node)
  },

  getRdtConfPath(srcDir: string, node: string): RdtConf {
    const rdtDir = conf.getRdtDir(srcDir, node)
    return require(resolve(rdtDir, rdtConfName))
  },

  getRdtChain(node, chain = []): string[] {
    chain.push(node)

    const rdtConfPath = resolve(conf.getRdtDir(conf.cwd, node), conf.rdtConfName)
    const {extend} = require(rdtConfPath)

    if (!extend) {
      return chain.reverse()
    }

    return conf.getRdtChain(extend, chain)
  },

  getRdtConf(node): {template: RdtConf} {
    const chain = conf.getRdtChain(node)
    return {
      template: conf.getRdtConfFromChain(chain)
    }
  },

  getRdtConfFromChain(chain): RdtConf {
    let merged: RdtConf

    for (let node of chain) {
      merged = extend(
        {},
        conf.getRdtConfPath(conf.cwd, node),
        merged || {}
      )
    }

    return merged
  },

  getRdsConf(): RdsConf[] {
    const {app} = conf.getAppConf()
    let rdsConf = []

    if (app.suites instanceof Array) {
      rdsConf = app.suites.map((suite: AppConfSuite) => {
        return conf.getSingleRdsConf(suite.name)
      })
    }

    return rdsConf
  },

  getSingleRdsConf(suite: string): RdsConf {
    let rdsConfPath = resolve(conf.cwd, 'node_modules', suite, rdsConfName)

    return _.ensureRequire(rdsConfPath)
  },

  getRdeConf(): RdeConf {
    const {app} = conf.getAppConf()
    const rdtConf = conf.getRdtConf(app.template.name)
    const suites = conf.getRdsConf()

    return extend({}, {app}, rdtConf, {suites})
  }
}

export default conf
