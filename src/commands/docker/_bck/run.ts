import * as fs from 'fs'
import * as path from 'path'

import Base from '../base'
import cache from '../services/cache'
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

  public get needInstall() {
    const {resolve} = path
    const {devDependencies = {}, dependencies = {}} = _.ensureRequire(resolve(conf.cwd, 'package.json'))
    const rdtVersion = devDependencies[this.rdtName] || dependencies[this.rdtName]

    const runtimeRdtVersion = cache.get(this.rdtName)

    // 判断运行时目录的 rdt 版本 和 项目根目录下 package.json 的 rdt 版本是否一致
    if (rdtVersion !== runtimeRdtVersion || !fs.existsSync(resolve(conf.runtimeDir, 'node_modules'))) {
      cache.set(this.rdtName, rdtVersion)
      return true
    }
    return false
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
  }
}
