import Command from '@oclif/command/lib/command'
import * as dirTree from 'directory-tree'
import * as fs from 'fs'
import * as MarkdownIt from 'markdown-it'
import * as markdownMeta from 'markdown-it-meta'
import * as path from 'path'
import * as copy from 'recursive-copy'
import * as rimraf from 'rimraf'
import * as through from 'through2'

import conf from './services/conf'
import {logger} from './services/logger'
import render from './services/render'

const {resolve} = path
const mdIt = new MarkdownIt()
mdIt.use(markdownMeta)

export default abstract class extends Command {
  public isRdt: boolean

  public pages: DocPageRoute[]

  public get navs() {
    const navs = [
      {title: 'Guide', url: '/index.html'},
      {title: 'FAQ', url: '/FAQ.html'},
      {title: 'ChangeLog', url: '/rde/changelog.html'},
    ]

    if (this.isRdt) {
      const nav = {title: 'Cheat Sheet', url: '/rde/cheat.sheet.html'}
      navs.splice(1, 0, nav)
      return navs
    }

    return navs
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
          const content = mdIt.render(chunk.toString())

          const {loadTemplate: load} = render
          const index = load('docs/index')
          const style = load('docs/style')
          const layout = load('docs/layout')

          const output = render.render(index, {
            title: 'RDE Suite',
            content,
            navs: JSON.stringify(this.navs),
            pages: JSON.stringify(this.pages),
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

    if (!fs.existsSync(conf.docsDir)) {
      throw Error('cannot find _docs dir, please provide')
    }

    this.pages = this.getPages()

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

  public getPages() {
    const pages: DocPageRoute[] = []

    const files = dirTree(conf.docsDir, {
      extensions: /\.md$/,
      exclude: /^_docs\/[^\/]+\/(?!(.*\.md$))+/,
    })

    files.children.forEach(file => {
      if (file.type === 'file') {
        let content = fs.readFileSync(file.path).toString()
        const {meta = {}} = mdIt.render(content)

        pages.push({
          title: meta.title || file.name,
          url: `/${file.name.slice(0, -3)}.html`
        })
      }

      if (file.type === 'directory') {
        let category
        const page = {
          title: file.name,
          children: file.children.map(child => {
            let content = fs.readFileSync(child.path).toString()
            const {meta = {}} = mdIt.render(content)

            if (meta.category) {
              category = meta.category
            }

            return {
              title: meta.title || child.name,
              url: `/${file.name}/${child.name.slice(0, -3)}.html`
            }
          })
        }
        page.title = category || file.name
        pages.push(page)
      }
    })

    return pages
  }

  public async render(): Promise<any> {
    const {docsDir, docsPagesDir} = conf

    await copy(docsDir, docsPagesDir, this.option)
  }
}
