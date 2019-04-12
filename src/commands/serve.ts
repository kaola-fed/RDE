import Base from '../base'
import conf from '../services/conf'
import {logger} from '../services/logger'

export default class Serve extends Base {
  static description = 'start a dev server'

  static examples = [
    '$ rde serve',
  ]

  private rdeConf: RdeConf | undefined

  async preInit() {
    const {args} = this.parse(Serve)
    return args
  }

  async initialize() {
    try {
      this.rdeConf = conf.getRdeConf()
      // this.rdtDir =
    } catch (e) {
      logger.error(e.message)
      this.exit(1)
    }
  }

  async render() {}

  async run() {}
}
