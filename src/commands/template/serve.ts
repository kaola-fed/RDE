import Command from '@oclif/command'

import _ from '../../util'

import Run from './run'

export default class RdtServe extends Command {
  public static description = 'start dev'

  public static examples = [
    '$ rde serve',
  ]

  public static flags = {
    ...Run.flags,
  }

  public async run() {
    const {flags} = this.parse(RdtServe)

    const list = _.restoreFlags(flags)

    await Run.run(['serve', ...list])
  }
}
