import * as fs from 'fs'
import * as path from 'path'

import Base from '../../base'
import cache from '../../services/cache'
import conf from '../../services/conf'
import _ from '../../util'

export default class RdtRun extends Base {
  public static description = 'run script'

  public static examples = [
    '$ rde template:run <script>',
  ]

  public static args = [{
    name: 'cmd',
    required: true,
    description: 'scripts provided by rdt',
  }]

  public static flags = {
    ...Base.flags,
  }

  public rdtName: string

  public mappings: Mapping[]

  public cmd: string

  public renderData: any

  public get needInstall() {
    let flag = false
    const {resolve} = path
    // 判断 template/package.json 修改时间
    const fsStats = fs.statSync(resolve(conf.cwd, 'template', 'package.json'))

    const tplPkgJsonMTime = fsStats.mtimeMs
    if (tplPkgJsonMTime !== cache.get('tplPkgJsonMTime')) {
      cache.set('tplPkgJsonMTime', tplPkgJsonMTime)
      flag = true
    }
    // 判断 extends 的rdt 版本 和 运行时目录下的版本是否一致
    const rdtConf = _.ensureRequire(resolve(conf.cwd, conf.rdtConfName))
    if (rdtConf.extends) {
      const {devDependencies = {}, dependencies = {}} = _.ensureRequire(resolve(conf.cwd, 'package.json'))
      const extendsRdtVersion = devDependencies[rdtConf.extends] || dependencies[rdtConf.extends]
      const runtimeVersion = cache.get(rdtConf.extends)
      if (extendsRdtVersion !== runtimeVersion) {
        cache.set(rdtConf.extends, extendsRdtVersion)
        flag = true
      }
    }
    return flag
  }

  public async preInit() {
    const {args} = this.parse(RdtRun)

    return {
      cmd: args.cmd,
    }
  }

  public async initialize({cmd}) {
    this.cmd = cmd

    this.rdtName = '../'
    this.renderData = null
    this.mappings = [
      {from: 'template', to: ''}
    ]
  }

  public async preRun() {
    if (this.quickRun) {
      return
    }

    const core = this.getCoreInstance({
      topRdtNode: this.rdtName,
      renderData: this.renderData,
      mappings: this.mappings,
      keepWatch: this.watch,
      needInstall: this.needInstall
    })

    await core.prepare()
  }

  public async run() {
    await _.asyncSpawn('npm', ['run', `${this.cmd}`], {
      cwd: conf.runtimeDir
    })
  }
}
