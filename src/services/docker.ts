import * as path from 'path'

import _ from '../util'

import conf from './conf'
import {spinner} from './logger'
import render from './render'

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

  async copy(image: string, from: string, to: string) {
    spinner.start(`Copy files from ${image}...`)

    if (await this.containerExist('rde-dummy')) {
      await _.asyncExec('docker container rm /rde-dummy')
    }

    await _.asyncExec(`docker create -it --name rde-dummy ${image} bash`)
    await _.asyncExec(`docker cp rde-dummy:${from} ${to}`)
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

  async tag(name) {
    await _.asyncExec(`docker tag -a | grep ${name}`)
  },

  async push(name) {
    await _.asyncExec(`docker push ${name}`)
  },

  async genDockerFile(type, from, dir) {
    // gen dockerfile
    await render.renderTo('docker/.dockerignore', {}, `${dir}/.dockerignore`)

    const workDir = conf.getWorkDir(type, from)
    await render.renderTo('docker/Dockerfile', {
      from,
      workDir,
    }, `${dir}/Dockerfile`)
  },

  async genDockerCompose(
    type,
    from,
    cmd,
    ports,
    watch,
    tag,
    dir,
  ) {
    const workDir = conf.getWorkDir(type, from)

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
    }, `${dir}/docker-compose.yml`)
  }
}
