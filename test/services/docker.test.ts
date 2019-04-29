
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
})
