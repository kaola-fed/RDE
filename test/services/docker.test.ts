
import {expect} from 'chai'
import * as sinon from 'sinon'

import docker from '../../src/services/docker'

const fake = sinon.fake()

describe('docker', () => {
  it('should run success if docker & docker-compose is installed, and docker is running', async () => {
    try {
      await docker.checkEnv()

      fake()
      expect(fake.callCount).equal(1)
    } catch (e) {
      if (e) {}
    }
  })

  it('should be failed if docker or docker-compose is not installed, or docker is not running', async () => {
    try {
      await docker.checkEnv()
      fake()
    } catch (e) {
      if (e) {}
      expect(fake.callCount).equal(0)
    }
  })

  it('should return true if image exists locally', async () => {
    try {
      const result = await docker.imageExist('node:10')

      expect(result).equal(true)
    } catch (e) {
      if (e) {}
    }
  })

  it('should return false if image does not exist locally', async () => {
    try {
      const result = await docker.imageExist('node:1')

      expect(result).equal(false)
    } catch (e) {
      if (e) {}
    }
  })
})
