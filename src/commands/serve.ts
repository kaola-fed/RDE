import Command from '@oclif/command'

import _ from '../util'

import Run from './run'

export default class Serve extends Command {
  public static description = 'start dev'

  public static examples = [
    '$ rde serve',
  ]

  public static flags = {
    ...Run.flags,
  }

  public async run() {
    const {flags} = this.parse(Serve)

    const list = _.restoreFlags(flags)

    await Run.run(['serve', ...list])
  }
}
