import * as fs from 'fs'
import * as globby from 'globby'
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
    return resolve(conf.cwd, '.eslintrc.js')
  }

  public async initSettings(isApp) {
    debug(`eslint pkg path: ${this.eslintPkgPath}`)
    debug(`eslintrc path: ${this.eslintrcPath}`)

    await render.renderDir(resolve(__dirname, '..' , 'mustaches', 'ide'), {
      eslintPkgPath: this.eslintPkgPath,
      eslintrcPath: this.eslintrcPath,
      isApp,
    }, ['.xml', '.json', '.iml'], conf.cwd, {
      overwrite: true,
    })
  }

  public async initAppExcludeSettings(ignore) {
    let excludePaths = await globby(['**/*'], {
      onlyFiles: false,
      ignore,
      dot: true,
    })

    excludePaths = excludePaths.filter(item => {
      const escaped = item.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      const regexp = new RegExp(`^${escaped}`)
      return !ignore.some(file => regexp.test(file))
    })

    let excludes = {}
    excludePaths.forEach(item => {
      excludes[item] = true
    })

    fs.writeFileSync(
      '.vscode/settings.json',
      JSON.stringify({
        'files.exclude': {
          rdc: true,
          ...excludes,
        }
      }),
      {encoding: 'UTF-8'},
    )
  }
}

export default new IDE()
