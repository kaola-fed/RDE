import Command from '@oclif/command'

import _ from '../../util'
import Run from '../run'

export default class LintFix extends Command {
  public static description = 'run lint:fix provided by rdt'

  public static examples = [
    '$ rde lint:fix',
  ]

  public static flags = {
    ...Run.flags,
  }

  public async run() {
    const {flags} = this.parse(LintFix)

    const list = _.restoreFlags(flags)

    await Run.run(['lint:fix', ...list])
  }
}
