import {assert, expect} from 'chai'
import {exec} from 'child_process'
import cli from 'cli-ux'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import * as path from 'path'
import * as sinon from 'sinon'
import * as util from 'util'

const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()

const {resolve} = path
const originCwd = process.cwd()
const rdtName = '@rde-pro/rdt-vue-starter'
const projectName = 'demo.project'
const cmdDir = resolve('./src/commands')
const projectDir = resolve('./test/run/', projectName)

describe('rde serve', () => {
  before(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('test/run')

    // step1: rde create project
    const PromptStub = async () => rdtName
    sandbox.stub(inquirer, 'prompt').resolves({framework: 'vue'})
    sandbox.stub(cli, 'prompt').get(() => PromptStub)

    const CmdCreate = require(resolve(cmdDir, 'create')).default
    await CmdCreate.run([projectName])

    // step2: cd project && rde serve
    const CmdServe = require(resolve(cmdDir, 'serve')).default
    await CmdServe.run([])
  })

  after(async () => {
    process.chdir(originCwd)

    sandbox.restore()
  })

  it('should success if rde.app.js does provide required render prop', async () => {
    const {template, suites} = require(resolve(projectDir, 'rde.app.js'))

    expect(template.name).to.equal(`${rdtName}`)
    expect(suites).to.be.an.instanceOf(Array)
    assert.isOk(fs.existsSync(resolve(projectDir, '.rde')), 'runtimeDir is existed')
  })
})
