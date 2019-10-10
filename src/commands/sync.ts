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
  }

  // Override parent useLocal
  public get useLocal() {
    return true
  }

  public async run() {
    await sync.start({
      skipInstall: false
    })
  }
}
