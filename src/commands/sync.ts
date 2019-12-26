import {flags} from '@oclif/command'

import Base from '../base'
import RunBase from '../base/run'
import sync from '../services/sync'

export default class Sync extends RunBase {
  public static strict = false

  public static examples = [
    '$ rde sync',
  ]

  public static flags = {
    ...Base.flags,
    ...RunBase.flags,
    tnpm: flags.boolean({char: 't'}),
  }

  // Override parent useLocal
  public get useLocal() {
    return true
  }

  public async run() {
    const {flags} = this.parse(Sync)
    const tnpm = flags.tnpm

    await sync.start({
      skipInstall: false,
      npmCmd: tnpm ? 'tnpm' : 'npm'
    })
  }
}
