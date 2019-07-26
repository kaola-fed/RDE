import {flags} from '@oclif/command'
import {spawn} from 'child_process'
import * as Table from 'cli-table2'
import * as readline from 'readline'

import RunBase from '../base/run'
import cache from '../services/cache'
import conf from '../services/conf'
import docker from '../services/docker'
import {debug} from '../services/logger'
import rdehook from '../services/rdehook'
import sync from '../services/sync'
import {validateRda, validateRdc} from '../services/validate'
import _ from '../util'

const {RdTypes, cwd} = conf
export default class Run extends RunBase {
  public static description = 'run scripts provided by container'

  public static examples = [
    '$ rde run <cmd>',
  ]

  public static flags = {
    ...RunBase.flags,
    rebuild: flags.boolean({
      char: 'r',
      description: 'rebuild image before run',
    }),
    install: flags.boolean({
      char: 'i',
      description: 'generate local node_modules',
    }),
  }

  public static args = [{
    name: 'cmd',
    required: false,
    description: 'scripts provided by container',
  }]

  public rebuild = false

  public install = false

  public async preInit() {
    await this.config.runHook('checkUpdate', {})

    await super.preInit()

    const {flags} = this.parse(Run)
    this.rebuild = flags.rebuild
    this.install = flags.install

    if (conf.rdType === RdTypes.Container) {
      await validateRdc()
    }

    if (conf.isApp) {
      await validateRda()
    }
  }

  public async initialize() {
    await super.initialize()

    await sync.start({
      watch: this.watch,
      cmd: this.cmd,
      skipInstall: true
    })

    conf.useLocal = this.useLocal
  }

  public async preRun() {
    if (conf.isApp) {
      const cacheContainer = cache.get('container')
      const {container} = conf.getAppConf()

      if (cacheContainer && cacheContainer !== container.name) {
        const table = new Table({
          style: {
            'padding-left': 0,
            'padding-right': 0,
            border: ['yellow']
          },
          colWidths: [50],
          rowHeights: [2],
        })

        table.push(
          [{
            hAlign: 'center',
            content: `Container updated\n${container.name}\nPlease run: $rde install`
          }],
        )

        // tslint:disable:no-console
        console.log(table.toString())
      }
      cache.set('container', container.name)
    }
  }

  public appendArgs(args) {
    if (this.watch) { args.push('--watch') }
    if (this.verbose) { args.push('-v') }
    return args
  }

  public async run() {
    await rdehook.trigger('preMount')

    let child = null
    process.on('SIGINT', () => {
      child.kill('SIGINT')
      process.exit(0)
    })

    if (this.watch) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.on('SIGINT', () => {
        child.kill('SIGINT')
        process.exit(0)
      })
    }

    debug('useLocal', conf.useLocal)

    if (conf.useLocal) {
      await _.asyncExec('rm -rf .integrate && rm -rf .runtime')

      let args = this.appendArgs(['docker:run', this.cmd, '-l'])

      if (this.extras) { args = args.concat(['-e', `\"${this.extras}\"`]) }

      child = spawn('rde', args, {
        cwd: conf.cwd,
        stdio: 'inherit',
        shell: true,
      })
    } else {
      // not using docker-compose cuz .dockerignore in sub dir is not working,
      // build with docker-compose is slow if node_modules exists
      await docker.build(`dev-${conf.tag}`, cwd, this.rebuild, `${conf.localCacheDir}/Dockerfile`)

      let args = ['run', '--rm', '--service-ports', 'rde', 'rde', 'docker:run', this.cmd]
      args = this.appendArgs(args)
      if (this.extras) { args = args.concat(['-e', this.extras]) }

      debug(`docker build dev-${conf.tag}`)
      debug(`docker-compose ${args.join(' ')}`)

      child = spawn('docker-compose', (args as ReadonlyArray<string>), {
        cwd: conf.localCacheDir,
        stdio: 'inherit',
      })
    }

    child.on('close', code => {
      child.kill('SIGINT')
      process.exit(code)
    })
  }
}
