import Base from '../base'

export default class Run extends Base {
  static description = 'run scripts provided by @rede/template'

  static examples = [
    '$ rde run dev',
  ]

  static args = [
    {name: 'cmd', required: true, description: 'commands provided by @rde/template'}
  ]

  async preInit() {
    const {args} = this.parse(Run)
    return args
  }

  async run() {
  }
}
