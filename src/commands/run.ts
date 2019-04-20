import * as flags from '@oclif/command/lib/flags'

import Base from '../base'
import conf from '../services/conf'
import _ from '../util'

export default class Run extends Base {
  public static description = 'run scripts provided by rdt'

  public static examples = [
    '$ rde run <script>',
  ]

  public static args = [{
    name: 'cmd',
    required: true,
    description: 'scripts provided by rdt',
  }]

  public static flags = {
    ...Base.flags,
    docker: flags.boolean({char: 'd'})
  }

  public rdtName: string

  public useDocker: boolean

  public renderData: any

  public mappings: Mapping[]

  public cmd: string

  public async preInit() {
    const {args, flags} = this.parse(Run)


    const {app} = conf.getRdeConf()
    if (!app.template) {
      throw Error('template is not provided in you config file, please check')
    }

    return {
      cmd: args.cmd,
      useDocker: flags.docker,
      appConf: app
    }
  }

  public async initialize({cmd, appConf, useDocker}) {
    const {template, mappings} = appConf

    this.rdtName = template.name
    this.useDocker = useDocker
    this.renderData = template.render
    this.mappings = mappings
    this.cmd = cmd
  }

  public async preRun() {
    const core = this.getCoreInstance({
      topRdtNode: this.rdtName,
      useDocker: this.useDocker,
      renderData: this.renderData,
      mappings: this.mappings,
    })

    await core.prepare()
  }

  public async run() {
    _.asyncSpawn('npm', ['run', `${this.cmd}`], {
      cwd: conf.runtimeDir
    })
  }
}
