import * as fs from 'fs'
import * as path from 'path'

import conf from './conf'
import {MCOMMON, MRDC} from './message'

const {resolve} = path
const {RdModes} = conf
export const validateRda = (useStrict = false) => {
  return useStrict
}

export const validateRdc = (useStrict = false) => {
  const {
    cwd,
    rdcConfPath,
    frameworks,
  } = conf

  if (!fs.existsSync(rdcConfPath)) {
    throw Error(MRDC.UNRECOGNIZED)
  }

  const appDir = resolve(cwd, 'app')
  const templateDir = resolve(cwd, 'template')

  if (!fs.existsSync(appDir)) {
    throw Error(MRDC.WRONG_DIR_STRUCTURE_APP)
  }

  if (!fs.existsSync(templateDir)) {
    throw Error(MRDC.WRONG_DIR_STRUCTURE_TPL)
  }

  const rdcConf: RdcConf = require(rdcConfPath)
  if (
    !rdcConf.framework ||
    !Object.keys(frameworks).includes(rdcConf.framework)
  ) {
    throw Error(MCOMMON.WRONG_FRAMEWORK_CONFIG)
  }

  const {mappings, docs, mode = RdModes.Integrate} = rdcConf

  if (
    mode === conf.RdModes.Integrate &&
    (!mappings || !mappings.length)
  ) {
    throw Error(MCOMMON.WRONG_MAPPING_CONFIG_MAPPING)
  }

  if (useStrict && (!docs || !docs.url)) {
    throw Error(MCOMMON.WRONG_DOCS_CONFIG)
  }

  if (!rdcConf.npm || !rdcConf.npm.name || !rdcConf.npm.version) {
    throw Error(MCOMMON.WRONG_NPM_CONFIG)
  }

  return rdcConf
}
