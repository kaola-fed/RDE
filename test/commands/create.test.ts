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

const rdtName = '@rde-pro/rdt-vue-starter'
const projectName = 'demo.project'
const cmdDir = resolve('./src/commands')
const projectDir = resolve('./test/run/', projectName)

let CmdCreate: any

describe('rde create', () => {
  beforeEach(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('test/run')

    const PromptStub = async () => rdtName
    sandbox.stub(inquirer, 'prompt').resolves({framework: 'vue'})
    sandbox.stub(cli, 'prompt').get(() => PromptStub)

    CmdCreate = require(resolve(cmdDir, 'create.ts')).default
    await CmdCreate.run([projectName])
  })

  afterEach(async () => {
    process.chdir(originCwd)
    // await asyncExec('rm -rf ./test/run')

    sandbox.restore()
  })

  it('should create an app dir', () => {
    expect(fs.existsSync(resolve(projectDir, 'app'))).to.be.true
  })

  it('should create an package.json and install rdt pkg', () => {
    const json = require(resolve(projectDir, 'package.json'))
    expect(json.name).equals(projectName)
    expect(json.devDependencies[rdtName]).to.exist
  })

  it('should create rde.app.js', async () => {
    const {template, suites} = require(resolve(projectDir, 'rde.app.js'))

    expect(template.name).to.equal(`${rdtName}`)
    expect(suites).to.be.an.instanceOf(Array)
  })
})
