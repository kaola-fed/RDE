import {expect} from 'chai'
import {exec} from 'child_process'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import * as path from 'path'
import * as sinon from 'sinon'
import * as util from 'util'

const originCwd = process.cwd()
const {resolve} = path
const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()

const rdtName = 'rdt-demo-project'
const cmdDir = resolve('./src/commands')
// const rdtDir = resolve('./test/run/', rdtName)

let CmdCreate: any = require(resolve(cmdDir, './template/create.ts')).default

describe('rde template:create', () => {
  before(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('./test/run')
  })

  after(async () => {
    process.chdir(originCwd)
    // await asyncExec('rm -rf ./test/run')

    sandbox.restore()
  })

  describe('create using a starter', () => {
    before(async () => {
      sandbox.stub(inquirer, 'prompt').resolves({framework: 'vue', byExtend: false})

      await CmdCreate.run([rdtName])
    })

    after(() => {
      sandbox.restore()
    })

    it('should has a proper project structure', () => {
      expect(fs.existsSync('app')).to.be.true
      expect(fs.existsSync('template')).to.be.true
      expect(fs.existsSync('package.json')).to.be.true
      expect(fs.existsSync('rde.template.js')).to.be.true
    })
  })

  describe('create using extend a existing rdt package', () => {
    it('should right', () => {
      expect(true).to.be.true
    })
  })
})
