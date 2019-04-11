import {expect} from 'chai'
import {exec} from 'child_process'
import * as util from 'util'

import _ from '../src/util'

const asyncExec = util.promisify(exec)

describe('utils', () => {
  describe('isEmpty', () => {
    before(async () => {
      await asyncExec('cd test && mkdir run')
    })

    after(async () => {
      await asyncExec('rm -rf test/run')
    })

    it('should return true with an empty folder', () => {
      const result = _.isEmptyDir('./test/run')
      expect(result).to.be.true
    })

    it('should return false when folder is not empty', () => {
      const result = _.isEmptyDir('./test')
      expect(result).to.be.false
    })
  })

  describe('getNpmPkgInfo', () => {
    it('should return correct npm info if exist', async () => {
      const result = await _.getNpmPkgInfo('nek-ui')
      expect(result.name).to.equal('nek-ui')
    })

    it('should throw an error if not exist', async () => {
      try {
        await _.getNpmPkgInfo('some-unexist-pkg-of-kaola')
      } catch ({response}) {
        expect(response.status).to.equal(404)
      }
    })
  })

  describe('installPkg', () => {
    before(async () => {
      await asyncExec('cd test && mkdir run && cd run && npm init -y')
    })

    after(async () => {
      await asyncExec('rm -rf test/run')
    })

    it('should be installed if package exist', async () => {
      await _.installPkg('nek-ui', true, './test/run')
      const pkgJson = require(`${process.cwd()}/test/run/package.json`)
      expect(pkgJson.devDependencies['nek-ui']).to.not.be.undefined
    })

    it('should be failed if package not exist', async () => {
      await _.installPkg('some-unexist-pkg-of-kaola', true, './test/run')
      const pkgJson = require(`${process.cwd()}/test/run/package.json`)
      expect(pkgJson.devDependencies['nek-ui']).to.not.undefined
    })
  })
})
