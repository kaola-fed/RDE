import * as os from 'os'
import * as path from 'path'

import _ from '../util'

const {resolve} = path

const appConfName = 'rda.config.js'

const rdcConfName = 'rdc.config.js'

let rdType = ''

let rdcConfMap: any = {}

const conf = {
  get cwd() {
    return process.cwd()
  },

  get docsDir() {
    return 'docs'
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

  get dockerWorkDirRoot() {
    return '/usr/rde'
  },

  get tmpDir() {
    return path.join(os.tmpdir(), 'rde_rdc_tmp')
  },

  get localCacheDir() {
    return '.cache'
  },

  get runtimeDir() {
    return 'runtime'
  },

  get rdeDir() {
    return resolve(conf.cwd, '.rde')
  },

  get cliName() { return 'rde' },

  get homepage() { return 'https://github.com/kaola-fed/RDE' },

  get appConfName() { return appConfName },

  get rdcConfName() { return rdcConfName },

  get frameworks() {
    return {
      vue: {
        rdcStarter: 'rdebase/rdc-vue-starter',
        rdsStarter: 'rdebase/rdc-vue-suite',
        cdn: [],
      },
      react: {
        rdcStarter: 'rdebase/rdc-react-starter',
        rdsStarter: 'rdebase/rdc-vue-suite',
        cdn: [
          'https://unpkg.com/react/umd/react.production.min.js',
          'https://unpkg.com/react-dom/umd/react-dom.production.min.js',
        ],
      },
      angular: {
        rdcStarter: 'rdebase/rdc-angular-starter',
        rdsStarter: 'rdebase/rdc-vue-suite',
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

  get isApp() {
    return this.rdType === this.RdTypes.Application || this.rdType === this.RdTypes.Suite
  },

  get rdType() {
    return rdType
  },

  set rdType(type) {
    rdType = type
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
