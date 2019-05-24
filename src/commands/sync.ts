import Base from '../base'
import RunBase from '../base/run'
import sync from '../services/sync'

export default class Sync extends RunBase {
  public static strict = false

  public static examples = [
    '$ rde install',
  ]

  public static flags = {
    ...Base.flags,
    ...RunBase.flags,
  }

  public async run() {
    await sync.all({
      watch: false,
      cmd: 'sync'
    })
  }
}
