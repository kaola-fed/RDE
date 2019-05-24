import {expect} from 'chai'
import {exec} from 'child_process'
import * as enquirer from 'enquirer'
import * as fs from 'fs'
import * as path from 'path'
import * as sinon from 'sinon'
import * as util from 'util'

import dockerRunCore from '../../src/core/docker.run'
import conf from '../../src/services/conf'
import docker from '../../src/services/docker'
import Watcher from '../../src/services/watcher'
import _ from '../../src/util'

const originCwd = process.cwd()
const {resolve} = path
const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()
const {RdTypes} = conf

const framework = 'vue'
const project = 'demo-container'
const cmdDir = resolve(__dirname, '../../src/commands')
const projectDir = resolve(__dirname, '../.tmp/', project)

let CmdCreate: any = null
let CmdLint: any = null
let CmdRun: any = null
let CmdDockerRun: any = null
let rdType = RdTypes.Container

const PromptStub = question => {
  if (question instanceof Array) {
    return {
      type: rdType,
      framework,
    }
  }

  if (question.name === 'name') {
    return {
      name: project
    }
  }

  if (question.name === 'rdcName') {
    return {
      rdcName: conf.frameworks[framework].rdcStarter
    }
  }

  if (question.name === 'version') {
    return {
      version: 'latest'
    }
  }

  if (question.name === 'rdcRepo') {
    return {
      rdcRepo: 'rdebase/rdc-vue-starter'
    }
  }
}

describe('container', async () => {
  before(async () => {
    sandbox.stub(enquirer, 'prompt').get(() => PromptStub)
    CmdCreate = _.ensureRequire(resolve(cmdDir, 'update.ts.ts')).default

    await asyncExec('mkdir -p ./test/.tmp')
    process.chdir('test/.tmp')

    await CmdCreate.run([])
  })

  after(async () => {
    sandbox.restore()

    process.chdir(originCwd)
    await asyncExec(`rm -rf ./test/.tmp/${project}`)
  })

  describe('update.ts', async () => {
    it('should create app/template dir, and a rdc.config.js file', async () => {
      const appPath = resolve(projectDir, 'app')
      const tplPath = resolve(projectDir, 'template')
      const confPath = resolve(projectDir, 'rdc.config.js')

      expect(fs.existsSync(appPath)).to.be.true
      expect(fs.existsSync(tplPath)).to.be.true
      expect(fs.existsSync(confPath)).to.be.true
    })

    it('should create an readme.md file', async () => {
      const readme = resolve(projectDir, 'README.md')
      expect(fs.existsSync(readme)).to.be.true
    })

    it('should gen .gitignore file', async () => {
      const gitIgnoreFile = resolve(projectDir, '.gitignore')
      expect(fs.existsSync(gitIgnoreFile)).to.be.true
    })

    it('should gen pre-commit file in .git dir', async () => {
      const precommit = resolve(projectDir, '.git/hooks/pre-commit')
      expect(fs.existsSync(precommit)).to.be.true
    })

    it('should run rde lint without error', async () => {
      const fake = sinon.fake()
      try {
        process.chdir(projectDir)
        CmdLint = _.ensureRequire(resolve(cmdDir, 'lint.ts')).default
        await CmdLint.run([])
        fake()
      } catch (e) {
        expect(e).is.not.null
      } finally {
        expect(fake.callCount).equal(1)
        process.chdir('../')
      }
    })

    describe('should create a file called rdc.config.js', async () => {
      let rdcConf = null
      let framework = ''
      let docker = null
      let mappings = null

      before(async () => {
        rdcConf = _.ensureRequire(resolve(projectDir, 'rdc.config.js'))
        framework = rdcConf.framework
        docker = rdcConf.docker
        mappings = rdcConf.mappings
      })

      it('should contain framework prop', async () => {
        expect(framework).to.equal('vue')
      })

      it('should contain docker prop with tag', async () => {
        expect(docker.tag).to.exist
      })

      it('should contain docker prop with ports', async () => {
        expect(docker.ports).to.exist
      })

      it('should contain a empty mapping prop', async () => {
        expect(mappings.length).to.greaterThan(0)
      })
    })
  })

  describe('run', async () => {
    const rdcImg = `dev-${conf.frameworks[framework].rdcStarter}`

    before(async () => {
      process.chdir(projectDir)
      CmdRun = _.ensureRequire(resolve(cmdDir, 'run.ts')).default

      // remove created images previously
      if (await docker.imageExist(rdcImg)) {
        // it will not await till the cmd end
        // await asyncExec(`docker rmi $(docker images ${appImg} -q)`)
      }
    })

    it('should throw error if no config file found', async () => {
      const fake = sinon.fake()
      await asyncExec('mv rdc.config.js rdc.config.js_backup')

      try {
        await CmdRun.run(['lint'])
        fake()
      } catch (e) {
        if (e) {}
      } finally {
        expect(fake.callCount).to.equal(0)
        await asyncExec('mv rdc.config.js_backup rdc.config.js')
      }
    })

    it('should create .cache dir with Dockerfile, docker-compose.yml, package.json, .cache file', async () => {
      const cachePath = resolve(projectDir, '.cache')
      const dockerfilePath = resolve(cachePath, 'Dockerfile')
      const dockerComposePath = resolve(cachePath, 'docker-compose.yml')
      const pkgJsonPath = resolve(cachePath, 'package.json')
      const cacheFilePath = resolve(cachePath, '.cache')

      expect(fs.existsSync(cachePath)).to.be.true
      expect(fs.existsSync(dockerfilePath)).to.be.true
      expect(fs.existsSync(dockerComposePath)).to.be.true
      expect(fs.existsSync(pkgJsonPath)).to.be.true
      expect(fs.existsSync(cacheFilePath)).to.be.true
    })

    it('should create an image called dev-rdcname', async () => {
      const exist = await docker.imageExist(rdcImg)
      expect(exist).to.be.true
    })

    it('should create node_modules dir at docker path /usr/rde', async () => {
      const fake = sinon.fake()
      try {
        await asyncExec(`docker run --rm ${rdcImg} ls /usr/rde/node_modules`)
        fake()
      } catch (e) {
        if (e) {}
      } finally {
        expect(fake.callCount).to.equal(1)
      }
    })

    it('should mount template dir and rdc.config.js file to rdc dir inside docker', async () => {
      const composePath = resolve(projectDir, '.cache', 'docker-compose.yml')
      const text = fs.readFileSync(composePath, 'utf-8')

      const regexp = /\.\.\/template:\/usr\/rde\/rdebase\/rdc-vue-starter\/template/gm
      expect(regexp.test(text)).to.be.true
    })

    it('should create .rde dir in docker container', async () => {
      // docker commit a new image from running container, then inspect
    })

    describe('rebuild', async () => {
      it('should rebuild when local image not build', async () => {})
      it('should rebuild when local package.json in cache has changed', async () => {})
      it('should rebuild when rdc version changed if app', async () => {})
      it('should rebuild when rdc extends has changed if container', async () => {})
    })
  })

  describe('docker:run', async () => {
    before(async () => {
      process.chdir(projectDir)
      CmdDockerRun = _.ensureRequire(resolve(cmdDir, 'docker/run.ts')).default
      await CmdDockerRun.run([])
    })

    after(async () => {
      sandbox.restore()
    })

    it('should not regen .rde dir if .rde dir exist and rdtype is application', async () => {
      await asyncExec('echo 123 > rda.config.js')

      const stub = sandbox.stub(fs, 'existsSync')
      const appDir = resolve(`${conf.cwd}/app`)
      const spy = sandbox.spy(dockerRunCore.prototype, 'composeRdcChain')

      stub.withArgs(conf.appConfPath).returns(true)
      stub.withArgs(conf.rdcConfPath).returns(false)
      stub.withArgs(appDir).returns(true)
      stub.withArgs(conf.runtimeDir).returns(true)

      await CmdDockerRun.run([])
      expect(spy.callCount).to.equal(0)
      await asyncExec('rm rda.config.js')
      sandbox.restore()
    })

    it('should call watcher start if run with -w flag', async () => {
      let watchCalled = false
      sandbox.stub(Watcher.prototype, 'start').callsFake(() => {
        watchCalled = true
      })

      await CmdDockerRun.run(['-w'])
      expect(watchCalled).to.be.true
      sandbox.restore()
    })
  })
})
