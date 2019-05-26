import {flags} from '@oclif/command'
import * as fs from 'fs'

import Base from '../base'
import conf from '../services/conf'
import {debug} from '../services/logger'
import {MCOMMON} from '../services/message'

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

  public async initialize() {
    const {
      appConfPath,
      rdcConfPath,
      RdTypes,
      dockerRdcDir,
    } = conf
    const isDockerEnv = process.env.DOCKER_ENV
    if (fs.existsSync(appConfPath)) {
      conf.rdType = RdTypes.Application
    } else if (
      isDockerEnv && fs.existsSync(dockerRdcDir) ||
      !isDockerEnv && fs.existsSync(rdcConfPath)
    ) {
      // runbase is used by both local env & docker env
      conf.rdType = RdTypes.Container
    }

    debug(`rd type recognized as ${conf.rdType}`)

    if (!conf.rdType) {
      throw Error(MCOMMON.UNRECOGNIZED)
    }
  }

  public async run() {}
}
