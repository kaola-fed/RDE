import {Command} from '@oclif/command'
import * as path from 'path'

import {logger} from './services/logger'

export default abstract class Base extends Command {
  get cwd() {
    return process.cwd()
  }

  get mustachesDir() {
    return path.resolve(__dirname, 'mustaches')
  }

  get frameworks() {
    return {
      vue: {rdtStarter: '@rede/rdt-vue-starter'},
      react: {rdtStarter: '@rede/rdt-react-starter'},
      angular: {rdtStarter: '@rede/rdt-angular-starter'},
    }
  }

  async init() {
    try {
      // check user input args here
      const args = await this.preInit()

      logger.info('Phase 1: Start initializing')
      // initialize everything needed here
      await this.initialize(args)

      logger.info('Phase 2: Preparing')
      // prepare running context here
      await this.preRun()

      logger.info('Phase 3: Start running')
    } catch (e) {
      logger.error(e.message)
      this.exit(1)
    }
  }

  async finally(e: any) {
    if (!e) {
      await this.postRun()
    }
  }

  protected async preInit(): Promise<any> {}

  protected async initialize(_args: any): Promise<any> {}

  protected async preRun(): Promise<any> {}

  protected async postRun(): Promise<any> {}
}
