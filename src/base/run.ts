import {flags} from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'

import Base from '../base'
import conf from '../services/conf'
import _ from '../util'

const {resolve} = path
export default class RunBase extends Base {
  public static args = [{
    name: 'cmd',
    required: true,
    description: 'scripts provided by container',
  }]

  public static flags = {
    ...Base.flags,
    watch: flags.boolean({char: 'w'})
  }

  public cmd = ''

  public watch = false

  public async preInit() {
    // @ts-ignore
    const {flags, args} = this.parse(this.constructor)

    this.cmd = args.cmd
    this.watch = flags.watch

    return flags
  }

  public async initialize() {
    await _.asyncExec(`rm -rf ${conf.tmpDir} && mkdir ${conf.tmpDir}`)

    const {appConfPath, rdcConfPath, cwd, RdTypes} = conf
    if (fs.existsSync(appConfPath)) {
      conf.rdType = RdTypes.Application
    }

    if (fs.existsSync(rdcConfPath)) {
      conf.rdType = RdTypes.Container
    }

    if (!conf.rdType) {
      throw Error('no rde config file found, please read docs first')
    }

    const appDir = resolve(`${cwd}/app`)
    const templateDir = resolve(`${cwd}/template`)
    if (conf.rdType === 'container' && !fs.existsSync(templateDir)) {
      throw Error('template dir cannot be found in cwd, please provide')
    }

    if (!fs.existsSync(appDir)) {
      throw Error('app dir cannot be found in cwd, please provide')
    }
  }

  public async run() {}
}
