import {expect} from 'chai'
import {exec} from 'child_process'
import cli from 'cli-ux'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import * as path from 'path'
import * as sinon from 'sinon'
import * as util from 'util'

const originCwd = process.cwd()
const {resolve} = path
const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()

const rdtName = 'test-rdt'
const cmdDir = resolve('./src/commands')

let CmdCreate: any = require(resolve(cmdDir, './template/create.ts')).default

describe('rde template:create', () => {
  describe('create using a starter', () => {
    before(async () => {
      await asyncExec('rm -rf ./test/run && mkdir ./test/run')
      process.chdir('./test/run')

      sandbox.stub(inquirer, 'prompt').resolves({framework: 'vue', byExtend: false})

      await CmdCreate.run([rdtName])
    })

    after(() => {
      process.chdir(originCwd)
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
    before(async () => {
      await asyncExec('rm -rf ./test/run && mkdir ./test/run')
      process.chdir('./test/run')
      sandbox.stub(inquirer, 'prompt').resolves({framework: 'vue', byExtend: true})
      const promptStub = async () => '@rede/rdt-vue-starter'
      sandbox.stub(cli, 'prompt').get(() => promptStub)

      await CmdCreate.run([rdtName])
    })

    after(() => {
      process.chdir(originCwd)
      sandbox.restore()
    })

    it('should has a proper project structure', () => {
      expect(fs.existsSync('node_modules')).to.be.true
      expect(fs.existsSync('README.md')).to.be.true
      expect(fs.existsSync('package.json')).to.be.true
      expect(fs.existsSync('rde.template.js')).to.be.true
    })
  })
})
