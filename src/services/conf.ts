import * as extend from 'deep-extend'
import * as path from 'path'

import _ from '../util'

const {resolve} = path

const appConfName = 'rda.config.js'

const rdcConfName = 'rdc.config.js'

const rdsConfName = 'rds.config.js'

const tmpDirName = '.tmp'

const conf = {
  get cwd() {
    return process.cwd()
  },

  get docsDir() {
    return '_docs'
  },

  get docsPagesDir() {
    return '.docs'
  },

  get workDirRoot() {
    return '/usr/rde'
  },

  get appConfPath() {
    return resolve(conf.cwd, appConfName)
  },

  get rdcConfPath() {
    return resolve(conf.cwd, rdcConfName)
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

  get rdcConfName() { return rdcConfName },

  get rdsConfName() { return rdsConfName },

  get rdcAppDir() {
    const {app} = conf.getAppConf()
    return resolve(conf.cwd, 'node_modules', app.container.name, 'app')
  },

  get frameworks() {
    return {
      vue: {
        rdcStarter: 'rdc-vue-starter',
        cdn: [],
      },
      react: {
        rdcStarter: 'rdc-react-starter',
        cdn: [
          'https://unpkg.com/react/umd/react.production.min.js',
          'https://unpkg.com/react-dom/umd/react-dom.production.min.js',
        ],
      },
      angular: {
        rdcStarter: 'rdc-angular-starter',
        cdn: ['https://ajax.googleapis.com/ajax/libs/angularjs/1.4.5/angular.min.js'],
      },
    }
  },

  get rdTypes() {
    return {
      application: {
        alias: 'rda',
      },
      container: {
        alias: 'rdc',
      },
      suite: {
        alias: 'rds',
      },
    }
  },

  getRdcTemplateDir(rdc) {
    return resolve(conf.cwd, 'node_modules', rdc, 'template')
  },

  getTmpRdcConf(): RdcConf {
    return _.ensureRequire(resolve(conf.tmpDir, conf.rdcConfName))
  },

  getAppConf(): {app: AppConf} {
    return {
      app: _.ensureRequire(conf.appConfPath)
    }
  },

  getRdcDir(srcDir: string, node: string): string {
    return resolve(srcDir, 'node_modules', node)
  },

  getRdcConfPath(srcDir: string, node: string): RdcConf {
    const rdcDir = conf.getRdcDir(srcDir, node)
    return require(resolve(rdcDir, conf.rdcConfName))
  },

  getRdcChain(node, chain = []): string[] {
    chain.push(node)

    const rdcConfPath = resolve(conf.getRdcDir(conf.cwd, node), conf.rdcConfName)
    const {extend} = require(rdcConfPath)

    if (!extend) {
      return chain.reverse()
    }

    return conf.getRdcChain(extend, chain)
  },

  getRdcConf(node): {template: RdcConf} {
    const chain = conf.getRdcChain(node)
    return {
      template: conf.getRdcConfFromChain(chain)
    }
  },

  getRdcConfFromChain(chain): RdcConf {
    let merged: RdcConf

    for (let node of chain) {
      merged = extend(
        {},
        conf.getRdcConfPath(conf.cwd, node),
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
    const rdcConf = conf.getRdcConf(app.container.name)
    const suites = conf.getRdsConf()

    return extend({}, {app}, rdcConf, {suites})
  }
}

export default conf
