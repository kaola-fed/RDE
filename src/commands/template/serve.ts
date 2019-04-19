import {flags} from '@oclif/command'

import Base from '../../base'
import conf from '../../services/conf'
import Core from '../../services/core'
import {logger} from '../../services/logger'
import Watcher from '../../services/watcher'
import _ from '../../util'

export default class Serve extends Base {
  public static description = 'start a template dev server'

  public static examples = [
    '$ rde template:serve',
  ]

  public static flags = {
    docker: flags.boolean({char: 'd'})
  }

  private docker = false

  public async preInit() {
    // 本地测试时使用
    process.chdir('rdt-hello')
    const {args, flags} = this.parse(Serve)

    return {...args, ...flags}
  }

  public async initialize(args: any) {
    this.docker = args.docker
  }

  public async preRun() {
    const core = new Core('../')
    await core.prepare()
    const watcher = new Watcher()
    watcher.start()
  }

  public async run() {
    logger.info('Start running serve...')
    await _.asyncSpawn('npm', ['run', 'serve'], {
      cwd: conf.runtimeDir
    })
  }
}
