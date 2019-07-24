import * as path from 'path'

import _ from '../util'

import conf from './conf'

const {resolve} = path
const {ensureRequire} = _
export default {
  getLintFiles(filenames) {
    const {
      cwd,
      rdcConfName,
    } = conf

    const rdcPath = resolve(cwd, rdcConfName)
    const rdcConf = ensureRequire(rdcPath)

    filenames = filenames.filter(file => /(app\/)|(template\/)/.test(file))

    const ext = rdcConf.lint && rdcConf.lint.ext || []
    if (ext.length) {
      filenames = filenames.filter(file => ext.includes(path.extname(file)))
    }
    // 没有文件时 eslint会报错
    if (!filenames.length) {
      filenames = ['app/']
    }

    return filenames
  }
}
