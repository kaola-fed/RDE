import {flags} from '@oclif/command'

import Base from '../../base'
import Conf from '../../services/conf'
import Core from '../../services/core'
import {logger} from '../../services/logger'
import Watcher from '../../services/watcher'
import _ from '../../util'

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

  async preRun() {
    // 本地测试时使用
    process.chdir('rdt-hello')
    const core = new Core('../')
    await core.prepare()
    const watcher = new Watcher()
    watcher.start()
  }

  async run() {
    logger.info('Start running serve...')
    _.asyncSpawn('npm', ['run', 'serve'], {
      cwd: `.${Conf.getCliName()}`
    })
  }
}
