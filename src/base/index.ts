import {Command} from '@oclif/command'
import * as flags from '@oclif/command/lib/flags'
import * as path from 'path'

import conf from '../services/conf'
import docker from '../services/docker'
import {logger} from '../services/logger'

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
    this.verbose = flags.verbose

    await docker.checkEnv()

    // check user input args here
    const args = await this.preInit()

    logger.info('Start initializing')
    // initialize everything needed here
    await this.initialize(args)

    logger.info('Preparing')
    // prepare running context here
    await this.preRun()

    logger.info('Start to run')
  }

  public async catch(e) {
    if (this.verbose) {
      logger.error(e)
    } else {
      logger.error(e.message)
    }
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
