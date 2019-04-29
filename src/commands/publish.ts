import {flags} from '@oclif/command'

import Base from '../base'
import conf from '../services/conf'
import docker from '../services/docker'
import {logger} from '../services/logger'
import render from '../services/render'
import {validateRdc} from '../services/validate'

export default class Publish extends Base {
  public static examples = [
    '$ rde publish',
  ]

  public static flags = {
    ...Base.flags,
    tag: flags.string({
      char: 't',
      description: 'as your image tag for pushing to docker hub',
      required: true,
    })
  }

  public tag: string

  public rdcConf: RdcConf

  public async preInit() {
    const {flags} = this.parse(Publish)
    this.tag = flags.tag

    if (this.tag === 'latest') {
      throw Error('rde will automatic add latest for you, please use semver-like tag')
    }

    await validateRdc(true)
    return flags
  }

  public async initialize() {
    const {RdTypes} = conf

    await docker.genDockerFile(
      RdTypes.Container,
      this.rdcConf.extends || 'node:latest',
      conf.tmpDir,
    )
  }

  public async run() {
    const {docker: dockerConf} = this.rdcConf
    const name = dockerConf.tag.split(':')[0]

    await docker.tag(`docker tag ${name} ${name}:${this.tag}`)
    await docker.tag(`docker tag ${name} ${name}:latest`)

    await docker.push(name)

    this.tag = `${name}:${this.tag}`
  }

  public async postRun() {
    const {docker: dockerConf} = this.rdcConf
    dockerConf.tag = this.tag

    await render.renderTo('module', {
      obj: this.rdcConf,
    }, conf.rdcConfName, {overwrite: true})

    logger.star('Docker tag has been updated successfully')
  }
}
