import {flags} from '@oclif/command'

import Base from '../base'
import conf from '../services/conf'
import Core from '../services/core'
import {logger} from '../services/logger'
import Watcher from '../services/watcher'
import _ from '../util'

export default class Serve extends Base {
  public static description = 'start a dev server'

  public static examples = [
    '$ rde serve',
  ]

  public static flags = {
    docker: flags.boolean({char: 'd'})
  }

  public static get rdeConf() {
    return conf.getRdeConf()
  }

  private docker = false

  public async preInit() {
    // 本地测试时使用
    process.chdir('rde-hello')
    const {args, flags} = this.parse(Serve)

    const {app} = Serve.rdeConf
    if (!app.template) {
      throw Error('template is not provided in you config file, please check')
    }

    // const {template} = Serve.rdeConf
    // const {docker} = template
    // if (!docker || !docker.ports || !docker.ports.length) {
    //   throw Error(`${conf.getTemplateName()} doesn't support docker mode, please rerun with $ rde serve`)
    // }

    return {...args, ...flags}
  }

  public async initialize(args: any) {
    this.docker = args.docker

    // try {
    //   this.validateAppRender()
    // } catch (e) {
    //   logger.error(e.message)
    //   this.exit(1)
    // }
  }

  public async preRun() {
    const {app, template} = Serve.rdeConf

    const core = new Core(app.template)
    await core.prepare()
    const watcher = new Watcher(template.mapping)
    watcher.start()
  }

  public async run() {
    logger.info('Start running serve...')
    await _.asyncSpawn('npm', ['run', 'serve'], {
      cwd: `.${conf.getCliName()}`
    })
  }

  private validateAppRender() {
    const {app, template} = Serve.rdeConf

    const valid = template.render.validate(app.render)

    if (!valid) {
      throw Error(`app render must provide required keys to use ${app.template}, please check`)
    }

    return true
  }
}
