import * as path from 'path'
import * as stringifyObject from 'stringify-object'

import conf from '../../services/conf'
import docker from '../../services/docker'
import eslint from '../../services/eslint'
import render from '../../services/render'
import _ from '../../util'

import CreateCore from './index'

const {join, resolve} = path
export default class ApplicationCreate extends CreateCore {
  public rdcConf: RdcConf = null

  public async prepare() {
    await docker.pull(this.rdc)
    await _.asyncExec(`mkdir ${conf.localCacheDir}`)

    const name = this.rdc.split(':')[0]
    const {dockerWorkDirRoot} = conf
    const rdcPathInDock = resolve(dockerWorkDirRoot, name)
    const confPath = resolve(conf.localCacheDir, conf.rdcConfName)
    await docker.copy(
      this.rdc,
      [{
        from: join(rdcPathInDock, 'app'),
        to: join(conf.cwd, 'app'),
      }, {
        from: join(rdcPathInDock, conf.rdcConfName),
        to: confPath
      }, {
        from: resolve(rdcPathInDock, 'template/.eslintrc.js'),
        to: resolve(conf.localCacheDir, '.eslintrc.js')
      }],
    )

    this.rdcConf = require(confPath)
    await eslint.prepare(this.rdc)
  }

  public async genConfFile() {
    const {appConfName} = conf
    const {docs, docker = {ports: []}} = this.rdcConf
    await render.renderTo(join('rda', appConfName.slice(0, -3)), {
      container: this.rdc,
      docs: docs ? docs.url : '',
      ports: stringifyObject(docker.ports),
    }, appConfName)
  }

  public async genExtraFiles() {
    await render.renderTo(join('rda', 'README'), {
      name: this.name,
      homepage: conf.homepage,
    }, 'README.md')

    await render.renderTo('.gitignore', {}, '.gitignore', {
      overwrite: true,
    })

    await eslint.renderDir(true)
  }
}
