import Base from '../base'
import _ from '../util'

import Run from './run'

export default class Build extends Base {
  public static examples = [
    '$ rde build',
  ]

  public async run() {
    const {flags} = this.parse(Build)

    const list = _.restoreFlags(flags)

    await Run.run(['build', ...list])
  }
}
