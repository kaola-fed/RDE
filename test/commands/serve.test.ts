import {assert} from 'chai'
import {exec} from 'child_process'
import cli from 'cli-ux'
import * as sinon from 'sinon'
import * as util from 'util'

const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()
const rdtName = 'vuecli-basic'

let CmdServe: any
let cmdServeIns: any

const originCwd = process.cwd()

describe('rde serve', () => {
  beforeEach(async () => {
    await asyncExec('rm -rf ./test/run && mkdir ./test/run')
    process.chdir('test/run')

    const PromptStub = async () => rdtName
    sandbox.stub(cli, 'prompt').get(() => PromptStub)

    const CmdCreate = require('../../src/commands/create').default
    await CmdCreate.run(['rde.project'])

    CmdServe = require('../../src/commands/serve').default
    cmdServeIns = new CmdServe([], {
      scopedEnvVarKey() {
        return true
      }
    })
  })

  afterEach(async () => {
    process.chdir(originCwd)
    await asyncExec('rm -rf ./test/run')

    sandbox.restore()
  })

  describe('before run', () => {
    it('should fail if rde.app.js does not provide required render prop', async () => {
      sandbox.stub(cmdServeIns, 'run').resolves()
      sandbox.stub(cmdServeIns, 'validateAppRender').throws('error')

      try {
        await cmdServeIns._run()
      } catch (e) {
        assert.exists(e, 'should throw an error')
      }
    })

    it('should success if rde.app.js does provide required render prop', async () => {
      sandbox.stub(cmdServeIns, 'run').resolves()
      sandbox.stub(cmdServeIns, 'validateAppRender').returns(true)

      await cmdServeIns._run()
    })
  })

  // describe('run with docker mode', () => {
  //   before(async () => {
  //     const cmdServeDockerIns = new CmdServe(['-d'], {
  //       scopedEnvVarKey() {
  //         return true
  //       }
  //     })
  //     await cmdServeDockerIns._run()
  //   })
  //
  //   it('should render rdtTemplate to .rde dir', async () => {
  //     expect(true).to.be.true
  //   })
  // })
})
