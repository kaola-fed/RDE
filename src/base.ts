import {Command} from '@oclif/command'

import {logger} from './services/logger'

export default abstract class Base extends Command {
  static appConf = 'rede.app.js'

  static templateConf = 'rede.template.js'

  static suiteConf = 'rede.suite.js'

  async init() {
    // check user input args here
    const args = await this.checkArgs()

    logger.info('Phase 1: Start initializing')
    // initialize everything needed here
    await this.initialize(args)

    logger.info('Phase 2: Start checking')
    // check rede related conf here
    await this.checkConf()

    logger.info('Phase 3: Start running')
  }

  async finally() {
    await this.postRun()
  }

  protected async checkArgs(): Promise<any> {}
  protected async initialize(_args: any): Promise<any> {}
  protected async checkConf(): Promise<any> {}
  protected async postRun(): Promise<any> {}
}
