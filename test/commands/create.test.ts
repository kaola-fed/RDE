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

const container = 'nupthale/rdc-vue-starter'
const project = 'demo.project'
const cmdDir = resolve('./src/commands')
const projectDir = resolve('./test/run/', project)

let CmdCreate: any

describe('rde create', () => {
  beforeEach(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('test/run')

    const PromptStub = async (question: string) => {
      if (question.includes('name of project')) {
        return project
      }

      if (question.includes('version of container')) {
        return 'latest'
      }

      return container
    }
    sandbox.stub(inquirer, 'prompt').resolves({framework: 'vue', type: 'application'})
    sandbox.stub(cli, 'prompt').get(() => PromptStub)

    CmdCreate = require(resolve(cmdDir, 'create.ts')).default
    // await CmdCreate.run(['--from', 'nupthale/rdc-vue-starter:latest'])
    await CmdCreate.run([])
  })

  afterEach(async () => {
    process.chdir(originCwd)

    sandbox.restore()
  })

  it('should create an app dir', () => {
    expect(fs.existsSync(resolve(projectDir, 'app'))).to.be.true
  })
})
