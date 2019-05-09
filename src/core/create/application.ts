import * as npmWhich from 'npm-which'
import * as path from 'path'

import conf from '../../services/conf'
import docker from '../../services/docker'
import npm from '../../services/npm'
import render from '../../services/render'
import _ from '../../util'

import CreateCore from './index'

export default class ApplicationCreate extends CreateCore {
  public async prepare() {
    await docker.pull(this.rdc)

    const name = this.rdc.split(':')[0]

    await _.asyncExec(`mkdir ${conf.localCacheDir}`)

    const eslintrcPath = `${conf.cwd}/${conf.localCacheDir}/.eslintrc.js`

    await docker.copy(
      this.rdc,
      [{
        from: `${conf.dockerWorkDirRoot}/${name}/app`,
        to: `${conf.cwd}/app`,
      }, {
        from: `${conf.dockerWorkDirRoot}/${name}/.eslintrc.js`,
        to: eslintrcPath
      }],
    )

    await this.getRdcConf()
    await this.installEslintExtends(eslintrcPath)
  }

  public async installEslintExtends(eslintrcPath) {
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
  }

  public async genConfFile() {
    const {appConfName} = conf
    const {docs, docker = {ports: []}} = this.rdcConf
    await render.renderTo(`rda/${appConfName.slice(0, -3)}`, {
      container: this.rdc,
      docs: docs ? docs.url : '',
      ports: JSON.stringify(docker.ports),
    }, appConfName)
  }

  public async genExtraFiles() {
    await render.renderTo('rda/README', {
      name: this.name,
      homepage: conf.homepage,
    }, 'README.md')

    await render.renderTo('.gitignore', {}, '.gitignore', {
      overwrite: true,
    })

    const eslintBinPath = npmWhich(conf.cwd).sync('eslint')
    const eslintLibPath = eslintBinPath.replace('bin/eslint', 'lib/node_modules/eslint')
    await render.renderDir(path.resolve(__dirname, '../../mustaches/rda/'), {
      eslintLibPath
    }, ['.xml'], conf.cwd, {
      filter(filename) {
        return path.extname(filename) !== '.mustache'
      },
      overwrite: true
    })
  }

  public getValidPluginName(plugin) {
    if (plugin.includes('eslint-plugin-')) {
      return plugin
    }
    return `eslint-plugin-${plugin}`
  }

  public getValidConfigName(name) {
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
