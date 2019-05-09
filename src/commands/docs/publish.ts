// import * as browserSync from 'browser-sync'
import * as standardVersion from 'standard-version'
import BaseDocs from '../../base/docs'
import conf from '../../services/conf'
// import Watcher from '../../services/watcher'

export default class DocsPublish extends BaseDocs {
  // public static examples = [
  //   '$ rde docs:serve',
  // ]

  public async run() {
    await this.generateChangelog();

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

  public async generateChangelog() {
    const outputPath = `${conf.docsDir}/CHANGELOG.md`;
    await standardVersion({
      infile: outputPath,
      changelogHeader: ' ',
      template: 'ss.hjs',
      issueUrlFormat: '{{issues}}/{{id}}'
    }).then(() => {
      console.log(`generate successfully: ${outputPath}`);
    }).catch(err => {
        console.error(`generate changelog file failed with message: ${err.message}`)
    })
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
