import {assert} from 'chai'
import {exec} from 'child_process'
import cli from 'cli-ux'
import * as sinon from 'sinon'
import * as util from 'util'

const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()
const rdtName = 'rdt-hello'

let CmdCreate: any

describe('rde template create', () => {
  before(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('test/run')

    const PromptStub = async () => rdtName
    sandbox.stub(cli, 'prompt').get(() => PromptStub)

    CmdCreate = require('../../../src/commands/template/create').default
  })

  after(async () => {
    process.chdir('../../../../')
    // await asyncExec('rm -rf ./test/run')

    sandbox.restore()
  })

  it('should create a project named rde.project with proper config', async () => {
    await CmdCreate.run(['rdt-hello'])

    const {docs, render, mapping} = require('../../run/rdt-hello/rde.template.js')

    assert.typeOf(mapping, 'array', 'mapping does not exist')
    assert.lengthOf(mapping, 0, 'mapping does not exist')
    assert.exists(docs, 'docs does not exist')
    assert.exists(render, 'render does not exist')
  })
})
