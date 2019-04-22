import Base from '../../base'
import conf from '../../services/conf'
import _ from '../../util'

export default class RdtRun extends Base {
  public static description = 'run script'

  public static examples = [
    '$ rde template:run <script>',
  ]

  public static args = [{
    name: 'cmd',
    required: true,
    description: 'scripts provided by rdt',
  }]

  public static flags = {
    ...Base.flags,
  }

  public rdtName: string

  public mappings: Mapping[]

  public cmd: string

  public renderData: any

  public async preInit() {
    const {args} = this.parse(RdtRun)

    return {
      cmd: args.cmd,
    }
  }

  public async initialize({cmd}) {
    this.cmd = cmd

    this.rdtName = '../'
    this.renderData = null
    this.mappings = []

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
      docker: this.docker,
      renderData: this.renderData,
      mappings: this.mappings,
      watch: this.watch,
    })

    await core.prepare()
  }

  public async run() {
    await _.asyncSpawn('npm', ['run', `${this.cmd}`], {
      cwd: conf.runtimeDir
    })
  }
}
