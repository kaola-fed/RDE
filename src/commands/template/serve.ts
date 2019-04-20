import {flags} from '@oclif/command'

import Base from '../../base'
import conf from '../../services/conf'
import _ from '../../util'

export default class Serve extends Base {
  public static description = 'start a template dev server'

  public static examples = [
    '$ rde template:serve',
  ]

  public static flags = {
    ...Base.flags,
    docker: flags.boolean({char: 'd'})
  }

  public rdtName = '../'

  public useDocker: boolean

  public renderData: any

  public mappings: Mapping[]

  public async preInit() {
    const {flags} = this.parse(Serve)

    return {
      useDocker: flags.docker,
    }
  }

  public async initialize({useDocker}) {
    this.useDocker = useDocker

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
    const core = this.getCoreInstance({
      topRdtNode: this.rdtName,
      useDocker: this.useDocker,
      mappings: this.mappings,
    })

    await core.prepare()
  }

  public async run() {
    await _.asyncSpawn('npm', ['run', 'serve'], {
      cwd: conf.runtimeDir
    })
  }
}
