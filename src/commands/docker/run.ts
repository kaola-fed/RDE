import {flags} from '@oclif/command'

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
    toJson: flags.boolean({
      description: 'using with lint, format output to json',
    }),
  }

  public toJson = false

  public async preInit() {
    await super.preInit()

    const {flags} = this.parse(DockerRun)
    this.toJson = flags.toJson
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
    if (this.toJson) {
      args = args.concat(['--', '--format', 'json'])
    }

    await _.asyncSpawn('npm', args, {
      cwd: conf.runtimeDir,
      env: process.env
    })
  }
}
