import _ from '../util'

import {spinner} from './logger'

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

  async containerExist(name) {
    try {
      await _.asyncExec(`docker ps -a | grep ${name}`)
      return true
    } catch (e) {
      if (e) {}
      return false
    }
  }
}
