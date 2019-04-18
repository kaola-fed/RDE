import {expect} from 'chai'
import {exec} from 'child_process'
import * as util from 'util'

import npm from '../../src/services/npm'

const asyncExec = util.promisify(exec)

describe('npm', () => {
  describe('getInfo', () => {
    it('should return correct npm info if exist', async () => {
      const result = await npm.getInfo('nek-ui')
      expect(result.name).to.equal('nek-ui')
    })

    it('should throw an error if not exist', async () => {
      const pkg = await npm.getInfo('some-unexist-pkg-of-kaola')
      expect(pkg).to.be.null
    })
  })

  describe('install', () => {
    before(async () => {
      await asyncExec('mkdir ./test/run && cd ./test/run && npm init -y')
    })

    after(async () => {
      await asyncExec('rm -rf ./test/run')
    })

    it('should be installed if package exist', async () => {
      await npm.install('nek-ui', true, './test/run')
      const pkgJson = require(`${process.cwd()}/test/run/package.json`)
      expect(pkgJson.devDependencies['nek-ui']).to.not.be.undefined
    })

    it('should be failed if package not exist', async () => {
      await npm.install('some-unexist-pkg-of-kaola', true, './test/run')
      const pkgJson = require(`${process.cwd()}/test/run/package.json`)
      expect(pkgJson.devDependencies['nek-ui']).to.not.undefined
    })
  })
})
