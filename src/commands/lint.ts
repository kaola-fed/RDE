import * as sgf from 'staged-git-files'
import * as util from 'util'

import Base from '../base'
import _ from '../util'

import Run from './run'

export default class Lint extends Base {
  public static strict = false

  public static examples = [
    '$ rde lint',
  ]

  public static flags = {
    ...Base.flags,
    ...Run.flags,
  }

  public async run() {
    const {flags} = this.parse(Lint)

    const list = _.restoreFlags(flags)
    if (flags.staged) {
      let filenames = []
      await util.promisify(sgf)('ACM').then(files => {
        filenames = files.map(file => file.filename)
          .filter(file => /(app\/)|(template\/)/.test(file))
      })

      list.push(`--extras=${filenames.join(' ')}`)
    }

    await Run.run(['lint', ...list])
  }
}
