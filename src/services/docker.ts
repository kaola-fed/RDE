import * as extend from 'deep-extend'
import * as fs from 'fs'
import * as path from 'path'
import * as writePackage from 'write-pkg'

import _ from '../util'

import cache from './cache'
import conf from './conf'
import log from './logger'
import render from './render'

const {resolve, join} = path
const {RdTypes} = conf

class Docker {
  @log('Checking local environment...')
  public async checkEnv(timesaving = false) {
    // whether is running or not

    if (timesaving) {
      await _.asyncExec('docker info')
    } else {
      await _.asyncExec('docker -v & docker-compose -v & docker info')
    }
  }

  @log('Pulling image from docker hub...')
  public async pull(image: string) {
    await _.asyncExec(`docker pull ${image}`)
  }

  @log('Copying files from image...')
  public async copy(image: string, mappings: any[]) {
    if (await this.containerExist('rde-dummy')) {
      await _.asyncExec('docker container rm /rde-dummy')
    }

    await _.asyncExec(`docker create -it --name rde-dummy ${image} bash`)

    for (const mapping of mappings) {
      await _.asyncExec(`docker cp rde-dummy:${mapping.from} ${mapping.to}`)
    }

    await _.asyncExec('docker rm -fv rde-dummy')
  }

  @log('Checking image existance...')
  public async imageExist(name) {
    try {
      await _.asyncExec(`docker inspect --type=image ${name}`)
      return true
    } catch (e) {
      if (e) {}
      return false
    }
  }

  @log('Checking container existance...')
  public async containerExist(name) {
    try {
      await _.asyncExec(`docker ps -a | grep ${name}`)
      return true
    } catch (e) {
      if (e) {}
      return false
    }
  }

  @log('Building docker image...')
  public async build(tag, cwd, noCache = false, dockerFile = 'Dockerfile') {
    let args = ['build', '-t', tag, '-f', dockerFile, '.']
    if (noCache) {
      args.splice(1, 0, '--no-cache')
    }

    await _.asyncSpawn('docker', args, {
      cwd,
    })

    await _.asyncExec('rm .dockerignore')
  }

  public async tag(oldtag, newtag) {
    await _.asyncSpawn('docker', ['tag', oldtag, newtag])
  }

  @log('Pushing image to docker hub...')
  public async push(name) {
    await _.asyncSpawn('docker', ['push', name])
  }

  @log('Generating docker files...')
  public async genDockerFile(workDir, from, dir, isApp) {
    // gen dockerfile
    await render.renderTo('docker/.dockerignore', {}, '.dockerignore', {
      overwrite: true,
    })

    await render.renderTo('docker/Dockerfile', {
      from,
      workDir,
      dockerWorkDirRoot: conf.dockerWorkDirRoot,
      isApp,
    }, `${dir}/Dockerfile`, {
      overwrite: true,
    })
  }

  @log('Generating Dockerfile...')
  public async genDockerFile4Publish(workDir, from, dir) {
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
  }

  @log('Generating docker-compose.yml...')
  public async genDockerCompose(
    workDir,
    cmd,
    ports,
    watch,
    tag,
    dir,
    isApp = false,
    isBuild = false,
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
      isBuild,
    }, `${dir}/docker-compose.yml`, {
      overwrite: true,
    })
  }

  /**
   * rde will regenerate package.json under such condition:
   * 1. no cache info found
   * 2. rdc version changed if rdType is application
   * 3. any package.json under template dir has changed if rdType is container
   * 4. extends attr in rdc.config.js has changed if rdType is container
   */
  @log('Generating package.json from rdc chain...')
  public async genPkgJson() {
    const {
      rdType,
      cwd,
      localCacheDir,
      rdcConfName,
    } = conf
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
      (isApplication && rdcName !== cache.get('rda.container')) ||
      (isContainer && pkgJsonLMTs !== cache.get('rdc.pkg.lmts')) ||
      (isContainer && extendsName && extendsName !== cache.get('rdc.extends'))
    ) {
      const image = isApplication ? rdcName : extendsName
      const resultPkgJson = await this.getPkgJson(image, pkgJson)

      if (isApplication) {
        const rdaConf = conf.getAppConf()
        rdaConf.suites.forEach(item => {
          resultPkgJson.dependencies[item.name] = item.version
        })
      }

      await writePackage(`${localCacheDir}`, resultPkgJson)

      if (isApplication) {
        cache.set('rda.container', rdcName)
      }

      if (isContainer) {
        cache.set('rdc.pkg.lmts', pkgJsonLMTs)
        extendsName && cache.set('rdc.extends', extendsName)
      }
    }
  }

  public async getPkgJson(image, result = {}) {
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
    const srcDir = join(dockerWorkDirRoot, name)
    const destPkgPath = join(localCacheDir, 'package.json')
    const destRdcConfPath = join(localCacheDir, rdcConfName)

    await this.copy(image, [{
      from: join(srcDir, 'template/package.json'),
      to: destPkgPath,
    }, {
      from: join(srcDir, rdcConfName),
      to: destRdcConfPath,
    }])

    const rdcConf = require(resolve(cwd, destRdcConfPath))
    let pkgJson: any = {}
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

export default new Docker()
