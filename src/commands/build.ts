import _ from '../util'

import Run from './run'
import RdtBuild from './template/build'

export default class Build extends RdtBuild {
  public static examples = [
    '$ rde build',
  ]

  public async run() {
    const {flags} = this.parse(Build)

    const list = _.restoreFlags(flags)

    await Run.run(['build', ...list])
  }
}
