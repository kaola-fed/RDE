import * as fs from 'fs'
import * as path from 'path'

import Base from '../../base'
import DockerCore from '../../core/docker:run'
import cache from '../../services/cache'
import conf from '../../services/conf'
import _ from '../../util'

export default class DockerRun extends Base {
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

  public get isRda() {
    return fs.existsSync(conf.appConfPath)
  }

  public get isRdcNeedInstall() {
    let flag = false
    const {resolve} = path
    // 判断 template/package.json 修改时间
    const rdcPkgJsonPath = resolve(conf.cwd, 'template', 'package.json')
    if (fs.existsSync(rdcPkgJsonPath)) {
      const fsStats = fs.statSync(rdcPkgJsonPath)

      const tplPkgJsonMTime = fsStats.mtimeMs
      if (tplPkgJsonMTime !== cache.get('tplPkgJsonMTime')) {
        cache.set('tplPkgJsonMTime', tplPkgJsonMTime)
        flag = true
      }
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

  public get isRdaNeedInstall() {
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
    const {args} = this.parse(DockerRun)

    if (this.isRda) {
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
    return {
      cmd: args.cmd,
      rdtName: '../',
      renderData: null,
      mappings: [
        {from: 'template', to: ''}
      ]
    }
  }

  public async initialize({cmd, rdtName, renderData, mappings}) {
    this.cmd = cmd

    this.rdtName = rdtName
    this.renderData = renderData
    this.mappings = mappings
  }

  public async preRun() {
    if (this.quickRun) {
      return
    }

    const core = new DockerCore({
      topRdtNode: this.rdtName,
      renderData: this.renderData,
      mappings: this.mappings,
      keepWatch: this.watch,
      needInstall: this.isRda ? this.isRdaNeedInstall : this.isRdcNeedInstall
    })

    await core.prepare()
  }

  public async run() {
    await _.asyncSpawn('npm', ['run', `${this.cmd}`], {
      cwd: conf.runtimeDir
    })
  }
}
