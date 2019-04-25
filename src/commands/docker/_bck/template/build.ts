import Command from '@oclif/command'

import _ from '../../util'

import Run from './run'

export default class RdtBuild extends Command {
  public static description = 'start build'

  public static examples = [
    '$ rde template:build',
  ]

  public static flags = {
    ...Run.flags,
  }

  public async run() {
    const {flags} = this.parse(RdtBuild)

    const list = _.restoreFlags(flags)

    await Run.run(['build', ...list])
  }
}
