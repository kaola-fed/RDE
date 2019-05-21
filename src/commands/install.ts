import Base from '../base'
import RunBase from '../base/run'
import conf from '../services/conf'
import install from '../services/install'

export default class Install extends RunBase {
  public static strict = false

  public static examples = [
    '$ rde install',
  ]

  public static flags = {
    ...Base.flags,
    ...RunBase.flags,
  }

  public async run() {
    await install.pkg(conf.rdType)
  }
}
