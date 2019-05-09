import * as browserSync from 'browser-sync'

import BaseDocs from '../../base/docs'
import conf from '../../services/conf'
import Watcher from '../../services/watcher'

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
        to: `../${conf.docsPagesDir}`,
        option: this.option,
      },
    ]

    new Watcher(mappings).start()
  }
}
