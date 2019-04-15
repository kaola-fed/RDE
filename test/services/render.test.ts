import {expect} from 'chai'
import {exec} from 'child_process'
import * as path from 'path'
import * as util from 'util'

import render from '../../src/services/render'

const asyncExec = util.promisify(exec)

describe('render', () => {
  describe('renderTo', () => {
    before(async () => {
      await asyncExec('cd test && mkdir run')
    })

    after(async () => {
      await asyncExec('rm -rf test/run')
    })

    it('should render rde.app.mustache to rde.app.js', async () => {
      await render.renderTo('rde.app', {
        templateName: 'testName',
      }, './test/run/rde.app.js')

      const conf = require(path.resolve(process.cwd(), './test/run/rde.app.js'))
      expect(conf.template).to.equal('testName')
    })

    it('should render all files inside a dir to dest', async () => {
      await render.renderDir('src/mustaches', {
        templateName: 'allDir',
      }, ['.mustache'], './test/run')
    })
  })
})
