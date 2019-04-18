import {flags} from '@oclif/command'
import {spawn} from 'child_process'

import Base from '../../base'
import Conf from '../../services/conf'
import Core from '../../services/core'
import { logger } from '../../services/logger';

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
    // process.chdir('rdt-hello')
    const core = new Core('../')
    await core.prepare()
    core.watchAndCopy()
  }

  async run() {
    process.chdir(`.${Conf.getCliName()}`)
    logger.info('Start running serve...')
    const child = spawn('npm', ['run', 'serve'], {
      stdio: 'inherit'
    })
    child.on('close', code => {
      logger.warn(`npm run serve exited with code ${code}`)
      process.exit(code)
    })
  }
}
