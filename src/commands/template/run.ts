import Base from '../../base'
import conf from '../../services/conf'
import _ from '../../util'

export default class RdtRun extends Base {
  public static description = 'run script'

  public static examples = [
    '$ rde template:run',
  ]

  public static args = [{
    name: 'cmd',
    required: true,
    description: 'scripts provided by rdt',
  }]

  public static flags = {
    ...Base.flags,
  }

  public rdtName = '../'

  public useDocker: boolean

  public mappings: Mapping[]

  public cmd: string

  public quickRun: boolean

  public async preInit() {
    const {flags, args} = this.parse(RdtRun)

    return {
      useDocker: flags.docker,
      cmd: args.cmd,
      quickRun: flags.quickRun,
    }
  }

  public async initialize({useDocker, cmd, quickRun}) {
    this.useDocker = useDocker
    this.cmd = cmd
    this.quickRun = quickRun

    // mapping from template to .rde
    const {template} = conf.getRdtConf('../')
    const {dev} = template

    if (dev) {
      const mappings = []
      dev.watchFiles.forEach(file => {
        mappings.push({
          from: file,
          to: file
        })
      })

      this.mappings = mappings
    }
  }

  public async preRun() {
    if (this.quickRun) {
      return
    }

    const core = this.getCoreInstance({
      topRdtNode: this.rdtName,
      useDocker: this.useDocker,
      mappings: this.mappings,
      keepWatch: true
    })

    await core.prepare()
  }

  public async run() {
    await _.asyncSpawn('npm', ['run', `${this.cmd}`], {
      cwd: conf.runtimeDir
    })
  }
}
