import _ from '../util'

import Run from './run'
import RdtLint from './template/lint'

export default class Lint extends RdtLint {
  public static examples = [
    '$ rde lint',
  ]

  public async run() {
    const {flags} = this.parse(Lint)

    const list = _.restoreFlags(flags)

    await Run.run(['lint', ...list])
  }
}
