import _ from '../util'

import Run from './run'
import RdtServe from './template/serve'

export default class Serve extends RdtServe {
  public static examples = [
    '$ rde serve',
  ]

  public async run() {
    const {flags} = this.parse(Serve)

    const list = _.restoreFlags(flags)

    await Run.run(['serve', '--watch', ...list])
  }
}
