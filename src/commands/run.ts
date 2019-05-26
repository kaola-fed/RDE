import {flags} from '@oclif/command'
import {spawn} from 'child_process'
import * as Table from 'cli-table2'
import * as readline from 'readline'

import RunBase from '../base/run'
import cache from '../services/cache'
import conf from '../services/conf'
import docker from '../services/docker'
import {debug} from '../services/logger'
import sync from '../services/sync'
import {validateRda, validateRdc} from '../services/validate'

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
  }

  public static args = [{
    name: 'cmd',
    required: false,
    description: 'scripts provided by container',
  }]

  public rebuild = false

  public install = false

  public async preInit() {
    await super.preInit()
    await this.config.runHook('checkUpdate', {})

    const {flags} = this.parse(Run)
    this.rebuild = flags.rebuild

    if (conf.rdType === RdTypes.Container) {
      await validateRdc()
    }

    if (conf.isApp) {
      await validateRda()
    }
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
            content: `Container updated: ${container.name}\nPlease run: $rde sync`
          }],
        )

        // tslint:disable:no-console
        console.log(table.toString())
      }
      cache.set('container', container.name)

      await sync.start({
        watch: this.watch,
        cmd: this.cmd
      })
    }
  }

  public async run() {
    // not using docker-compose cuz .dockerignore in sub dir is not working,
    // build with docker-compose is slow if node_modules exists
    await docker.build(`dev-${conf.tag}`, cwd, this.rebuild, `${conf.localCacheDir}/Dockerfile`)

    let args = ['run', '--rm', '--service-ports', 'rde', 'rde', 'docker:run', this.cmd]

    debug(`docker build dev-${conf.tag}`)

    if (this.watch) { args.push('--watch') }
    if (this.verbose) { args.push('-v') }
    if (this.extras) { args = args.concat(['-e', this.extras]) }

    let child = null
    process.on('SIGINT', () => child.kill())

    if (this.watch) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.on('SIGINT', () => {
        child.kill()
        process.exit(0)
      })
    }

    debug(`docker-compose ${args.join(' ')}`)

    child = spawn('docker-compose', (args as ReadonlyArray<string>), {
      cwd: conf.localCacheDir,
      stdio: 'inherit',
    })

    child.on('close', code => {
      if (code !== 0) {
        process.exit(code)
      }
    })
  }
}
