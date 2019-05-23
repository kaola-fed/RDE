import * as microMatch from 'micromatch'
import * as path from 'path'

import _ from '../util'

import conf from './conf'

const {resolve} = path
const {ensureRequire} = _
export default {
  getLintFiles(filenames) {
    const {
      cwd,
      isApp,
      runtimeDir,
      rdcConfName,
      localCacheDir,
    } = conf

    const rdcPath = isApp ? resolve(runtimeDir, localCacheDir) : resolve(cwd, rdcConfName)
    const rdcConf = ensureRequire(rdcPath)

    const lintFiles = rdcConf.lint && rdcConf.lint.files || []
    return microMatch(filenames, lintFiles, {
      basename: true
    })
  }
}
