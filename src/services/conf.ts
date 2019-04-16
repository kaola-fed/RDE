import * as extend from 'deep-extend'
import * as fs from 'fs'
import * as path from 'path'

const appConfName = 'rde.app.js'

const rdtConfName = 'rde.template.js'

const rdsConfName = 'rde.suite.js'

export default {
  get cwd() {
    return process.cwd()
  },

  get appConfPath() {
    return path.resolve(this.cwd, appConfName)
  },

  getCliName() { return 'rde' },

  getAppConfName() { return appConfName },

  getRdtConfName() { return rdtConfName },

  rdsConfName() { return rdsConfName },

  getRdtModulePath() {
    const {app} = this.getAppConf()
    return path.resolve(this.cwd, 'node_modules', app.template)
  },

  getTemplateName() {
    const {app} = this.getAppConf()
    return app.template
  },

  getAppConf() {
    if (!fs.existsSync(this.appConfPath)) {
      throw Error('rde.app.js cannot be found in cwd')
    }

    return {
      app: require(this.appConfPath)
    }
  },

  getRdtConf() {
    const {app} = this.getAppConf()
    if (!app.template) {
      throw Error('template is not set in rde.app.js, please check')
    }

    let rdtConfPath = path.resolve(this.cwd, 'node_modules', app.template, rdtConfName)
    if (!fs.existsSync(rdtConfPath)) {
      throw Error(`rde.template.js cannot be found in package ${app.template}, please check`)
    }

    return {
      template: require(rdtConfPath)
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
    if (!fs.existsSync(rdsConfPath)) {
      throw Error(`rde.suite.js cannot be found in package ${suite}, please check`)
    }

    return require(rdsConfPath)
  },

  getRdeConf() {
    const appConf = this.getAppConf()
    const rdtConf = this.getRdtConf()

    return extend(appConf, rdtConf)
  },

  getRdtAppDir() {
    const {app} = this.getAppConf()
    return path.resolve(this.cwd, 'node_modules', app.template, 'app')
  },

  getRdtTemplateDir() {
    const {app} = this.getAppConf()
    return path.resolve(this.cwd, 'node_modules', app.template, 'template')
  }
}
