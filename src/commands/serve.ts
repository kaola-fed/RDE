import {flags} from '@oclif/command'

import Base from '../base'
import conf from '../services/conf'
import _ from '../util'

export default class Serve extends Base {
  public static description = 'start a dev server'

  public static examples = [
    '$ rde serve',
  ]

  public static flags = {
    ...Base.flags,
    docker: flags.boolean({char: 'd'})
  }

  public rdtName: string

  public useDocker: boolean

  public renderData: any

  public mappings: Mapping[]

  public async preInit() {
    const {flags} = this.parse(Serve)

    const {app} = conf.getRdeConf()
    if (!app.template) {
      throw Error('template is not provided in you config file, please check')
    }

    return {
      useDocker: flags.docker,
      appConf: app
    }
  }

  public async initialize({appConf, useDocker}) {
    const {template, mappings} = appConf

    this.rdtName = template.name
    this.useDocker = useDocker
    this.renderData = template.render
    this.mappings = mappings
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
    _.asyncSpawn('npm', ['run', 'serve'], {
      cwd: conf.runtimeDir
    })
  }
}
