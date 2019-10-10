import * as writePkg from 'write-pkg'

import Base from '../base'
import conf from '../services/conf'
import {logger} from '../services/logger'
import {uploadHubble} from '../services/track'
import {validateRdc} from '../services/validate'
import _ from '../util'

export default class Publish extends Base {
  public static examples = [
    '$ rde publish',
  ]

  public static flags = {
    ...Base.flags,
  }

  public rdcConf: RdcConf

  public rdc: string

  public async preInit() {
    await this.config.runHook('checkUpdate', {})

    const {flags} = this.parse(Publish)

    this.rdcConf = await validateRdc(false)

    return flags
  }

  public async initialize() {
    const json: any = this.rdcConf.npm || {}
    json.files = [
      'app',
      'template',
      'rdc.config.js',
    ]

    await writePkg(conf.cwd, json)
  }

  public async run() {
    uploadHubble({cmd: 'publish'})

    await _.asyncSpawn('npm', ['publish'])
    await _.asyncSpawn('rm', ['package.json'])
  }

  public async postRun() {
    logger.log('Published successfully')
  }
}
