import * as fs from 'fs'
import * as microMatch from 'micromatch'
import * as path from 'path'
import * as writePackage from 'write-pkg'

import _ from '../util'

import cache from './cache'
import conf from './conf'
import {debug} from './logger'
import npm from './npm'
import render from './render'

const {resolve} = path
const {ensureRequire} = _
export default {
  get localEslintrcPath() {
    return resolve(conf.localCacheDir, '.eslintrc.js')
  },
  get localRdcConfPath() {
    return resolve(conf.localCacheDir, conf.rdcConfName)
  },
  async prepare(rdc) {
    if (rdc === cache.get('rda.container')) {
      return
    }
    await this.installEslintExtends()
  },

  async installEslintExtends() {
    const rdcConf = ensureRequire(this.localRdcConfPath)
    const eslintrc = ensureRequire(this.localEslintrcPath)
    const {
      plugins,
      extends: pluginExtends,
      parserOptions = {}
    } = eslintrc

    const {parser} = parserOptions
    const {lint = {}} = rdcConf
    let lintPkgs = ['eslint', 'babel-eslint', 'typescript'].concat(lint.dependencies || [])

    if (plugins) {
      typeof plugins === 'string' ?
        lintPkgs.push(this.getValidPluginName(plugins)) :
        plugins.forEach(item => lintPkgs.push(this.getValidPluginName(item)))
    }
    if (pluginExtends) {
      typeof pluginExtends === 'string' ?
        lintPkgs.push(this.getValidConfigName(pluginExtends)) :
        pluginExtends.forEach(item => lintPkgs.push(this.getValidConfigName(item)))
    }

    if (parser) {
      lintPkgs.push(parser)
    }

    // use parent dir of cwd as workspace
    const workspacePath = resolve(conf.cwd, '..')
    const pkgJson = resolve(workspacePath, 'package.json')
    if (!fs.existsSync(pkgJson)) {
      await writePackage(workspacePath, {
        name: '@rde/workspace'
      })
    }

    // reason of .. is create use process.chdir at preRun
    await npm.install({
      pkgs: [...new Set(lintPkgs)],
      dir: workspacePath
    })
  },

  async renderDir(isRda) {
    const join = path.join
    let eslintBinPath = ''
    try {
      // use parent dir of cwd as workspace
      const workspacePath = resolve(conf.cwd, '..')
      eslintBinPath = resolve(workspacePath, 'node_modules', 'eslint')
    } catch (err) {
      if (err) {
        eslintBinPath = ''
      }
    }

    const eslintLibPath = eslintBinPath.replace(join('bin', 'eslint'), join('lib', 'node_modules', 'eslint'))
    const eslintrcPath = isRda ? '.cache/.eslintrc.js' : 'template/.eslintrc.js'

    debug(`global eslint path: ${eslintLibPath}`)
    debug(`eslintrc path: ${eslintrcPath}`)

    await render.renderDir(resolve(__dirname, '..' , 'mustaches', 'ide'), {
      eslintLibPath,
      eslintrcPath
    }, ['.xml', '.json'], conf.cwd, {
      overwrite: true,
    })
  },

  getValidPluginName(plugin) {
    if (plugin.includes('eslint-plugin-')) {
      return plugin
    }

    if (plugin[0] === '@') {
      const arr = plugin.split('/')
      const scope = arr[0]
      const name = arr[1]
      return `${scope}/eslint-plugin-${name.split('/')[0]}`
    }

    return `eslint-plugin-${plugin.split('/')[0]}`
  },

  getValidConfigName(name) {
    if (name.includes('eslint-config-')) {
      return name.split('/')[0]
    }
    if (name.includes('eslint:')) {
      return ''
    }
    if (name.includes('plugin:')) {
      const plugin = name.split(':')[1]
      return this.getValidPluginName(plugin)
    }
    if (name[0] === '@') {
      const arr = name.split('/')
      const scope = arr[0]
      const plugin = arr[1]
      return `${scope}/eslint-config-${plugin.split('/')[0]}`
    }

    return `eslint-config-${name.split('/')[0]}`
  },

  getLintFiles(filenames) {
    const rdaConf = conf.getAppConf()
    const lintFiles = rdaConf.container.render.lintFiles || []
    return microMatch(filenames, lintFiles, {
      basename: true
    })
  }
}
