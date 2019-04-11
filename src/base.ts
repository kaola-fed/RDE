import {Command} from '@oclif/command'
import cli from 'cli-ux'

export default abstract class Base extends Command {
  static appConf = 'rede.app.js'

  static templateConf = 'rede.template.js'

  static suiteConf = 'rede.suite.js'

  async init() {
    // check user input args here
    const args = await this.checkArgs()

    cli.action.start('start initializing')
    // initialize everything needed here
    await this.initialize(args)
    cli.action.stop()

    cli.action.start('start checking conf')
    // check rede related conf here
    await this.checkConf()
    cli.action.stop()

    cli.action.start('start run')
  }

  async finally() {
    cli.action.stop()
  }

  protected async checkArgs(): Promise<any> {}
  protected async initialize(_args: any): Promise<any> {}
  protected async checkConf(): Promise<any> {}
}
