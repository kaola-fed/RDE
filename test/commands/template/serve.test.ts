import {assert} from 'chai'
import {exec} from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as sinon from 'sinon'
import * as util from 'util'

const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()
const rdtName = 'rdt-hello'

let CmdServe: any
const originCwd = process.cwd()

describe('rde template:serve', () => {
  beforeEach(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('test/run')

    const CmdCreate = require('../../../src/commands/template/create').default
    await CmdCreate.run([rdtName])
    CmdServe = require('../../../src/commands/template/serve').default
  })

  afterEach(async () => {
    process.chdir(originCwd)
    // await asyncExec('rm -rf ./test/run')

    sandbox.restore()
  })
  it('should run a template project', async () => {
    await CmdServe.run([])
    const runtimeDir = path.resolve(originCwd, './test/run/rdt-hello/.rde')
    assert.isOk(fs.existsSync(runtimeDir), 'runtimDir is existed')
  })

})
