import {flags} from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'

import Base from '../base'
import conf from '../services/conf'
import {debug} from '../services/logger'
import {MCOMMON} from '../services/message'
import _ from '../util'
import { TError, TStart } from '../services/track'

const {resolve} = path
export default class RunBase extends Base {
  public static args = [{
    name: 'cmd',
    required: false,
    description: 'scripts provided by container',
  }]

  public static flags = {
    ...Base.flags,
    watch: flags.boolean({char: 'w'}),
    extras: flags.string({
      char: 'e',
      description: 'arguments need to pass to npm run cmd',
    }),
  }

  public cmd = ''

  public watch = false

  public extras: string

  public async preInit() {
    // @ts-ignore
    const {flags, args} = this.parse(this.constructor)

    this.cmd = args.cmd
    this.watch = flags.watch
    this.extras = flags.extras

    return flags
  }


  @TError({ conf })
  @TStart
  public async initialize() {
    await _.asyncExec(`rm -rf ${conf.tmpDir} && mkdir ${conf.tmpDir}`)

    const {appConfPath, rdcConfPath, cwd, RdTypes} = conf
    if (fs.existsSync(appConfPath)) {
      conf.rdType = RdTypes.Application
    }

    if (fs.existsSync(rdcConfPath)) {
      conf.rdType = RdTypes.Container
    }

    debug(`rd type recognized as ${conf.rdType}`)

    if (!conf.rdType) {
      throw Error('no rde config file found, please read docs first')
    }

    const appDir = resolve(cwd, 'app')
    const runtimeDir = resolve(cwd, conf.runtimeDir)
    if (
      (conf.rdType === 'container' && !fs.existsSync(runtimeDir)) ||
      !fs.existsSync(appDir)
    ) {
      throw Error(MCOMMON.WRONG_PROJECT_STRUCTURE)
    }
  }

  public async run() {}
}
