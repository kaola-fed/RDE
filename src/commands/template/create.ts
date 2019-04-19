// @ts-ignore
import cli from 'cli-ux'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import * as path from 'path'
import * as copy from 'recursive-copy'
import * as writePkgJson from 'write-pkg'

import Base from '../../base'
import conf from '../../services/conf'
import {logger} from '../../services/logger'
import npm from '../../services/npm'
import render from '../../services/render'
import _ from '../../util'

export default class Create extends Base {
  public static description = 'create a rde template project'

  public static examples = [
    '$ rde template:create <rdtname>',
  ]

  public static args = [{
    name: 'rdtName',
    required: true,
    description: 'rde template project name, used by package.json',
  }]

  public rdtName = ''

  public rdtStarter = ''

  public framework = ''

  public byExtend = false

  public get rdtPkgDir() {
    return path.resolve(conf.cwd, 'node_modules', this.rdtStarter)
  }

  public async preInit() {
    const {args} = this.parse(Create)
    const {rdtName} = args

    this.rdtName = rdtName.includes('rdt-') ? rdtName : `rdt-${rdtName}`

    if (fs.existsSync(this.rdtName)) {
      throw Error(`Directory ${this.rdtName} already exist`)
    }

    if (await npm.getInfo(this.rdtName)) {
      throw Error(`Module ${this.rdtName} already exist, please use another name and try again`)
    }

    return args
  }

  public async initialize() {
    await this.ask()
  }

  public async preRun() {
    await _.asyncExec(`mkdir ${this.rdtName}`)
    process.chdir(this.rdtName)

    await writePkgJson({name: this.rdtName})
    await npm.install(this.rdtStarter, false)
    await _.asyncExec('rm package*.json')
  }

  public renderPkgJson() {
    const json = require(path.resolve(conf.cwd, 'package.json'))
    const rdtConf = require(path.resolve(conf.cwd, 'node_modules', this.rdtStarter, conf.rdtConfName))
    const {packageWhiteList = []} = rdtConf

    const resultJson: RdtPkgJson = {
      name: this.rdtName,
      description: 'This is a rde-template, powered by rde',
      keywords: ['@rede/rdt', `${this.framework}`],
      dependencies: json.dependencies,
      devDependencies: json.devDependencies,
    }

    Object.keys(json).forEach(key => {
      if (packageWhiteList.includes[key]) {
        resultJson[key] = json[key]
      }
    })

    writePkgJson(resultJson)
  }

  public async run() {
    const {resolve} = path
    if (this.byExtend) {
      const srcDir = resolve(this.mustachesDir, 'rde.template')
      await render.renderDir(srcDir, {
        parentRdtName: this.rdtStarter,
        framework: this.framework,
      }, ['.mustaches'], conf.cwd)

    } else {
      await copy(this.rdtPkgDir, conf.cwd, {overwrite: true})
      await copy(resolve(this.rdtPkgDir, '.npmignore'), resolve(conf.cwd, '.gitignore'), {overwrite: true})

      this.renderPkgJson()
    }
    await npm.install('')
  }

  public async ask() {
    const {framework, byExtend} = await inquirer.prompt([{
      name: 'framework',
      message: 'select a framework',
      type: 'list',
      choices: Object.keys(this.frameworks).map(name => ({name}))
    }, {
      name: 'byExtend',
      message: 'do you want to extend an existing rdt template? (Y/N)',
      type: 'confirm',
      default: false,
    }])

    this.framework = framework
    this.byExtend = byExtend

    if (byExtend) {
      this.rdtStarter = await this.askParentRdt()
    } else {
      this.rdtStarter = this.frameworks[framework].rdtStarter
    }
  }

  public async askParentRdt() {
    let parentRdtName = await cli.prompt('parent rdt pkg name: ', {
      required: true,
    })

    if (!(await npm.getInfo(parentRdtName))) {
      logger.error(`package ${parentRdtName} does not exist in npm repo, please check`)
      parentRdtName = this.askParentRdt()
    }

    return parentRdtName
  }

  public async postRun() {
    logger.complete('Created project')
    logger.star('Start with command:')
    logger.star('$ rde template:serve')
  }
}
