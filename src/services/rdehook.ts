import * as fs from 'fs'
import * as path from 'path'

import conf from './conf'

class Rdehook {
  public async trigger(type) {
    const hookPath = path.resolve(conf.templateDir, '_rdehooks', `${type}.js`)

    if (fs.existsSync(hookPath)) {
      const hookFn = require(hookPath)
      await hookFn()
    }
  }
}

export default new Rdehook()
