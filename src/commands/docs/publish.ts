// import * as browserSync from 'browser-sync'
import BaseDocs from '../../base/docs'
import doc from '../../services/doc'
// import Watcher from '../../services/watcher'

export default class DocsPublish extends BaseDocs {
  // public static examples = [
  //   '$ rde docs:serve',
  // ]

  public async run() {
    await doc.generateChangelog()
    await doc.generateCheatSheet()

    // this.watchFiles()

    // browserSync({
    //   server: conf.docsPagesDir,
    //   ui: {
    //     port: 4040,
    //   },
    //   watch: true,
    //   open: true,
    // })
  }

  // public watchFiles() {
  //   const mappings = [
  //     {
  //       from: conf.docsDir,
  //       to: `../${conf.docsPagesDir}`,
  //       option: this.option,
  //     },
  //   ]

  //   new Watcher(mappings).start()
  // }
}
