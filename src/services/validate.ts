import * as fs from 'fs'

import conf from './conf'
import {MCOMMON, MRDC} from './message'

export const validateRda = (useStrict = false) => {
  return useStrict
}

export const validateRdc = (useStrict = false) => {
  const {
    rdcConfPath,
    frameworks,
  } = conf

  if (!fs.existsSync(rdcConfPath)) {
    throw Error(MRDC.UNRECOGNIZED)
  }

  const rdcConf: RdcConf = require(rdcConfPath)
  if (
    !rdcConf.framework ||
    !Object.keys(frameworks).includes(rdcConf.framework)
  ) {
    throw Error(MCOMMON.WRONG_FRAMEWORK_CONFIG)
  }

  const {docker, exportFiles, docs} = rdcConf
  if (!docker || !docker.ports || !docker.ports.length) {
    throw Error(MCOMMON.WRONG_DOCKER_CONFIG_PORTS)
  }

  if (useStrict && !docker.tag) {
    throw Error(MCOMMON.WRONG_DOCKER_CONFIG_TAG)
  }

  if (!exportFiles || !exportFiles.length) {
    throw Error(MCOMMON.WRONG_MAPPING_CONFIG_MAPPING)
  }

  if (useStrict && (!docs || !docs.url)) {
    throw Error(MCOMMON.WRONG_DOCS_CONFIG)
  }

  return rdcConf
}
