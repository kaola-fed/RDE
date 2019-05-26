import * as path from 'path'

import cache from '../../services/cache'
import conf from '../../services/conf'
import docker from '../../services/docker'
import render from '../../services/render'
import sync from '../../services/sync'
import _ from '../../util'

import CreateCore from './index'

const {join, resolve} = path
export default class ApplicationCreate extends CreateCore {
  public rdcConf: RdcConf = null

  public async prepare() {
    await docker.pull(this.rdc)
    await _.asyncExec(`mkdir ${conf.localCacheDir}`)
    cache.set('container', this.rdc)

    const {
      cwd,
      rdcConfName,
      dockerRdcDir,
    } = conf
    const rdcConfPath = resolve(conf.localCacheDir, rdcConfName)

    await sync.genAppStagedFiles(this.rdc)

    this.rdcConf = require(rdcConfPath)
    const {exportFiles = []} = this.rdcConf
    if (exportFiles.length) {
      await docker.copy(
        this.rdc,
        exportFiles.map(filePath => ({
          from: resolve(dockerRdcDir, filePath),
          to: resolve(cwd, filePath, '../'),
        })),
      )
    }
  }

  public async genConfFile() {
    const {appConfName} = conf
    const {docs, docker = {ports: []}} = this.rdcConf
    await render.renderTo(join('rda', appConfName.slice(0, -3)), {
      container: this.rdc,
      docs: docs ? docs.url : '',
      ports: docker.ports,
    }, appConfName)
  }

  public async genExtraFiles() {
    const {exportFiles = []} = this.rdcConf

    await render.renderTo(join('rda', 'README'), {
      name: this.name,
      homepage: conf.homepage,
    }, 'README.md')

    await render.renderTo('app.gitignore', {
      exportFiles,
      appBasicFiles: conf.appBasicFiles,
    }, '.gitignore', {
      overwrite: true,
    })
  }
}
