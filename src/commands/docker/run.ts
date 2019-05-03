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

  public async preRun() {
    const core = new Core({
      watch: this.watch,
    })

    await core.start()
  }

  public async run() {
    process.env.PATH = `${process.env.PATH}:${conf.dockerWorkDirRoot}/node_modules/.bin`

    await _.asyncSpawn('npm', ['run', `${this.cmd}`], {
      cwd: conf.runtimeDir,
      env: process.env
    })
  }
}
