import * as browserSync from 'browser-sync'
import * as path from 'path'

import BaseDocs from '../../base/docs'
import conf from '../../services/conf'
import Watcher from '../../services/watcher'

const {join} = path
export default class DocsServe extends BaseDocs {
  public static flags = {
    ...BaseDocs.flags,
  }

  public static examples = [
    '$ rde docs:serve',
  ]

  public async run() {
    this.watchFiles()

    browserSync({
      server: conf.docsPagesDir,
      ui: {
        port: 4040,
      },
      watch: true,
      open: false,
    })
  }

  public watchFiles() {
    const mappings = [
      {
        from: conf.docsDir,
        to: join('..', conf.docsPagesDir),
        options: this.options,
      },
    ]

    new Watcher(mappings).start()
  }
}
