import * as path from 'path'

import Base from '../base'
import RunBase from '../base/run'
import conf from '../services/conf'
import sync from '../services/sync'

const {resolve} = path
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
    if (conf.isApp) {
      const {cwd, localCacheDir} = conf

      await sync.mergePkgJson(
        resolve(cwd, 'app', 'package.json'),
        resolve(cwd, localCacheDir, 'package.json'),
        resolve(localCacheDir),
      )
    }

    await sync.install()
  }
}
