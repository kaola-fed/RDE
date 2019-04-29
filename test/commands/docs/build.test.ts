import {expect} from 'chai'
import {exec} from 'child_process'
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
let CmdDocsBuild: any

describe('docs:build', () => {
  before(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('./test/run')

    sandbox.stub(inquirer, 'prompt').resolves({framework: 'vue', byExtend: false})

    await CmdCreate.run([rdtName])

    CmdDocsBuild = require(resolve(cmdDir, './docs/build.ts')).default

    await CmdDocsBuild.run([])
  })

  after(() => {
    process.chdir(originCwd)
    sandbox.restore()
  })

  it('test', () => {
    expect(true).to.be.true
  })
})
