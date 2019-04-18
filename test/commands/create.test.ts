import {assert, expect} from 'chai'
import {exec} from 'child_process'
import cli from 'cli-ux'
import * as inquirer from 'inquirer'
import * as sinon from 'sinon'
import * as util from 'util'

const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()
const rdtName = '@rede/rdt-vue-starter'

let CmdCreate: any

describe('rde create', () => {
  beforeEach(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('test/run')

    const PromptStub = async () => rdtName
    sandbox.stub(inquirer, 'prompt').resolves({framework: 'vue'})
    sandbox.stub(cli, 'prompt').get(() => PromptStub)

    CmdCreate = require('../../src/commands/create').default
  })

  afterEach(async () => {
    process.chdir('../../../')
    // await asyncExec('rm -rf ./test/run')

    sandbox.restore()
  })

  it('should create a project named rde.project with proper config', async () => {
    await CmdCreate.run(['demo.project'])

    const {template, suites, readme} = require('../run/demo.project/rde.app.js')

    expect(template).to.equal(`${rdtName}`)

    assert.typeOf(suites, 'array', 'suites does not exist')
    assert.lengthOf(suites, 0, 'suites does not exist')
    assert.exists(readme, 'readme does not exist')
  })
})
