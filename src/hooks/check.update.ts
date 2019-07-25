import * as Table from 'cli-table2'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as semver from 'semver'

import conf from '../services/conf'
import {debug} from '../services/logger'
import npm from '../services/npm'
import _ from '../util'

export default async function ({config, id}) {
  const file = path.join(config.cacheDir, 'version')
  const delayInDays = 6

  const needUpdate = async () => {
    try {
      const {mtime} = await fs.stat(file)
      const expireDate = new Date(
        mtime.valueOf() + 1000 * 60 * 60 * 24 * delayInDays
      )

      debug(`rde version cache path: ${file}`)
      debug(`rde version cache mtime: ${mtime}`)
      return expireDate < new Date()
    } catch (e) {
      if (e.code !== 'ENOENT') throw e
      return true
    }
  }

  const update = async () => {
    const {latest} = await fs.readJson(file)

    if (semver.gt(latest, config.version)) {
      const table = new Table({
        head: ['package', 'current', 'latest'],
        style: {
          'padding-left': 1,
          'padding-right': 1,
          head: ['cyan'],
          border: ['white']
        },
        colWidths: [15, 25, 25]
      })

      table.push([config.name, config.version, latest])
      table.push([
        {
          content: 'New version available. Updating RDE Cli Automatically',
          colSpan: 3
        }
      ])
      // tslint:disable:no-console
      console.log(table.toString())

      await npm.install({
        pkgs: [config.name],
        isGlobal: true,
        isDevDep: false,
      })
    }
  }

  const updateVersion = async () => {
    const pkgInfo = await npm.getInfo(config.name)

    await fs.outputFile(
      file,
      JSON.stringify({
        ...pkgInfo['dist-tags'],
        current: config.version
      })
    )

    await update()
  }

  if (await needUpdate()) {
    await updateVersion()
  }

  if (id === 'create') {
    return
  }

  await _.copy(
    file,
    path.join(conf.localCacheDir, 'version'),
    {},
  )
}
