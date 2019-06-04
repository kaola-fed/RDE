import * as browserSync from 'browser-sync'
import * as chokidar from 'chokidar'
import * as path from 'path'
import * as copy from 'recursive-copy'

import BaseDocs from '../../base/docs'
import conf from '../../services/conf'
import {TError, TStart} from '../../services/track'

const {join} = path
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
    if (conf.rdType === conf.RdTypes.Container) {
      // await doc.generateChangelog()
      // await doc.generateCheatSheet()
    }

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
      await copy(
        conf.docsDir,
        join(conf.docsPagesDir),
        this.options,
      )
    }

    watcher
      .on('add', handler)
      .on('change', handler)
      .on('unlink', handler)
  }
}
