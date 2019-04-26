import {Command} from '@oclif/command'
import * as flags from '@oclif/command/lib/flags'
import * as path from 'path'

import conf from '../services/conf'
import {logger} from '../services/logger'

export default abstract class Index extends Command {
  public static flags = {
    verbose: flags.boolean({char: 'v', required: false, description: 'show verbose logs'}),
  }

  public verbose = false

  public quickRun = false

  public watch = false

  public get mustachesDir() {
    return path.resolve(__dirname, 'mustaches')
  }

  public get frameworks() {
    return conf.frameworks
  }

  public async init() {
    // @ts-ignore
    const {flags} = this.parse(this.constructor)
    this.verbose = flags.verbose

    // check user input args here
    const args = await this.preInit()

    logger.info('Phase 1: Start initializing')
    // initialize everything needed here
    await this.initialize(args)
    logger.info('Phase 2: Preparing')
    // prepare running context here
    await this.preRun()

    logger.info('Phase 3: Start running')
  }

  public async catch(e) {
    logger.error(e.message)
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
