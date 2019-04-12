import {Command} from '@oclif/command'

import {logger} from './services/logger'

export default abstract class Base extends Command {
  async init() {
    // check user input args here
    const args = await this.preInit()

    logger.info('Phase 1: Start initializing')
    // initialize everything needed here
    await this.initialize(args)

    await this.render()

    logger.info('Phase 2: Preparing')
    // prepare running context here
    await this.preRun()

    logger.info('Phase 3: Start running')
  }

  async finally() {
    await this.postRun()
  }

  protected async preInit(): Promise<any> {}

  protected async initialize(_args: any): Promise<any> {}

  protected async render(): Promise<any> {}

  protected async preRun(): Promise<any> {}

  protected async postRun(): Promise<any> {}
}
