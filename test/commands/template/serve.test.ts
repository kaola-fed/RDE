import {assert} from 'chai'
import {exec} from 'child_process'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import * as path from 'path'
import * as sinon from 'sinon'
import * as util from 'util'

const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()
const rdtName = 'test-rdt'

let CmdServe: any
const originCwd = process.cwd()

describe('rde template:serve', () => {
  before(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('test/run')

    sandbox.stub(inquirer, 'prompt').resolves({framework: 'vue', byExtend: false})

    const CmdCreate = require('../../../src/commands/template/create').default
    await CmdCreate.run([rdtName])
    CmdServe = require('../../../src/commands/template/serve').default
    await CmdServe.run([])
  })

  after(async () => {
    process.chdir(originCwd)

    sandbox.restore()
  })

  it('should run a template project', async () => {
    const runtimeDir = path.resolve(originCwd, `test/run/${rdtName}/.rde`)
    assert.isOk(fs.existsSync(runtimeDir), 'runtimDir is existed')
  })

})
