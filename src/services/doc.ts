import * as createHTML from 'create-html'
import * as fs from 'fs'
import * as readPkgJson from 'read-package-json'
import * as standardVersion from 'standard-version'

import conf from './conf'
import mapping from './mapping'

export default {
  get lintFiles() {
    // return ['.eslintrc', '.eslintrc.js', 'tsconfig.json', 'tslint.json', 'ddd.json']
    return ['.eslintrc.js', 'tsconfig.json']
  },

  async getPkgData() {
    return new Promise(resolve => {
      readPkgJson(`${conf.cwd}/template/package.json`, console.log, false, (err, data) => resolve(err ? {} : data))
    })
  },

  getLintData() {
    return this.lintFiles.reduce((obj, val) => {
      try {
        const data = require(`${conf.cwd}/template/${val}`)
        return {...obj, [val]: data}
      } catch {
        return {...obj}
      }
    }, {})
  },

  parseNpmLink(name) {
    const prefix = 'https://www.npmjs.com/package'
    if (/^plugin:(.*)\/recommended$/.test(name)) {
      return `${prefix}/eslint-plugin-${name.match(/^plugin:(.*)\/recommended$/)[1]}`
    }
    return `${prefix}/${name.split('/')[0]}`
  },

  renderTable(data, title) {
    let content = ''
    for (const [key , value] of Object.entries(data)) {
      if (value.constructor === Object) {
        content += `<tr><td>${key}</td><td>${this.renderTable(value)}</td></tr>`
      } else if (value.constructor === Array) {
        // 生成plugins、extends数组对象的文档链接
        if (['plugins', 'extends'].includes(key)) {
          const subContent = (value as any).map(i => `<a href="${this.parseNpmLink(i)}" target="_blank">${i}</a><br>`)
          content += `<tr><td>${key}</td><td>${subContent.join('')}</td></tr>`
        } else {
          const subContent = (value as any).map(i => {
            return i.constructor === Object ? this.renderTable(i) : `${JSON.stringify(i)}<br>`
          })
          content += `<tr><td>${key}</td><td>${subContent.join('')}</td></tr>`
        }
      } else {
        content += `<tr><td>${key}</td><td>${JSON.stringify(value)}</td></tr>`
      }
    }
    return title ? `<table><caption>${title}</caption>${content}</table>`
    : `<table class="inner-table">${content}</table>`
  },

  async generateChangelog() {
    const outputPath = `${conf.docsDir}/CHANGELOG.md`
    await standardVersion({
      infile: outputPath,
      changelogHeader: ' ',
      // template: 'ss.hjs',
      // issueUrlFormat: '{{issues}}/{{id}}'
    }).then(() => {
      console.log(`generate successfully: ${outputPath}`)
    }).catch(err => {
      console.log(`generate changelog file failed with message: ${err.message}`)
    })
  },

  async generateCheatSheet() {
    const outputPath = `${conf.docsPagesDir}/cheatSheet.html`
    const data = {
      pkg: await this.getPkgData(),
      lint: this.getLintData(),
      mapping: mapping.getMappings()
    }
    let result = ''
    // 描述文件映射
    const mappingData = data.mapping.reduce((obj, val) => ({...obj, [val.from]: val.to}), {})
    result += this.renderTable(mappingData, '文件映射')
    // 描述package.json内容
    const {name, version, description, dependencies} = data.pkg
    result += this.renderTable({name, version, description, dependencies}, 'package.json')
    // 描述lint规则
    Object.keys(data.lint).forEach(i => {
      result += this.renderTable(data.lint[i], i)
    })

    const style = `
    table {
      width: 600px;
      margin: 0 auto;
      margin-top: 50px;
      border: 1px solid #000;
      border-collapse: collapse;
      background: white;
    }
    caption {
      height: 30px;
      line-height: 30px;
      background-color: #21534d;
      color: #fff;
    }
    tr {
      background-color: #fff;
      font-size: 15px;
    }
    tr:nth-child(even) {
      background-color: #d7e3e2;
    }
    td {
      max-width: 300px;
      padding-left: 10px;
      word-break: break-all;
    }
    .inner-table {
      width: 100%;
      margin: 0;
      border: none;
      border-left: 1px solid #fff;
      background: inherit;
    }
    `

    const html = createHTML({
      title: 'cheat sheet',
      head: `<meta name="description" content="RDE cheat sheet"><style>${style}</style>`,
      body: result,
      favicon: 'favicon.png'
    })

    fs.writeFile(outputPath, html, function (err) {
      if (err) console.log(err)
    })

  }

}
