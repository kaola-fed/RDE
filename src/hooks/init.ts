import * as Table from 'cli-table2'
import * as semver from 'semver'
import * as fs from 'fs'
import * as path from 'path'

import npm from '../services/npm'

export default async function({ config }) {
  const file = path.join(config.cacheDir, 'version')
  const delayInDays = 1

  const checkVersionFile = () => {
    if(!fs.existsSync(config.cacheDir)) {
      fs.mkdirSync(config.cacheDir)
    }

    if(!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify({
        current: config.version
      }))
    }
  }

  const needCheck = () => {
    try {
      const { mtime } = fs.statSync(file)
      const expireDate = new Date(mtime.valueOf() + 1000 * 60 * 60 * 24 * delayInDays)
      return expireDate < new Date()
    } catch (e) {
      if(e) {
        checkVersionFile()
      }
      return true
    }
  }

  const checkVersion = () => {
    const { latest } = JSON.parse(fs.readFileSync(file, 'utf8'))
    const table = new Table({
      head: ['package', 'current', 'latest'],
      style: {
        'padding-left': 1
        , 'padding-right': 1
        , head: ['cyan']
        , border: ['white']
      },
      colWidths: [15, 25, 25]
    })

    if(semver.gt(latest, config.version)) {
      table.push([config.name, config.version, latest])
      table.push([{content: `New version available. Please enter 'npm update -g ${config.name}' to update`, colSpan:3}])

      console.log(table.toString())
    }
  }

  const updateVersion = async () => {
    const pkgInfo = await npm.getInfo(config.name)

    fs.writeFileSync(file, JSON.stringify({
      ...pkgInfo['dist-tags'],
      current: config.version
    }))
  }

  if(needCheck()) {
    await updateVersion()
  }

  await checkVersion()
}
