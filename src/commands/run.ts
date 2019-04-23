import * as fs from 'fs'
import * as path from 'path'

import Base from '../base'
import conf from '../services/conf'
import _ from '../util'

import RdtRun from './template/run'

export default class Run extends RdtRun {
  public static description = 'run scripts provided by rde'

  public static examples = [
    '$ rde run <script>',
  ]

  public static args = [{
    name: 'cmd',
    required: true,
    description: 'scripts provided by rdt',
  }]

  public static flags = {
    ...Base.flags,
  }

  public async preInit() {
    const {args} = this.parse(Run)

    const {app} = conf.getRdeConf()
    const {template, mappings} = app
    if (!template) {
      throw Error('template is not provided in you config file, please check')
    }

    return {
      cmd: args.cmd,
      rdtName: template.name,
      renderData: template.render,
      mappings,
    }
  }

  public async initialize({cmd, rdtName, renderData, mappings}) {
    this.cmd = cmd

    this.rdtName = rdtName
    this.renderData = renderData
    this.mappings = mappings
    this.needInstall = await this.getNeedInstall()
  }

  public async getNeedInstall() {
    const {resolve} = path
    const pkgJson = _.ensureRequire(resolve(conf.cwd, 'package.json'))
    const rdtVersion = pkgJson.devDependencies[this.rdtName] || pkgJson.dependencies[this.rdtName]

    let runtimeRdt = ''
    try {
      runtimeRdt = fs.readFileSync(resolve(conf.runtimeDir, '.rdt'), {encoding: 'UTF-8'})
    } catch (e) {
      if (e) {
        runtimeRdt = ''
      }
    }
    const rdt = `${this.rdtName}:${rdtVersion}`

    if (rdt !== runtimeRdt || !fs.existsSync(resolve(conf.runtimeDir, 'node_modules'))) {
      fs.writeFileSync(resolve(conf.runtimeDir, '.rdt'), rdt, {encoding: 'UTF-8'})
      return true
    }
    return false

  }
}
