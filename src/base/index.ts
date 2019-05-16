import {Command} from '@oclif/command'
import * as flags from '@oclif/command/lib/flags'
import * as debugLib from 'debug'
import * as path from 'path'

import conf from '../services/conf'
import {debug, logger} from '../services/logger'

export default abstract class Index extends Command {
  public static flags = {
    verbose: flags.boolean({char: 'v', required: false, description: 'show verbose logs'}),
  }

  public verbose = false

  public get mustachesDir() {
    return path.resolve(__dirname, 'mustaches')
  }

  public get frameworks() {
    return conf.frameworks
  }

  public async init() {
    // @ts-ignore
    const {flags} = this.parse(this.constructor)
    if (flags.verbose) {
      debugLib.enable('rde')
    }

    debug(`cwd ${conf.cwd}`)

    // check user input args here
    const args = await this.preInit()

    // initialize everything needed here
    await this.initialize(args)

    // prepare running context here
    await this.preRun()
  }

  public async catch(e) {
    logger.error(e.message)
    debug('stack: %O', e)
    this.exit(1)
  }

  public async finally(e: any) {
    if (!e) {
      await this.postRun()
    }
  }

  protected async preInit(): Promise<any> {}

  protected async initialize(_args: any): Promise<any> {}

  protected async preRun(): Promise<any> {}

  protected async postRun(): Promise<any> {}
}
