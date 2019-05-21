import {flags} from '@oclif/command'
import * as sgf from 'staged-git-files'
import * as util from 'util'
import * as validateMessage from 'validate-commit-msg'

import Base from '../base'
import RunBase from '../base/run'
import eslint from '../services/eslint'
import {MCOMMON} from '../services/message'
import _ from '../util'

import Run from './run'

export default class Lint extends RunBase {
  public static strict = false

  public static examples = [
    '$ rde lint',
  ]

  public static flags = {
    ...Base.flags,
    ...Run.flags,
    staged: flags.boolean({
      char: 's',
      description: 'lint staged',
    }),
    commitMsg: flags.string({
      char: 'm',
      description: 'commit msg',
    }),
  }

  public async run() {
    const {flags} = this.parse(Lint)

    if (flags.commitMsg) {
      if (!validateMessage(flags.commitMsg)) {
        throw Error(MCOMMON.INVALID_COMMIT_MSG_FORMAT)
      }
      return
    }

    if (flags.staged) {
      let filenames = []
      await util.promisify(sgf)('ACM').then(files => {
        filenames = files.map(file => file.filename)
          .filter(file => /(app\/)|(runtime\/)/.test(file))
      })
      filenames = eslint.getLintFiles(filenames)

      flags.extras = filenames.join(' ')
      delete flags.staged
    }

    const list = _.restoreFlags(flags)

    await Run.run(['lint', ...list])
  }
}
