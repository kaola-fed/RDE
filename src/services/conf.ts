import * as extend from 'deep-extend'
import * as path from 'path'

import _ from '../util'

const appConfName = 'rde.app.js'

const rdtConfName = 'rde.template.js'

const rdsConfName = 'rde.suite.js'

const tmpDirName = '.tmp'

export default {
  get cwd() {
    return process.cwd()
  },

  get appConfPath() {
    return path.resolve(this.cwd, appConfName)
  },

  get tmpDir() {
    return path.resolve(this.cwd, tmpDirName)
  },

  get runtimeDir() {
    return path.resolve(this.cwd, `.${this.cliName}`)
  },

  get cliName() { return 'rde' },

  get appConfName() { return appConfName },

  get rdtConfName() { return rdtConfName },

  get rdsConfName() { return rdsConfName },

  get rdtModulePath() {
    const {app} = this.getAppConf()
    return path.resolve(this.cwd, 'node_modules', app.template)
  },

  get templateName() {
    const {app} = this.getAppConf()
    return app.template
  },

  get rdtAppDir() {
    const {app} = this.getAppConf()
    return path.resolve(this.cwd, 'node_modules', app.template, 'app')
  },

  get rdtTemplateDir() {
    const {app} = this.getAppConf()
    return path.resolve(this.cwd, 'node_modules', app.template, 'template')
  },

  getTmpRdtConf() {
    return _.ensureRequire(path.resolve(this.tmpDir, this.rdtConfName))
  },

  getAppConf() {
    return {
      app: _.ensureRequire(this.appConfPath)
    }
  },

  getRdtConf() {
    const {app} = this.getAppConf()
    if (!app.template) {
      throw Error('template is not set in rde.app.js, please check')
    }

    let rdtConfPath = path.resolve(this.cwd, 'node_modules', app.template, rdtConfName)

    return {
      template: _.ensureRequire(rdtConfPath)
    }
  },

  getRdsConf() {
    const {app} = this.getAppConf()
    let rdsConf = {}

    if (!app.suites) {
      rdsConf = {}
    }

    if (typeof app.suites === 'string') {
      let conf = this.getSingleRdsConf(app.suites)
      rdsConf = [].concat(conf)
    }

    if (app.suites instanceof Array) {
      rdsConf = app.suites.map((suite: string) => {
        return this.getSingleRdsConf(suite)
      })
    }

    return rdsConf
  },

  getSingleRdsConf(suite: string) {
    let rdsConfPath = path.resolve(this.cwd, 'node_modules', suite, rdsConfName)

    return _.ensureRequire(rdsConfPath)
  },

  getRdeConf() {
    const appConf = this.getAppConf()
    const rdtConf = this.getRdtConf()

    return extend(appConf, rdtConf)
  }
}
