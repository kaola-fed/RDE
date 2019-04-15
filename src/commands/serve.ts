import {flags} from '@oclif/command'
import {exec} from 'child_process'
import * as path from 'path'
import * as util from 'util'

import Base from '../base'
import conf from '../services/conf'
import {logger} from '../services/logger'
import render from '../services/render'

const asyncExec = util.promisify(exec)

export default class Serve extends Base {
  static description = 'start a dev server'

  static examples = [
    '$ rde serve',
  ]

  static flags = {
    docker: flags.boolean({char: 'd'})
  }

  readonly rdeConf: RdeConf = conf.getRdeConf()

  private docker = false

  async preInit() {
    const {args, flags} = this.parse(Serve)

    const {app} = this.rdeConf
    if (!app.template) {
      throw Error('template is not provided in you config file, please check')
    }

    const {template} = this.rdeConf
    const {docker} = template
    if (!docker || !docker.ports || !docker.ports.length) {
      throw Error(`${conf.getTemplateName()} doesn't support docker mode, please rerun with $ rde serve`)
    }

    return {...args, ...flags}
  }

  async initialize(args: any) {
    this.docker = args.docker

    try {
      this.validateAppRender()

      await this.render()
    } catch (e) {
      logger.error(e.message)
      this.exit(1)
    }
  }

  async render() {
    const srcDir = path.resolve(conf.getRdtModulePath(), 'template')
    const destDir = `.${conf.getCliName()}`
    const {app, template} = this.rdeConf

    const {includes, tags} = template.render
    await render.renderDir(srcDir, app.render, includes, destDir, tags)
  }

  async preRun() {
    const {template} = this.rdeConf

    if (this.docker) {
      const {mapping} = template
      const {ports} = template.docker
      const srcDir = path.resolve(__dirname, '../mustaches/docker')
      const destDir = `.${conf.getCliName()}/.docker/`

      await render.renderDir(srcDir, {
        context: '../../',
        ports,
        mapping,
        cmd: 'serve'
      }, ['mustache'], destDir)
    }
  }

  async run() {
    try {
      await asyncExec('docker-compose up')
    } catch (e) {
      logger.error(e.message)
      this.exit(1)
    }
  }

  private validateAppRender() {
    const {app, template} = this.rdeConf

    const valid = template.render.validate(app.render)

    if (!valid) {
      throw Error(`app render must provide required keys to use ${app.template}, please check`)
    }

    return true
  }
}
