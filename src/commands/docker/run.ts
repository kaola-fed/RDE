import RunBase from '../../base/run'
import Core from '../../core/docker.run'
import conf from '../../services/conf'
import mapping from '../../services/mapping'
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
  }

  public async run() {
    process.env.PATH = `${process.env.PATH}:${conf.dockerWorkDirRoot}/node_modules/.bin`

    let args = ['run', `${this.cmd}`]
    if (this.extras) {
      args.push('--')
      let extras = []
      if (this.cmd === 'lint') {
        extras = this.extras.split(' ').map(item => {
          // map app path to dest path
          if (/^app\/.*/.test(item)) {
            return mapping.from2Dest(item)
          }

          if (/^template\/.*/.test(item)) {
            return item.replace(/^template\//, '')
          }
          return item
        })
      } else {
        extras = this.extras.split(' ')
      }
      args = args.concat(extras)
    }

    await _.asyncSpawn('npm', args, {
      cwd: conf.runtimeDir,
      env: process.env
    })
  }
}
