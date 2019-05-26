import * as path from 'path'

import _ from '../util'

import conf from './conf'
import log, {debug} from './logger'
import render from './render'

class Docker {
  @log('Pulling image from docker hub...')
  public async pull(image: string) {
    await _.asyncExec(`docker pull ${image}`)
  }

  @log('Copying files from image...')
  public async copy(image: string, mappings: any[]) {
    if (await this.containerExist('rde-staged')) {
      await _.asyncExec('docker container rm /rde-staged')
    }

    await _.asyncExec(`docker create -it --name rde-staged ${image} bash`)
    for (const mapping of mappings) {
      await _.asyncExec(`mkdir -p ${mapping.to}`)
      await _.asyncExec(`docker cp rde-staged:${mapping.from} ${mapping.to}`)
    }

    await _.asyncExec('docker rm -fv rde-staged')
  }

  public async imageExist(name) {
    try {
      await _.asyncExec(`docker inspect --type=image ${name}`)
      return true
    } catch (e) {
      if (e) {}
      return false
    }
  }

  public async containerExist(name) {
    try {
      await _.asyncExec(`docker ps -a | grep ${name}`)
      return true
    } catch (e) {
      if (e) {}
      return false
    }
  }

  public async build(tag, cwd, noCache = false, dockerFile = 'Dockerfile', context = '.') {
    let args = ['build', '-t', tag, '-f', dockerFile, context]
    if (noCache) {
      args.splice(1, 0, '--no-cache')
    }

    debug(`cwd ${cwd}`)
    debug(`docker ${args.join(' ')}`)

    await _.asyncSpawn('docker', args, {
      cwd,
    })

    await _.asyncExec('rm .dockerignore')
    await _.asyncExec('docker image prune -f')
  }

  public async tag(oldtag, newtag) {
    await _.asyncSpawn('docker', ['tag', oldtag, newtag])
  }

  @log('Pushing image to docker hub...')
  public async push(name, version) {
    await _.asyncSpawn('docker', ['push', `${name}:${version}`])
    await _.asyncSpawn('docker', ['push', `${name}:latest`])
  }

  @log('Generating docker files...')
  public async genDockerFile(workDir, from, dir, isApp) {
    // gen dockerfile
    await render.renderTo('docker/.dockerignore', {}, '.dockerignore', {
      overwrite: true,
    })

    await render.renderTo('docker/Dockerfile', {
      from,
      workDir,
      dockerWorkDirRoot: conf.dockerWorkDirRoot,
      isApp,
    }, `${dir}/Dockerfile`, {
      overwrite: true,
    })
  }

  @log('Generating Dockerfile...')
  public async genDockerFile4Publish(workDir, from, dir) {
    // gen dockerfile
    await render.renderTo('docker/.dockerignore', {}, '.dockerignore', {
      overwrite: true,
    })

    await render.renderTo('docker/Dockerfile.publish', {
      from,
      workDir,
    }, `${dir}/Dockerfile`, {
      overwrite: true,
    })
  }

  @log('Generating docker-compose.yml...')
  public async genDockerCompose(
    workDir,
    cmd,
    ports,
    watch,
    tag,
    dir,
    isApp = false,
    isBuild = false,
  ) {
    if (!tag) {
      const name = path.basename(conf.cwd)
      tag = `${name}:latest`
    }

    await render.renderTo('docker/docker-compose', {
      workDir,
      cmd,
      ports,
      watch,
      tag,
      isApp,
      isBuild,
    }, `${dir}/docker-compose.yml`, {
      overwrite: true,
    })
  }
}

export default new Docker()
