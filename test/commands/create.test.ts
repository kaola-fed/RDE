import {expect} from 'chai'
import {exec} from 'child_process'
import cli from 'cli-ux'
import * as sinon from 'sinon'
import * as util from 'util'

const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()

describe('rde create', () => {
  before(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('test/run')
    // @ts-ignore
    const CmdCreate = require('../../src/commands/create').default

    const PromptStub = async () => 'vuecli-basic'
    sandbox.stub(cli, 'prompt').get(() => PromptStub)

    await CmdCreate.run(['app.name'])
  })

  after(async () => {
    process.chdir('../../')
    await asyncExec('rm -rf ./test/run')

    sandbox.restore()
  })

  it('should start', async () => {
    expect(true).to.be.true
  })
})
