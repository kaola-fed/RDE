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

  get appConfPath() {
    return resolve(conf.cwd, appConfName)
  },

  get rdcConfPath() {
    return resolve(conf.cwd, rdcConfName)
  },

  get workDirRoot() {
    return '/usr/rde'
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

  get frameworks() {
    return {
      vue: {
        rdcStarter: 'nupthale/rdc-vue-starter',
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

  get RdTypes() {
    return {
      Application: 'Application',
      Container: 'Container',
      Suite: 'Suite',
    }
  },

  getWorkDir(type, rdc = '') {
    const {RdTypes} = conf
    if (type === RdTypes.Application) {
      return `/usr/rde/${rdc}`
    } else if (type === RdTypes.Container) {
      return '/usr/rde'
    }
  },

  getAppConf(): {app: AppConf} {
    return {
      app: _.ensureRequire(conf.appConfPath)
    }
  },

  getRdcDir(rdc: string): string {
    const {getWorkDir, RdTypes} = conf
    const workDir = getWorkDir(RdTypes.Container)
    const rdcName = rdc.split(':')[0]

    return `${workDir}/${rdcName}`
  },

  getRdcConfPath(rdc: string): string {
    const {rdcConfName} = conf

    return `${conf.getRdcDir(rdc)}/${rdcConfName}`
  },

  getRdcChain(nodeDir, chain = []): string[] {
    chain.push(nodeDir)

    const rdcConfPath = resolve(nodeDir, conf.rdcConfName)
    const {extend} = require(rdcConfPath)

    if (!extend) {
      return chain.reverse()
    }

    return conf.getRdcChain(`${conf.getRdcDir(extend)}`, chain)
  },

  getRdcConf(nodeDir): {container: RdcConf} {
    const chain = conf.getRdcChain(nodeDir)
    return {
      container: conf.getRdcConfFromChain(chain)
    }
  },

  getRdcConfFromChain(chain): RdcConf {
    let merged: RdcConf

    for (let node of chain) {
      const nodeConf = require(conf.getRdcConfPath(node))

      merged = extend(
        {},
        nodeConf,
        merged || {},
      )
    }

    return merged
  },
}

export default conf
