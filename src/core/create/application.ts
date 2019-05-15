import * as path from 'path'

import conf from '../../services/conf'
import docker from '../../services/docker'
import eslint from '../../services/eslint'
import render from '../../services/render'
import _ from '../../util'

import CreateCore from './index'

const {join} = path
export default class ApplicationCreate extends CreateCore {
  public async prepare() {
    await docker.pull(this.rdc)

    const name = this.rdc.split(':')[0]

    await _.asyncExec(`mkdir ${conf.localCacheDir}`)

    const eslintrcPath = join(conf.cwd, conf.localCacheDir, '.eslintrc.js')

    await docker.copy(
      this.rdc,
      [{
        from: join(conf.dockerWorkDirRoot, name, 'app'),
        to: join(conf.cwd, 'app'),
      }, {
        from: join(conf.dockerWorkDirRoot, name, 'template', '.eslintrc.js'),
        to: eslintrcPath
      }],
    )

    await this.getRdcConf()
    await eslint.installEslintExtends(eslintrcPath)
  }

  public async genConfFile() {
    const {appConfName} = conf
    const {docs, docker = {ports: []}} = this.rdcConf
    await render.renderTo(join('rda', appConfName.slice(0, -3)), {
      container: this.rdc,
      docs: docs ? docs.url : '',
      ports: JSON.stringify(docker.ports),
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
