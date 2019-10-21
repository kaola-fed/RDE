import * as os from 'os'
import * as path from 'path'

import _ from '../util'

const {resolve, join} = path

const appConfName = 'rda.config.js'

const rdcConfName = 'rdc.config.js'

let rdType = ''

let rdMode = ''

let useLocal = false

let rdcConfMap: any = {}

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

  get userHomeDir() {
    // @ts-ignore
    // tslint:disable-next-line:triple-equals
    return os.platform() == 'win32' ? process.cwd().split(path.sep)[0] : os.homedir()
  },

  get npmPkgDir() {
    return join(this.userHomeDir, '.rde')
  },

  get appConfPath() {
    return resolve(conf.cwd, appConfName)
  },

  get rdcConfPath() {
    return resolve(conf.cwd, rdcConfName)
  },

  get dockerWorkDirRoot() {
    return '/home/rde'
  },

  get localCacheDir() {
    return '.cache'
  },

  get templateDir() {
    return 'template'
  },

  get runtimeDir() {
    return 'runtime'
  },

  get integrateDir() {
    return resolve(conf.cwd, '.integrate')
  },

  get rdeDir() {
    return this.isIntegrate ? this.integrateDir : this.runtimeDir
  },

  get cliName() { return 'rde' },

  get homepage() { return 'https://kaola-fed.github.io/RDE/index.html' },

  get appConfName() { return appConfName },

  get rdcConfName() { return rdcConfName },

  get tag() {
    if (this.rdType === this.RdTypes.Container) {
      const rdcConf = require(path.join(conf.cwd, rdcConfName))
      return rdcConf.docker.tag.split(':')[0]
    }

    if (this.isApp) {
      // name app image with project dir name
      return path.basename(conf.cwd)
    }
  },

  get frameworks() {
    return {
      vue: {
        rdcStarter: 'rdc-vue-starter',
        cdn: [],
      },
      react: {
        rdcStarter: 'rdebase/rdc-react-starter',
        cdn: [
          'https://unpkg.com/react/umd/react.production.min.js',
          'https://unpkg.com/react-dom/umd/react-dom.production.min.js',
        ],
      },
      angular: {
        rdcStarter: 'rdebase/rdc-angular-starter',
        cdn: ['https://ajax.googleapis.com/ajax/libs/angularjs/1.4.5/angular.min.js'],
      },
    }
  },

  get RdTypes() {
    return {
      Application: 'Application',
      Container: 'Container',
    }
  },

  get isApp() {
    return this.rdType === this.RdTypes.Application
  },

  get isContainer() {
    return this.rdType === this.RdTypes.Container
  },

  get rdType() {
    return rdType
  },

  get RdModes() {
    return {
      Integrate: 'integrate',
      Origin: 'origin'
    }
  },

  get isIntegrate() {
    return this.rdMode === this.RdModes.Integrate
  },

  set rdType(type) {
    rdType = type
  },

  get rdMode() {
    return rdMode
  },

  set rdMode(mode) {
    rdMode = mode
  },

  set useLocal(local) {
    useLocal = local
  },

  get useLocal() {
    return useLocal
  },

  getAppConf(): AppConf {
    return _.ensureRequire(conf.appConfPath)
  },

  getRdcConf(nodeDir): RdcConf {
    if (rdcConfMap[nodeDir]) {
      return rdcConfMap[nodeDir]
    }

    rdcConfMap[nodeDir] = require(resolve(conf.cwd, nodeDir, conf.rdcConfName))
    return rdcConfMap[nodeDir]
  },
}

export default conf
