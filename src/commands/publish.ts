import {flags} from '@oclif/command'
import * as semver from 'semver'

import Base from '../base'
import conf from '../services/conf'
import docker from '../services/docker'
import {debug, logger} from '../services/logger'
import {MCOMMON} from '../services/message'
import render from '../services/render'
import {validateRdc} from '../services/validate'

export default class Publish extends Base {
  public static examples = [
    '$ rde publish -t <semver-like version>',
    '$ rde publish -i prerelease --preid beta',
    '$ rde publish --preid beta',
  ]

  public static flags = {
    ...Base.flags,
    increment: flags.string({
      char: 'i',
      description: `Increment a version by the specified level.
        Level can be one of: major, minor, patch, premajor, preminor,
        prepatch, or prerelease.  Default level is \'patch\'. Only one version may be specified.`,
      required: false,
    }),
    preid: flags.string({
      description: 'Identifier to be used to prefix premajor, preminor, prepatch or prerelease version increments.',
      required: false,
    }),
    tag: flags.string({
      char: 't',
      description: 'as your image tag for pushing to docker hub, you should use increment just in case',
      required: false,
    }),
  }

  public level: string

  public preid: string

  public tag: string

  public rdcConf: RdcConf

  public rdc: string

  public async preInit() {
    const {flags} = this.parse(Publish)
    this.tag = flags.tag
    this.level = flags.increment
    this.preid = flags.preid

    if (!this.level && !this.tag && !this.preid) {
      throw Error(MCOMMON.UNRECOGNIZED_VERSION_FLAG)
    }

    if (this.tag === 'latest') {
      throw Error(MCOMMON.WRONG_PUBLISH_TAG)
    }

    this.rdcConf = await validateRdc(true)
    return flags
  }

  public async initialize() {
    const {docker: dockerConf} = this.rdcConf
    this.rdc = dockerConf.tag

    await docker.genDockerFile4Publish(
      `${conf.dockerRdcDir}`,
      this.rdcConf.extends || 'node:latest',
      conf.localCacheDir,
    )
  }

  public async run() {
    const arr = this.rdc.split(':')
    const name = arr[0]

    let version = arr[1]
    if (this.preid) {
      this.level = this.level || 'prerelease'
      version = semver.inc(version, this.level, this.preid)
    } else if (this.level) {
      version = semver.inc(version, this.level)
    } else if (this.tag) {
      version = this.tag
    }

    debug(`publish version is ${version}`)

    const image = `${name}:${version}`
    await docker.build(image, conf.localCacheDir, true, 'Dockerfile', '..')
    await docker.tag(image, image)
    await docker.tag(image, `${name}:latest`)
    await docker.push(name, version)

    this.tag = image
  }

  public async postRun() {
    const {docker: dockerConf} = this.rdcConf
    dockerConf.tag = this.tag

    await render.renderTo('module', {
      obj: this.rdcConf,
    }, conf.rdcConfName, {overwrite: true})

    logger.log(`Published ${this.tag} successfully`)
  }
}
