import * as npmWhich from 'npm-which'
import * as path from 'path'

import _ from '../util'

import conf from './conf'
import npm from './npm'
import render from './render'

export default {
  async installEslintExtends(eslintrcPath) {
    const eslintrc = _.ensureRequire(eslintrcPath)
    let eslintDevs = []
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

  async renderDir() {
    const join = path.join
    const eslintBinPath = npmWhich(conf.cwd).sync('eslint')
    const eslintLibPath = eslintBinPath.replace(join('bin', 'eslint'), join('lib', 'node_modules', 'eslint'))
    await render.renderDir(path.resolve(__dirname, '..' , 'mustaches', 'rda'), {
      eslintLibPath
    }, ['.xml'], conf.cwd, {
      filter(filename) {
        return path.extname(filename) !== '.mustache'
      },
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
