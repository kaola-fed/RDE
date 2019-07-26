import * as deepExtend from 'deep-extend'
import * as fs from 'fs'
import {writeJson} from 'fs-extra'
import * as path from 'path'
import * as writePkg from 'write-pkg'

import conf from '../services/conf'
import docker from '../services/docker'
import {debug} from '../services/logger'
import _ from '../util'

import ide from './ide'
import {MRDA} from './message'
import render from './render'

const {resolve, join} = path
const {
  RdTypes,
  rdcConfName,
  dockerWorkDirRoot,
} = conf

class Sync {
  public get appConf(): AppConf {
    return require(resolve(conf.cwd, conf.appConfName))
  }

  public get from() {
    if (conf.isApp) {
      const {container} = conf.getAppConf()
      return container.name
    }

    if (conf.rdType === RdTypes.Container) {
      const rdcConfPath = resolve(conf.cwd, rdcConfName)
      const rdcConf = require(rdcConfPath)

      return rdcConf.nodeVersion || 'node:latest'
    }
  }

  public get ports() {
    if (conf.isApp) {
      const {docker} = conf.getAppConf()
      return docker.ports || []
    }

    if (conf.rdType === RdTypes.Container) {
      const rdcConf = require(join(conf.cwd, conf.rdcConfName))
      return rdcConf.docker.ports || []
    }
  }

  /**
   * sync all
   * used for local dev env, resync is needed when container updates
   * 1. generate Dockerfile to local .cache
   * 2. generate docker-compose to local .cache
   *
   * if rdType is app
   * need to gen extra staged files
   */
  public async start({watch, cmd, skipInstall = false}) {
    await _.asyncSpawn('mkdir', ['-p', conf.localCacheDir], {})

    await _.asyncExec('rm -rf app/node_modules')
    await _.asyncExec(`rm -rf ${conf.templateDir}/node_modules`)

    if (conf.isApp) {
      await docker.pull(this.appConf.container.name)

      await this.genAppStagedFiles()
    } else {
      await _.copy(
        resolve(conf.templateDir, 'package.json'),
        resolve(conf.localCacheDir, 'package.json'),
        {}
      )
    }

    await this.genDevPkgJson()

    await docker.genDockerFile(
      conf.dockerWorkDirRoot,
      this.from,
      conf.localCacheDir,
      conf.isApp,
    )

    // @TODO: docker-compose merge
    // needed in order to let container developer write multiple services like mongo
    await docker.genDockerCompose(
      conf.dockerWorkDirRoot,
      cmd,
      this.ports,
      watch,
      `dev-${conf.tag}`,
      conf.localCacheDir,
      conf.isApp,
      cmd === 'build',
    )

    if (!skipInstall) {
      await this.install()
    }

    await ide.initSettings(conf.isApp)

    await this.registerHooks()
  }

  /**
   * 1. copy template/package.json to .cache/package.json
   * 2. copy rde/rdc.config.js to .cache/rdc.config.js
   * 3. merge app optional pkg.json & rdc package.json
   */
  public async genAppStagedFiles(createRdc = null) {
    const {
      cwd,
      rdcConfName,
      dockerWorkDirRoot,
      templateDir,
      localCacheDir,
    } = conf

    // only create application will pass rdc param
    const image = createRdc || this.appConf.container.name
    await docker.copy(image, [{
      from: `${dockerWorkDirRoot}/${templateDir}/package.json`,
      to: localCacheDir,
    }, {
      from: `${dockerWorkDirRoot}/${templateDir}`,
      to: cwd
    }, {
      from: `${dockerWorkDirRoot}/${rdcConfName}`,
      to: localCacheDir,
    }])

    if (!createRdc) {
      await this.mergePkgJson(
        resolve(cwd, 'app', 'package.json'),
        resolve(cwd, localCacheDir, 'package.json'),
        resolve(localCacheDir),
      )
    }

    // 基本没人用，去除功能
    // await this.genDevcontainer(createRdc)
  }

  public async genDevcontainer(createRdc) {
    const rdcConfPath = resolve(conf.localCacheDir, rdcConfName)
    const rdcConf: RdcConf = require(rdcConfPath)

    const map = {
      devcontainer: 'devcontainer.json',
      'docker-compose': 'docker-compose.yml',
      Dockerfile: 'Dockerfile',
    }

    const from = createRdc || this.from
    rdcConf.docker = rdcConf.docker || {}
    const ports = createRdc ? rdcConf.docker.ports || [] : this.ports
    const extensions = rdcConf.extensions || []

    for (let [key, value] of Object.entries(map)) {
      await render.renderTo(`devcontainer/${key}`, {
        tag: conf.tag,
        workDir: dockerWorkDirRoot,
        extensions: JSON.stringify(extensions),
        from,
        ports,
      }, resolve(conf.cwd, '.devcontainer', value), {
        overwrite: true,
      })
    }
  }

  public async registerHooks() {
    if (!fs.existsSync('.git')) {
      await _.asyncExec('git init')
    }

    fs.writeFileSync(join('.git', 'hooks', 'pre-commit'),
      `#!/bin/sh

rde lint -s
      `, {encoding: 'UTF-8', mode: '755'})

    fs.writeFileSync(join('.git', 'hooks', 'commit-msg'),
      `#!/bin/sh

commitMsg=$(cat $1)
rde lint -m "$commitMsg"
      `, {encoding: 'UTF-8', mode: '755'})
  }

  public async mergePkgJson(appPkgPath, rdcPkgPath, destPath) {
    debug('appPkgPath', appPkgPath)
    debug('rdcPkgPath', rdcPkgPath)

    let pkgJson = require(rdcPkgPath)

    if (
      fs.existsSync(appPkgPath) &&
      fs.statSync(appPkgPath).isFile()
    ) {
      const appPkgJson = require(appPkgPath)

      deepExtend(pkgJson, appPkgJson)
    }

    await writePkg(destPath, pkgJson)
    return pkgJson
  }

  public async genDevPkgJson() {
    const dependenciesAttr = [
      'os',
      'engines',
      'engineStrict',
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'bundledDependencies',
      'optionalDependencies']
    const devPkgJson = {}
    const pkgJson = require(resolve(conf.localCacheDir, 'package.json'))

    dependenciesAttr.forEach(item => {
      if (pkgJson[item]) {
        devPkgJson[item] = pkgJson[item]
      }
    })

    await writeJson(join(conf.localCacheDir, 'package-cache.json'), devPkgJson, {spaces: '\t'})
  }

  public async install() {
    const {
      cwd,
      RdTypes,
      templateDir,
      localCacheDir,
    } = conf

    if (conf.isApp) {
      const cachePkgJsonPath = resolve(localCacheDir, 'package.json')
      if (!fs.existsSync(cachePkgJsonPath)) {
        throw Error(MRDA.NO_PKG_IN_CACHE_DIR)
      }

      const symPkgJsonPath = resolve(cwd, 'package.json')
      if (fs.existsSync(symPkgJsonPath)) {
        fs.unlinkSync(symPkgJsonPath)
      }

      const appNpmRcPath = resolve('app', '.npmrc')
      const rdcNpmRcPath = resolve(templateDir, '.npmrc')

      if (fs.existsSync(rdcNpmRcPath)) {
        await _.asyncExec(`cp -f ${rdcNpmRcPath} ${cwd}`)
      }

      if (fs.existsSync(appNpmRcPath)) {
        await _.asyncExec(`cp -f ${appNpmRcPath} ${cwd}`)
      }

      fs.symlinkSync(cachePkgJsonPath, symPkgJsonPath)
      await _.asyncSpawn('npm', ['i', '--package-lock', 'false'], {
        cwd,
      })
      fs.unlinkSync(symPkgJsonPath)
    }

    if (conf.rdType === RdTypes.Container) {
      const runtimePkgJsonPath = resolve(templateDir, 'package.json')
      const runtimeNpmRcPath = resolve(templateDir, '.npmrc')
      const symPkgJsonPath = resolve(cwd, 'package.json')

      if (fs.existsSync(symPkgJsonPath)) {
        fs.unlinkSync(symPkgJsonPath)
      }

      if (fs.existsSync(runtimeNpmRcPath)) {
        await _.asyncExec(`cp -f ${runtimeNpmRcPath} ${cwd}`)
      }

      fs.symlinkSync(runtimePkgJsonPath, symPkgJsonPath)
      await _.asyncSpawn('npm', ['i', '--package-lock', 'false'], {
        cwd,
      })
      fs.unlinkSync(symPkgJsonPath)
    }

    if (fs.existsSync(resolve(cwd, '.npmrc'))) {
      await _.asyncExec('rm -rf .npmrc')
    }
  }
}
export default new Sync()
