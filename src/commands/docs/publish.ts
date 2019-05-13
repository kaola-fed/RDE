// import * as browserSync from 'browser-sync'
import BaseDocs from '../../base/docs'
import conf from '../../services/conf'
import doc from '../../services/doc';
// import Watcher from '../../services/watcher'

export default class DocsPublish extends BaseDocs {
  // public static examples = [
  //   '$ rde docs:serve',
  // ]

  public async run() {
    // await this.generateChangelog();
    // await doc.generateChangelog();
    await doc.generateCheatSheet();

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

  // public async generateChangelog() {
  //   const outputPath = `${conf.docsDir}/CHANGELOG.md`;
  //   await standardVersion({
  //     infile: outputPath,
  //     changelogHeader: ' ',
  //     template: 'ss.hjs',
  //     issueUrlFormat: '{{issues}}/{{id}}'
  //   }).then(() => {
  //     console.log(`generate successfully: ${outputPath}`);
  //   }).catch(err => {
  //       console.error(`generate changelog file failed with message: ${err.message}`)
  //   })
  // }

  // public async generateCheatSheet() {
  //   const outputPath = `${conf.docsDir}/CHEATSHEET.md`;


  // }

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
