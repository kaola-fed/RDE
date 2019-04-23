import cli from 'cli-ux'
import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import * as liveServer from 'live-server'

import BaseDocs from '../../base.docs'
import conf from '../../services/conf'
import {logger} from '../../services/logger'
import Watcher from '../../services/watcher'

export default class DocsServe extends BaseDocs {
  public static examples = [
    '$ rde docs:serve',
  ]

  public async run() {
    this.watchFiles()

    liveServer.start({
      port: 4040,
      root: conf.docsPagesDir,
      open: true,
    })
  }

  public async postRun() {
    logger.star('Started server, listening port 4040')
    await cli.open('http://127.0.0.1:4040')
  }

  public watchFiles() {
    const mappings = [
      {
        from: conf.docsDir,
        to: `../${conf.docsPagesDir}`,
        option: this.option,
      },
    ]

    new Watcher(mappings).start()
  }
}
