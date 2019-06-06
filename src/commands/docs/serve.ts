import * as browserSync from 'browser-sync'
import * as chokidar from 'chokidar'

import BaseDocs from '../../base/docs'
import conf from '../../services/conf'
import {TError, TStart} from '../../services/track'

export default class DocsServe extends BaseDocs {
  public static flags = {
    ...BaseDocs.flags,
  }

  public static examples = [
    '$ rde docs:serve',
  ]

  @TError({conf})
  @TStart
  public async run() {
    this.watchFiles()

    browserSync({
      server: conf.docsPagesDir,
      ui: {
        port: 4040,
      },
      watch: true,
      open: true,
    })
  }

  @TError({conf})
  @TStart
  public watchFiles() {
    const watcher = chokidar.watch(conf.docsDir, {
      interval: 300,
    })

    const handler = async () => {
      await this.init()
    }

    watcher
      .on('add', handler)
      .on('change', handler)
      .on('unlink', handler)
  }
}
