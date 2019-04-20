import Command from '@oclif/command'

import _ from '../../util'
import Run from '../run'

export default class Lint extends Command {
  public static description = 'run lint provided by rdt'

  public static examples = [
    '$ rde lint',
  ]

  public static flags = {
    ...Run.flags,
  }

  public async run() {
    const {flags} = this.parse(Lint)

    const list = _.restoreFlags(flags)

    await Run.run(['lint', ...list])
  }
}
