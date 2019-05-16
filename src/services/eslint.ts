import * as npmWhich from 'npm-which'
import * as path from 'path'

import _ from '../util'

import cache from './cache'
import conf from './conf'
import docker from './docker'
import npm from './npm'
import render from './render'

export default {
  get localEslintrcPath() {
    return path.resolve(conf.cwd, conf.localCacheDir, '.eslintrc.js')
  },

  async prepare(rdc) {
    if (rdc === cache.get('rda.container')) {
      return
    }
    const rdcName = rdc.split(':')[0]
    await docker.copy(
      rdc, [
        {
          from: this.getDockerEslintrcPath(rdcName),
          to: this.localEslintrcPath
        }
      ]
    )
    await this.installEslintExtends()
  },

  getDockerEslintrcPath(rdcName) {
    return path.resolve(conf.dockerWorkDirRoot, rdcName, 'template', '.eslintrc.js')
  },

  async installEslintExtends() {
    const eslintrc = _.ensureRequire(this.localEslintrcPath)
    let eslintDevs = ['eslint', 'babel-eslint']
    if (eslintrc.plugins) {
      typeof eslintrc.plugins === 'string' ?
        eslintDevs.push(this.getValidPluginName(eslintrc.plugins)) :
        eslintrc.plugins.forEach(item => eslintDevs.push(this.getValidPluginName(item)))
    }
    if (eslintrc.extends) {
      typeof eslintrc.extends === 'string' ?
        eslintDevs.push(this.getValidConfigName(eslintrc.extends)) :
        eslintrc.extends.forEach(item => eslintDevs.push(this.getValidConfigName(item)))
    }
    eslintDevs = [...new Set(eslintDevs)]

    await npm.install(`${eslintDevs.join(' ')} -g`)
  },

  async renderDir(isRda) {
    const join = path.join
    let eslintBinPath = ''
    try {
      eslintBinPath = npmWhich(conf.cwd).sync('eslint')
    } catch (err) {
      if (err) {
        eslintBinPath = ''
      }
    }

    const eslintLibPath = eslintBinPath.replace(join('bin', 'eslint'), join('lib', 'node_modules', 'eslint'))
    const eslintrcPath = isRda ? '.cache/.eslintrc.js' : 'template/.eslintrc.js'
    await render.renderDir(path.resolve(__dirname, '..' , 'mustaches', 'eslint'), {
      eslintLibPath,
      eslintrcPath
    }, ['.xml', '.json'], conf.cwd, {
      overwrite: true
    })
  },

  getValidPluginName(plugin) {
    if (plugin.includes('eslint-plugin-')) {
      return plugin
    }
    return `eslint-plugin-${plugin}`
  },

  getValidConfigName(name) {
    if (name.includes('eslint-config-')) {
      return name.split('/')[0]
    }
    if (name.includes('eslint:')) {
      return ''
    }
    if (name.includes('plugin:')) {
      const plugin = name.split(':')[1].split('/')[0]
      return this.getValidPluginName(plugin)
    }
    return `eslint-config-${name.split('/')[0]}`
  }
}
