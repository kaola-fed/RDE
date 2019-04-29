import RunBase from '../../base/run'
import Core from '../../core/docker.run'

export default class DockerRun extends RunBase {
  public static description = 'run script inside docker container'

  public static examples = [
    '$ rde docker:run <cmd>',
  ]

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
    // await _.asyncSpawn('npm', ['run', `${this.cmd}`], {
    //   cwd: conf.runtimeDir
    // })
  }
}
