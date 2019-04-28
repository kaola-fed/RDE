import Base from '../base'
import _ from '../util'

import Run from './run'

export default class Serve extends Base {
  public static examples = [
    '$ rde serve',
  ]

  public async run() {
    const {flags} = this.parse(Serve)

    const list = _.restoreFlags(flags)

    await Run.run(['serve', '--watch', ...list])
  }
}
