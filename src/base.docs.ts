import Command from '@oclif/command/lib/command'
import * as fs from 'fs'
import * as MarkdownIt from 'markdown-it'
import * as path from 'path'
import * as copy from 'recursive-copy'
import * as rimraf from 'rimraf'
import * as through from 'through2'

import conf from './services/conf'
import {logger} from './services/logger'
import render from './services/render'
import _ from './util'

const {resolve} = path
const mdIt = new MarkdownIt()

export default abstract class extends Command {
  public isRdt: boolean

  public get navs() {
    if (this.isRdt) {
      return [
        {title: '指南', url: '/index.html'},
        {title: 'Cheat Sheet', url: '/rde/cheat.sheet.html'},
        {title: 'FAQ', url: '/faq.html'},
        {title: 'ChangeLog', url: '/rde/changelog.html'},
      ]
    } else {
      return [
        {title: '指南', url: '/index.html'},
        {title: 'FAQ', url: '/FAQ.html'},
        {title: 'ChangeLog', url: '/rde/changelog.html'},
      ]
    }
  }

  public get option() {
    return {
      overwrite: true,

      rename(filePath) {
        if (filePath.endsWith('.md')) {
          return `${path.basename(filePath, '.md')}.html`
        }
        return filePath
      },

      transform: () => {
        return through((chunk, _enc, done) => {
          const page = mdIt.render(chunk.toString())

          const {loadTemplate: load} = render
          const index = load('docs/index')
          const style = load('docs/style')
          const layout = load('docs/layout')

          const output = render.render(index, {
            title: 'RDE Suite',
            page,
          }, ['<%', '%>'], {
            style,
            layout,
          })

          done(null, output)
        })
      }
    }
  }

  public async init() {
    const {name} = require(resolve(conf.cwd, './package.json'))

    if (!name.endsWith('-rdt') && !name.endsWith('-rds')) {
      throw Error('wrong package name format, please end it with -rdt or -rds')
    } else {
      this.isRdt = name.endsWith('-rdt')
    }

    const homepagePath = resolve(conf.docsDir, 'index.md')
    const faqPath = resolve(conf.docsDir, 'faq.md')

    if (!fs.existsSync(homepagePath) || !fs.existsSync(faqPath)) {
      throw Error('cannot find index.md or faq.md in your _docs dir, please provide')
    }

    await this.render()

    process.on('SIGINT', () => {
      rimraf.sync(conf.docsPagesDir)
      process.exit()
    })
  }

  public async postRun() {}

  public async catch(e) {
    logger.error(e.message)
    this.exit(1)
  }

  public async finally(e: any) {
    if (!e) {
      await this.postRun()
    }
  }

  public async render(): Promise<any> {
    const {docsDir, docsPagesDir} = conf

    await copy(docsDir, docsPagesDir, this.option)
  }
}
