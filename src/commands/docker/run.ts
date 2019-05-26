import RunBase from '../../base/run'
import Core from '../../core/docker.run'
import conf from '../../services/conf'
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
    if (!this.cmd) {
      return
    }

    process.env.PATH = `${process.env.PATH}:${conf.cwd}/node_modules/.bin`

    let args = ['run', `${this.cmd}`]
    if (this.extras) {
      args.push('--')
      args = args.concat(this.extras.split(' '))
    }

    await _.asyncSpawn('npm', args, {
      cwd: conf.dockerWorkDirRoot,
      env: process.env
    })
  }
}
