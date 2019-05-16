import {expect} from 'chai'
import {exec} from 'child_process'
import * as enquirer from 'enquirer'
import * as fs from 'fs'
import * as path from 'path'
import * as sinon from 'sinon'
import * as util from 'util'

import conf from '../../src/services/conf'
import docker from '../../src/services/docker'
import _ from '../../src/util'

const originCwd = process.cwd()
const {resolve} = path
const asyncExec = util.promisify(exec)
const sandbox = sinon.createSandbox()
const {RdTypes} = conf

const framework = 'vue'
const project = 'demo-app'
const cmdDir = resolve(__dirname, '../../src/commands')
const projectDir = resolve(__dirname, '../.tmp/', project)

let CmdCreate: any = null
let CmdLint: any = null
let CmdRun: any = null
let rdType = RdTypes.Application

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

describe('app', async () => {
  before(async () => {
    sandbox.stub(enquirer, 'prompt').get(() => PromptStub)
    CmdCreate = _.ensureRequire(resolve(cmdDir, 'create.ts')).default

    await asyncExec('mkdir -p ./test/.tmp')
    process.chdir('test/.tmp')

    await CmdCreate.run([])
  })

  after(async () => {
    sandbox.restore()

    process.chdir(originCwd)
    await asyncExec(`rm -rf ./test/.tmp/${project}`)
  })

  describe('create', async () => {
    it('should create a dir called app', async () => {
      const appPath = resolve(projectDir, 'app')
      expect(fs.existsSync(appPath)).to.be.true
    })

    it('should create a file called rda.config.js', async () => {
      const confPath = resolve(projectDir, 'rda.config.js')
      expect(fs.existsSync(confPath)).to.be.true
    })

    it('should create an readme.md file', async () => {
      const readMe = resolve(projectDir, 'README.md')
      expect(fs.existsSync(readMe)).to.be.true
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
        expect(fake.callCount).equal(1)
      } finally {
        process.chdir('../')
      }
    })

    describe('rda.config.js', async () => {
      let confPath = null
      let rdaConf = null
      let container = null
      let docker = null
      let suites = null

      before(async () => {
        confPath = resolve(projectDir, 'rda.config.js')
        rdaConf = _.ensureRequire(confPath)
        container = rdaConf.container
        docker = rdaConf.docker
        suites = rdaConf.suites
      })

      it('should contain container prop with name and docs value', async () => {
        const defaultRdc = conf.frameworks[framework].rdcStarter
        expect(container.name).to.equal(`${defaultRdc}:latest`)
        expect(container.docs.length).is.greaterThan(0)
      })

      it('should contain docker prop with ports value', async () => {
        expect(docker.ports.length).is.greaterThan(0)
      })

      it('should contain an empty suites prop', async () => {
        expect(suites.length).to.equal(0)
      })
    })
  })

  describe('run', async () => {
    const appImg = `dev-${project}`

    before(async () => {
      process.chdir(projectDir)
      CmdRun = _.ensureRequire(resolve(cmdDir, 'run.ts')).default

      // remove created images previously
      if (await docker.imageExist(appImg)) {
        // it will not await till the cmd end
        // await asyncExec(`docker rmi $(docker images ${appImg} -q)`)
      }
    })

    it('should throw error if no config file found', async () => {
      const fake = sinon.fake()
      await asyncExec('mv rda.config.js rda.config.js_backup')

      try {
        await CmdRun.run(['lint'])
        fake()
      } catch (e) {
        if (e) {}
      } finally {
        expect(fake.callCount).to.equal(0)
        await asyncExec('mv rda.config.js_backup rda.config.js')
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

    it('should create an image called dev-appname', async () => {
      const exist = await docker.imageExist(appImg)
      expect(exist).to.be.true
    })

    it('should create node_modules dir at docker path /usr/rde', async () => {
      const fake = sinon.fake()
      try {
        await asyncExec(`docker run --rm ${appImg} ls /usr/rde/node_modules`)
        fake()
      } catch (e) {
        if (e) {}
      } finally {
        expect(fake.callCount).to.equal(1)
      }
    })

    it('should mount app dir and rda.config.js file to rdc dir inside docker', async () => {
      const composePath = resolve(projectDir, '.cache', 'docker-compose.yml')
      const text = fs.readFileSync(composePath, 'utf-8')

      const regexp = /\.\.\/app:\/usr\/rde\/rdebase\/rdc-vue-starter\/app/gm
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
})
