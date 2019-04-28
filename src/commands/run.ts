import {flags} from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'

import Base from '../base'
import conf from '../services/conf'
import render from '../services/render'
import _ from '../util'

const {resolve} = path
export default class Run extends Base {
  public static description = 'run scripts provided by container'

  public static examples = [
    '$ rde run <cmd>',
  ]

  public static args = [{
    name: 'cmd',
    required: true,
    description: 'scripts provided by container',
  }]

  public static flags = {
    ...Base.flags,
    watch: flags.boolean({char: 'w'})
  }

  public type = ''

  public cmd = ''

  public watch = false

  public get from() {
    if (this.type === 'application') {
      const {app} = conf.getAppConf()
      return app.container.name
    }

    if (this.type === 'container') {
      const rdcConf = require(`${conf.cwd}/${conf.rdcConfName}`)

      return rdcConf.extends || rdcConf.nodeVersion || 'node:latest'
    }
  }

  public get ports() {
    if (this.type === 'application') {
      const {app} = conf.getAppConf()
      return app.docker.ports || []
    }

    if (this.type === 'container') {
      const rdcConf = require(`${conf.cwd}/${conf.rdcConfName}`)

      return rdcConf.docker.ports || []
    }
  }

  public async preInit() {
    const {flags, args} = this.parse(Run)

    this.cmd = args.cmd
    this.watch = flags.watch

    return flags
  }

  public async initialize() {
    const {appConfPath, rdcConfPath, cwd} = conf
    if (fs.existsSync(appConfPath)) {
      this.type = 'application'
    }

    if (fs.existsSync(rdcConfPath)) {
      this.type = 'container'
    }

    if (!this.type) {
      throw Error('no rde config file found, please read docs first')
    }

    const appDir = resolve(`${cwd}/app`)
    const templateDir = resolve(`${cwd}/template`)
    if (this.type === 'container' && !fs.existsSync(templateDir)) {
      throw Error('template dir cannot be found in cwd, please provide')
    }

    if (!fs.existsSync(appDir)) {
      throw Error('app dir cannot be found in cwd, please provide')
    }
  }

  public async preRun() {
    // gen dockerfile
    await render.renderTo('docker/.dockerignore', {}, `${conf.cwd}/.docker/.dockerignore`)

    await render.renderTo('docker/Dockerfile', {
      from: this.from,
      workDir: `${conf.workDirRoot}`
    }, `${conf.cwd}/.docker/Dockerfile`)

    await render.renderTo('docker/docker-compose', {
      cmd: this.cmd,
      ports: this.ports,
      watch: this.watch,
    }, `${conf.cwd}/.docker/docker-compose.yml`)
  }

  public async run() {
    if (this.watch) {
      await _.asyncExec(`docker-compose run --rm rde rde docker:run ${this.cmd} --watch`)
    } else {
      await _.asyncExec(`docker-compose run --rm rde rde docker:run ${this.cmd}`)
    }
  }
}
