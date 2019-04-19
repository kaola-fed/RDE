import Base from '../base'

export default class Run extends Base {
  public static description = 'run scripts provided by @rede/template'

  public static examples = [
    '$ rde run dev',
  ]

  public static args = [
    {name: 'cmd', required: true, description: 'commands provided by @rde/template'}
  ]

  public async preInit() {
    const {args} = this.parse(Run)
    return args
  }

  public async run() {
  }
}
