import {flags} from '@oclif/command'

import Base from '../../base'
import Core from '../../services/core'

export default class Serve extends Base {
  static description = 'start a template dev server'

  static examples = [
    '$ rde template:serve',
  ]

  static flags = {
    docker: flags.boolean({char: 'd'})
  }

  private docker = false

  async preInit() {
    const {args, flags} = this.parse(Serve)

    return {...args, ...flags}
  }

  async initialize(args: any) {
    this.docker = args.docker

  }

  async render() {
    // process.chdir('rdt-hello')
    const core = new Core()
    core.prepare('../')
  }

  async preRun() {}

  async run() {}
}
