import {expect} from 'chai'
import {exec} from 'child_process'
import * as util from 'util'

import _ from '../src/util'

const asyncExec = util.promisify(exec)

describe('utils', () => {
  describe('isEmpty', () => {
    before(async () => {
      await asyncExec('cd test && mkdir tmp')
    })

    after(async () => {
      await asyncExec('rm -rf test/tmp')
    })

    it('should return true with an empty folder', () => {
      const result = _.isEmptyDir('./test/tmp')
      expect(result).to.be.true
    })

    it('should return false when folder is not empty', () => {
      const result = _.isEmptyDir('./test')
      expect(result).to.be.false
    })
  })
})
