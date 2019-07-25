import * as fs from 'fs'
import * as path from 'path'

import conf from './conf'
import {debug} from './logger'
import render from './render'

const {resolve} = path

class IDE {
  public get rdcConfPath() {
    return resolve(conf.localCacheDir, conf.rdcConfName)
  }

  public get eslintPkgPath() {
    return resolve(conf.cwd, 'node_modules', 'eslint')
  }

  public get eslintrcPath() {
    return resolve(conf.templateDir, '.eslintrc.js')
  }

  public async initSettings(isApp) {
    debug(`eslint pkg path: ${this.eslintPkgPath}`)
    debug(`eslintrc path: ${this.eslintrcPath}`)

    // gen ide files if ide files does not exist locally
    if (
      !fs.existsSync(resolve(conf.cwd, '.idea')) &&
      !fs.existsSync(resolve(conf.cwd, '.vscode'))
    ) {
      await render.renderDir(resolve(__dirname, '..' , 'mustaches', 'ide'), {
        eslintPkgPath: this.eslintPkgPath,
        eslintrcPath: this.eslintrcPath,
        isApp,
      }, ['.xml', '.json', '.iml'], conf.cwd, {
        overwrite: true,
      })
    }
  }
}

export default new IDE()
