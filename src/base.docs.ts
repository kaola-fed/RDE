import Command from '@oclif/command/lib/command'
import glob from 'glob'

import conf from './services/conf'

export default abstract class extends Command {
  public isRdt: boolean

  public pages: DocPageRoute[]

  public navs: DocNavRoute[]

  public watch = false

  public async init() {
    const {name} = require('./package.json')

    if (!name.endsWith('-rdt') || !name.endsWith('-rds')) {
      throw Error('wrong package name format, please end it with -rdt or -rds')
    } else {
      this.isRdt = name.endsWith('-rdt')
    }

    // generate route from ./docs dir and integrated navs
    await this.genRoute()

    // render md to html
    await this.render()

    if (this.watch) {
      this.watchFiles()
    }
  }

  public async genRoute() {
    const files = glob.sync('**/*.md', {
      cwd: conf.docsDir
    })

    console.log(files)
  }

  public async render(): Promise<any> {}

  public watchFiles() {}
}
