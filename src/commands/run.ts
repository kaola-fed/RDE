import Base from '../base'
import {logger} from '../services/logger'

export default class Run extends Base {
  static description = 'run scripts provided by @rede/template'

  static examples = [
    '$ rde run dev',
  ]

  static args = [
    {name: 'cmd', required: true, description: 'commands provided by @rde/template'}
  ]

  async run() {
    const {args} = this.parse(Run)
    logger.success(`running ${args.cmd}`)
  }
}
