import * as microMatch from 'micromatch'
import * as path from 'path'

import _ from '../util'

import conf from './conf'

const {resolve} = path
const {ensureRequire} = _
export default {
  getLintFiles(filenames?) {
    const {
      cwd,
      isApp,
      runtimeDir,
      rdcConfName,
    } = conf

    const rdcPath = isApp ? resolve(runtimeDir, rdcConfName) : resolve(cwd, rdcConfName)
    const rdcConf = ensureRequire(rdcPath)

    const lintFiles = rdcConf.lint && rdcConf.lint.files || []
    if (!filenames) {
      return lintFiles
    }
    return microMatch(filenames, lintFiles)
  }
}
