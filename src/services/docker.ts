import * as extend from 'deep-extend'
import * as fs from 'fs'
import * as path from 'path'
import * as writePackage from 'write-pkg'

import _ from '../util'

import cache from './cache'
import conf from './conf'
import {spinner} from './logger'
import render from './render'

const {resolve} = path
const {RdTypes} = conf
export default {
  async checkEnv() {
    await _.asyncExec('docker -v')

    await _.asyncExec('docker-compose -v')

    // whether is running or not
    await _.asyncExec('docker info')
  },

  async pull(image: string) {
    spinner.start(`Pulling ${image} from docker...`)

    await _.asyncExec(`docker pull ${image}`)

    spinner.stop()
  },

  async copy(image: string, mappings: any[]) {
    spinner.start(`Copy files from ${image}...`)

    if (await this.containerExist('rde-dummy')) {
      await _.asyncExec('docker container rm /rde-dummy')
    }

    await _.asyncExec(`docker create -it --name rde-dummy ${image} bash`)

    for (const mapping of mappings) {
      await _.asyncExec(`docker cp rde-dummy:${mapping.from} ${mapping.to}`)
    }

    await _.asyncExec('docker rm -fv rde-dummy')
    spinner.stop()
  },

  async imageExist(name) {
    try {
      await _.asyncExec(`docker inspect --type=image ${name}`)
      return true
    } catch (e) {
      if (e) {}
      return false
    }
  },

  async containerExist(name) {
    try {
      await _.asyncExec(`docker ps -a | grep ${name}`)
      return true
    } catch (e) {
      if (e) {}
      return false
    }
  },

  async build(tag, cwd, noCache = false, context = '.') {
    let args = ['build', '-t', tag, '-f', 'Dockerfile', context]
    if (noCache) {
      args.splice(1, 0, '--no-cache')
    }

    await _.asyncSpawn('docker', args, {
      cwd,
    })

    await _.asyncExec('rm .dockerignore')
  },

  async tag(oldtag, newtag) {
    await _.asyncSpawn('docker', ['tag', oldtag, newtag])
  },

  async push(name) {
    await _.asyncSpawn('docker', ['push', name])
  },

  async genDockerFile(workDir, from, dir) {
    // gen dockerfile
    await render.renderTo('docker/.dockerignore', {}, '.dockerignore', {
      overwrite: true,
    })

    await render.renderTo('docker/Dockerfile', {
      from,
      workDir,
      dockerWorkDirRoot: conf.dockerWorkDirRoot,
    }, `${dir}/Dockerfile`, {
      overwrite: true,
    })
  },

  async genDockerFile4Publish(workDir, from, dir) {
    // gen dockerfile
    await render.renderTo('docker/.dockerignore', {}, '.dockerignore', {
      overwrite: true,
    })

    await render.renderTo('docker/Dockerfile.publish', {
      from,
      workDir,
    }, `${dir}/Dockerfile`, {
      overwrite: true,
    })
  },

  async genDockerCompose(
    workDir,
    cmd,
    ports,
    watch,
    tag,
    dir,
    isApp = false,
  ) {
    if (!tag) {
      const name = path.basename(conf.cwd)
      tag = `${name}:latest`
    }

    await render.renderTo('docker/docker-compose', {
      workDir,
      cmd,
      ports,
      watch,
      tag,
      isApp,
    }, `${dir}/docker-compose.yml`, {
      overwrite: true,
    })
  },

  /**
   * rde will regenerate package.json under such condition:
   * 1. no cache info found
   * 2. rdc version changed if rdType is application
   * 3. any package.json under template dir has changed if rdType is container
   * 4. extends attr in rdc.config.js has changed if rdType is container
   */
  async genPkgJson() {
    const {
      rdType,
      runtimeDir,
      cwd,
      localCacheDir,
      rdcConfName,
    } = conf
    const nodeModulesDir = resolve(runtimeDir, 'node_modules')

    const isApplication = rdType === RdTypes.Application
    let rdcName
    if (isApplication) {
      const rdaConf = conf.getAppConf()
      rdcName = rdaConf.container.name || ''
    }

    const isContainer = rdType === RdTypes.Container
    let pkgJsonLMTs
    let extendsName
    let pkgJson = null
    if (isContainer) {
      // last-modified-time
      const pkgPath = resolve(cwd, 'template/package.json')
      pkgJsonLMTs = fs.statSync(pkgPath).mtimeMs
      pkgJson = require(pkgPath)

      const rdcConfPath = resolve(cwd, rdcConfName)
      const rdcConf = require(rdcConfPath)
      extendsName = rdcConf.extends
    }

    if (
      !cache.exist ||
      !fs.existsSync(nodeModulesDir) ||
      (isApplication && rdcName !== cache.get('rda.container')) ||
      (isContainer && pkgJsonLMTs !== cache.get('rdc.pkg.lmts')) ||
      (isContainer && extendsName && extendsName !== cache.get('rdc.extends'))
    ) {
      const image = isApplication ? rdcName : extendsName
      const resultPkgJson = await this.getPkgJson(image, pkgJson)

      await writePackage(`${localCacheDir}`, resultPkgJson)

      if (isApplication) {
        cache.set('rda.container', rdcName)
      }

      if (isContainer) {
        cache.set('rdc.pkg.lmts', pkgJsonLMTs)
        extendsName && cache.set('rdc.extends', extendsName)
      }
    }
  },

  async getPkgJson(image, result = {}) {
    if (!image) {
      return result
    }

    const {
      dockerWorkDirRoot,
      localCacheDir,
      rdcConfName,
      cwd,
    } = conf
    const name = image.split(':')[0]
    const srcDir = `${dockerWorkDirRoot}/${name}`
    const destPkgPath = `${localCacheDir}/package.json`
    const destRdcConfPath = `${localCacheDir}/${rdcConfName}`

    await this.copy(image, [{
      from: `${srcDir}/template/package.json`,
      to: destPkgPath,
    }, {
      from: `${srcDir}/${rdcConfName}`,
      to: destRdcConfPath,
    }])

    const rdcConf = require(resolve(cwd, destRdcConfPath))
    let pkgJson = {}
    if (fs.existsSync(destPkgPath)) {
      pkgJson = require(resolve(cwd, destPkgPath))
    }
    pkgJson = extend(pkgJson, result)

    await _.asyncExec(`rm ${destPkgPath} ${destRdcConfPath}`)

    if (!rdcConf.extends) {
      return pkgJson
    }
    await this.getPkgJson(rdcConf.extends, pkgJson)
  }
}
