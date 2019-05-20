import * as fs from 'fs'
import * as path from 'path'

import conf from '../../services/conf'
import _ from '../../util'

const {join} = path
export default class CreateCore {
  public name = ''

  public framework = 'vue'

  // format: name:version
  public rdc = ''

  public extendRdc = false

  public rdcRepo = ''

  constructor({name, framework, rdc, extendRdc, rdcRepo}) {
    this.name = name
    this.framework = framework
    this.rdc = rdc
    this.extendRdc = extendRdc
    this.rdcRepo = rdcRepo
  }

  public async start() {
    await _.asyncExec(`rm -rf ${conf.tmpDir} && mkdir ${conf.tmpDir}`)

    // pull resources
    await this.prepare()

    await this.genConfFile()

    await this.genExtraFiles()

    await this.registerHooks()
  }

  public async registerHooks() {
    await _.asyncExec('git init')

    fs.writeFileSync(join('.git', 'hooks', 'pre-commit'),
      `
#!/bin/sh
rde lint -s
      `, {encoding: 'UTF-8', mode: '755'})

    fs.writeFileSync(join('.git', 'hooks', 'commit-msg'),
      `
#!/bin/sh
commitMsg=$(cat $1)
rde lint -m "$commitMsg"
      `, {encoding: 'UTF-8', mode: '755'})
  }

  protected async prepare() {}

  protected async genConfFile() {}

  protected async genExtraFiles() {}
}
