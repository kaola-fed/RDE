import * as fs from 'fs-extra'
import * as path from 'path'

import RunBase from '../../base/run'
import Core from '../../core/docker.run'
import conf from '../../services/conf'
import rdehook from '../../services/rdehook'
import _ from '../../util'

export default class DockerRun extends RunBase {
  public static description = 'run script inside docker container'

  public static examples = [
    '$ rde docker:run <cmd>',
  ]

  public static args = [...RunBase.args]

  public static flags = {
    ...RunBase.flags,
  }

  public async preInit() {
    await super.preInit()

    const {flags} = this.parse(DockerRun)
    this.extras = flags.extras
  }

  public async preRun() {
    const core = new Core({
      watch: this.watch,
    })

    await core.start()

    await rdehook.trigger('preRun')
  }

  public async run() {
    if (!this.cmd) {
      return
    }

    process.env.PATH = `${process.env.PATH}:${conf.cwd}/node_modules/.bin`

    let args = ['run', `${this.cmd}`]
    if (this.extras) {
      args.push('--')
      let extras = []
      if (this.cmd === 'lint') {
        extras = this.extras.split(' ').map(item => {
          // fix path to relative to .rde path
          if (/^(app|template)\/.*/.test(item)) {
            return path.join('..', item)
          }
          return item
        })
      } else {
        extras = this.extras.split(' ')
      }
      args = args.concat(extras)
    }

    if (process.platform === 'win32') {
      await fs.ensureSymlink('node_modules', path.join('.integrate', 'node_modules'))
    }

    await _.asyncSpawn('npm', args, {
      cwd: conf.isIntegrate ? conf.integrateDir : conf.runtimeDir,
      env: process.env
    })
    process.exit(0)

    await rdehook.trigger('postRun')
  }
}
